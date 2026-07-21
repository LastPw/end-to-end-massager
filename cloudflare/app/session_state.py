import re
import time
from typing import Dict, Optional, Tuple


_content_signatures: Dict[str, Dict[str, Tuple[str, float]]] = {}
_content_verdict: Dict[str, bool] = {}
_fingerprints: Dict[str, str] = {}
_device_signatures: Dict[str, str] = {}
_trap_hits: Dict[str, float] = {}
_recon_scores: Dict[str, int] = {}


def set_content_signature(session_id: str, path: str, signature: str) -> None:
    _content_signatures.setdefault(session_id, {})[path] = (signature, time.time())


def verify_content_signature(session_id: str, path: str, client_sig: str) -> bool:
    expected = _content_signatures.get(session_id, {}).get(path)
    if not expected:
        _content_verdict[session_id] = False
        return False
    ok = expected[0] == client_sig
    _content_verdict[session_id] = ok
    return ok


def get_content_verdict(session_id: str) -> Optional[bool]:
    return _content_verdict.get(session_id)


def update_fingerprint(session_id: str, fingerprint: str) -> bool:
    previous = _fingerprints.get(session_id)
    _fingerprints[session_id] = fingerprint
    if previous is None:
        return False
    return previous != fingerprint


def update_device_signature(session_id: str, device_sig: str) -> bool:
    previous = _device_signatures.get(session_id)
    _device_signatures[session_id] = device_sig
    if previous is None:
        return False
    return previous != device_sig


def trap_hit(key: str) -> None:
    _trap_hits[key] = time.time()


def is_trapped(key: str) -> bool:
    return key in _trap_hits


def recon_bump(key: str, weight: int = 1) -> int:
    _recon_scores[key] = _recon_scores.get(key, 0) + weight
    return _recon_scores[key]


def get_recon_score(key: str) -> int:
    return _recon_scores.get(key, 0)


def _djb2_hash(text: str) -> str:
    h = 5381
    for ch in text:
        h = (h * 33) ^ ord(ch)
    return format(h & 0xFFFFFFFF, "x")


def simple_text_signature(html: bytes) -> str:
    try:
        text = html.decode("utf-8", errors="ignore")
    except UnicodeDecodeError:
        return ""
    text = re.sub(r"<script.*?</script>", " ", text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r"<style.*?</style>", " ", text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    sample = text[:2000]
    return _djb2_hash(sample)
