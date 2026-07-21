import hashlib
import hmac
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Optional, Tuple

import joblib
import numpy as np
from fastapi import Request

from .behavior import extract_features
from .config import settings
from .ratelimit import SlidingWindowRateLimiter
from .session_state import (
    get_content_verdict,
    get_recon_score,
    is_trapped,
    recon_bump,
    update_fingerprint,
)
from .storage import fetch_bot_policy, fetch_geo_policy, fetch_ip_reputation, fetch_waf_rules


@dataclass
class Decision:
    action: str
    risk_score: float
    reason: str
    features: Dict[str, float]


_session_rate_limiter = SlidingWindowRateLimiter(settings.max_req_per_minute)
_ip_rate_limiter = SlidingWindowRateLimiter(settings.max_req_per_minute_ip)
_path_rate_limiters: Dict[str, SlidingWindowRateLimiter] = {}
_isoforest = None
_classifier = None
_semi_classifier = None
_temp_blocks: Dict[str, float] = {}

_PATH_LIMITS = {
    "/api/auth/login": 12,
    "/api/auth/signup": 8,
    "/api/admin/login": 6,
}


def _load_models() -> None:
    global _isoforest, _classifier, _semi_classifier
    model_dir = Path(settings.model_dir)
    isoforest_path = model_dir / "isoforest.joblib"
    classifier_path = model_dir / "classifier.joblib"
    semi_path = model_dir / "classifier_semi.joblib"
    if isoforest_path.exists():
        _isoforest = joblib.load(isoforest_path)
    if classifier_path.exists():
        _classifier = joblib.load(classifier_path)
    if semi_path.exists():
        _semi_classifier = joblib.load(semi_path)


def ensure_models_loaded() -> None:
    if _isoforest is None or _classifier is None or _semi_classifier is None:
        _load_models()


def _feature_vector(features: Dict[str, float]) -> np.ndarray:
    return np.array(
        [
            features["mouse_speed_avg"],
            features["mouse_speed_std"],
            features["click_interval_avg"],
            features["key_interval_avg"],
            features["event_count"],
            features["webdriver_flag"],
            features["scroll_speed_avg"],
            features["scroll_speed_std"],
            features["nav_count"],
            features["nav_unique_ratio"],
            features["nav_avg_dwell"],
            features["device_change"],
            features["fingerprint_shift"],
            features["content_mismatch"],
        ],
        dtype=np.float64,
    ).reshape(1, -1)


def _header_risk(request: Request) -> float:
    ua = request.headers.get("user-agent", "").lower()
    webdriver_flag = request.headers.get("x-webdriver", "0")
    if "headless" in ua or "selenium" in ua:
        return 0.7
    if webdriver_flag == "1":
        return 0.7
    if "nmap" in ua or "masscan" in ua:
        return 0.9
    return 0.0


def detect_scanner(request: Request) -> Optional[str]:
    ua = request.headers.get("user-agent", "").lower()
    if "nmap" in ua:
        return "nmap"
    if "masscan" in ua:
        return "masscan"
    if "nikto" in ua:
        return "nikto"
    return None


def _allowlist_ips() -> set[str]:
    return {ip.strip() for ip in settings.allowlist_ips.split(",") if ip.strip()}


def _blocklist_ips() -> set[str]:
    return {ip.strip() for ip in settings.blocklist_ips.split(",") if ip.strip()}


def _is_temporarily_blocked(key: str) -> bool:
    expires = _temp_blocks.get(key)
    if not expires:
        return False
    if time.time() > expires:
        _temp_blocks.pop(key, None)
        return False
    return True


def _temp_block(key: str) -> None:
    _temp_blocks[key] = time.time() + settings.block_ttl_seconds


_RECON_PATHS = [
    "/wp-admin",
    "/wp-login.php",
    "/.git",
    "/.env",
    "/admin.php",
    "/phpmyadmin",
    "/.hg",
    "/.svn",
    "/config.php",
]


def _fingerprint_from_features(features: Dict[str, float]) -> str:
    quantized = [
        round(features["mouse_speed_avg"], 2),
        round(features["mouse_speed_std"], 2),
        round(features["click_interval_avg"] / 50.0, 1),
        round(features["key_interval_avg"] / 50.0, 1),
        round(features["scroll_speed_avg"], 2),
        round(features["scroll_speed_std"], 2),
        round(features["nav_unique_ratio"], 2),
    ]
    raw = "|".join(str(v) for v in quantized)
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def waf_check(request: Request, body: bytes) -> Optional[str]:
    import re

    builtin_patterns = [
        (r"(?i)\bunion\b\s+select\b", "sqli-union"),
        (r"(?i)\bselect\b.+\bfrom\b", "sqli-select"),
        (r"(?i)\b(or|and)\b\s+\d+\s*=\s*\d+", "sqli-bool"),
        (r"(?i)\b(drop|alter|truncate)\b\s+(table|database)\b", "sqli-ddl"),
        (r"(?i)\bexec\b\s*\(", "sqli-exec"),
        (r"(?i)<\s*script\b", "xss-script"),
        (r"(?i)javascript\s*:", "xss-js"),
        (r"(?i)onerror\s*=", "xss-onerror"),
        (r"(?i)onload\s*=", "xss-onload"),
        (r"(?i)\.\./", "path-traversal"),
        (r"(?i)%2e%2e%2f", "path-traversal-enc"),
        (r"(?i)\bbase64_decode\b", "php-obfuscation"),
        (r"(?i)\beval\s*\(", "code-eval"),
    ]

    rules = [r for r in fetch_waf_rules() if r.get("enabled")]
    target = f"{request.url.path}?{request.url.query}".lower()
    for pattern, tag in builtin_patterns:
        if re.search(pattern, target):
            return f"builtin:{tag}"
    for rule in rules:
        try:
            pattern = re.compile(rule["pattern"])
        except re.error:
            continue
        if pattern.search(target):
            return f"waf-uri:{rule['id']}"
    if body:
        try:
            body_text = body.decode("utf-8", errors="ignore")
        except UnicodeDecodeError:
            body_text = ""
        for pattern, tag in builtin_patterns:
            if re.search(pattern, body_text):
                return f"builtin:{tag}"
        for rule in rules:
            try:
                pattern = re.compile(rule["pattern"])
            except re.error:
                continue
            if pattern.search(body_text):
                return f"waf-body:{rule['id']}"
    return None


def evaluate_request(request: Request, session_id: str, client_ip: str) -> Decision:
    ensure_models_loaded()
    country = (
        request.headers.get("cf-ipcountry")
        or request.headers.get("x-country")
        or ""
    ).upper()
    path = request.url.path.lower()
    limit = _PATH_LIMITS.get(path)
    if limit:
        limiter = _path_rate_limiters.setdefault(
            path, SlidingWindowRateLimiter(limit)
        )
        if not limiter.allow(client_ip):
            _temp_block(client_ip)
            return Decision(
                action="block",
                risk_score=0.9,
                reason=f"rate-path:{path}",
                features={},
            )
    for policy in fetch_geo_policy():
        if policy.get("country", "").upper() == country:
            action = policy.get("action", "").lower()
            if action == "block":
                return Decision(
                    action="block", risk_score=1.0, reason="geo-block", features={}
                )
            if action == "challenge":
                return Decision(
                    action="challenge",
                    risk_score=0.7,
                    reason="geo-challenge",
                    features={},
                )

    if client_ip in _allowlist_ips():
        return Decision(action="allow", risk_score=0.0, reason="allowlist", features={})
    if client_ip in _blocklist_ips():
        return Decision(action="block", risk_score=1.0, reason="blocklist", features={})
    if _is_temporarily_blocked(client_ip):
        return Decision(action="block", risk_score=1.0, reason="temp-block", features={})

    rep_map = {row["ip"]: int(row["score"]) for row in fetch_ip_reputation()}
    rep_score = rep_map.get(client_ip)
    if rep_score is not None:
        if rep_score <= -50:
            return Decision(action="block", risk_score=1.0, reason="ip-rep-block", features={})
        if rep_score <= -20:
            return Decision(
                action="challenge",
                risk_score=0.8,
                reason="ip-rep-challenge",
                features={},
            )

    if not _session_rate_limiter.allow(session_id):
        _temp_block(client_ip)
        return Decision(action="block", risk_score=0.95, reason="rate-session", features={})
    if not _ip_rate_limiter.allow(client_ip):
        _temp_block(client_ip)
        return Decision(action="block", risk_score=0.9, reason="rate-ip", features={})

    features = extract_features(session_id)
    features["fingerprint_shift"] = 0.0
    features["content_mismatch"] = 0.0

    content_verdict = get_content_verdict(session_id)
    if content_verdict is False:
        features["content_mismatch"] = 1.0

    fingerprint = _fingerprint_from_features(features)
    if update_fingerprint(session_id, fingerprint):
        features["fingerprint_shift"] = 1.0

    if any(path.startswith(p) for p in _RECON_PATHS):
        recon_bump(client_ip)

    vector = _feature_vector(features)
    risk = 0.0
    reasons = []

    if _isoforest is not None:
        anomaly_score = -float(_isoforest.score_samples(vector)[0])
        risk += min(anomaly_score / 2.0, 1.0)
        reasons.append("anomaly")

    if _classifier is not None:
        prob = float(_classifier.predict_proba(vector)[0][1])
        risk = max(risk, prob)
        reasons.append("classifier")

    if _semi_classifier is not None:
        prob = float(_semi_classifier.predict_proba(vector)[0][1])
        risk = max(risk, prob)
        reasons.append("semi")

    risk += _header_risk(request)
    risk = min(risk, 1.0)
    if rep_score is not None and rep_score > 0:
        risk = max(risk - min(rep_score / 200.0, 0.3), 0.0)

    if features["device_change"] > 0:
        risk = min(risk + 0.3, 1.0)
        reasons.append("device-change")
    if features["content_mismatch"] > 0:
        risk = min(risk + 0.4, 1.0)
        reasons.append("content-mismatch")
    if features["fingerprint_shift"] > 0:
        risk = min(risk + 0.3, 1.0)
        reasons.append("fingerprint-shift")

    if is_trapped(client_ip) or is_trapped(session_id):
        return Decision(
            action="block",
            risk_score=1.0,
            reason="trap-hit",
            features=features,
        )

    recon_score = get_recon_score(client_ip)
    if recon_score >= 3:
        _temp_block(client_ip)
        return Decision(
            action="block",
            risk_score=0.95,
            reason="recon-scan",
            features=features,
        )
    if recon_score == 2:
        return Decision(
            action="trap",
            risk_score=max(risk, 0.6),
            reason="recon-trap",
            features=features,
        )

    if features["event_count"] < 5:
        return Decision(
            action="challenge",
            risk_score=max(risk, 0.4),
            reason="low-signal",
            features=features,
        )

    policy = fetch_bot_policy()
    block_threshold = float(policy.get("block_threshold", 0.8))
    challenge_threshold = float(policy.get("challenge_threshold", 0.5))

    if risk >= block_threshold:
        _temp_block(client_ip)
        return Decision(
            action="block",
            risk_score=risk,
            reason=",".join(reasons) or "risk",
            features=features,
        )
    if risk >= challenge_threshold:
        return Decision(
            action="challenge",
            risk_score=risk,
            reason=",".join(reasons) or "risk",
            features=features,
        )
    return Decision(action="allow", risk_score=risk, reason="low-risk", features=features)


def build_challenge_token(session_id: str, ts: int) -> str:
    msg = f"{session_id}:{ts}".encode("utf-8")
    digest = hmac.new(
        settings.challenge_secret.encode("utf-8"), msg, hashlib.sha256
    ).hexdigest()
    return digest


def verify_challenge_token(session_id: str, ts: int, token: str) -> bool:
    if abs(int(time.time()) - ts) > settings.challenge_ttl_seconds:
        return False
    expected = build_challenge_token(session_id, ts)
    return hmac.compare_digest(expected, token)


def build_js_challenge(session_id: str, ts: int) -> str:
    msg = f"js:{session_id}:{ts}".encode("utf-8")
    digest = hmac.new(
        settings.challenge_secret.encode("utf-8"), msg, hashlib.sha256
    ).hexdigest()
    return digest


def verify_js_challenge(session_id: str, ts: int, token: str) -> bool:
    if abs(int(time.time()) - ts) > settings.challenge_ttl_seconds:
        return False
    expected = build_js_challenge(session_id, ts)
    return hmac.compare_digest(expected, token)
