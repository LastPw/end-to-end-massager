import base64
import binascii
import hmac
import json
import secrets
import time
from pathlib import Path
from typing import Dict, Optional

import httpx
from fastapi import Body, FastAPI, Header, Request, Response
from fastapi.responses import HTMLResponse, PlainTextResponse
from fastapi.staticfiles import StaticFiles
from jinja2 import Environment, FileSystemLoader

from .config import settings
from .ddos import AdaptiveDdosGuard
from .domains import check_verification, generate_token, is_valid_domain, normalize_domain
from .metrics import metrics_store
from .reporting import build_hourly_pdf
from .security import (
    build_challenge_token,
    build_js_challenge,
    detect_scanner,
    evaluate_request,
    verify_challenge_token,
    verify_js_challenge,
    waf_check,
)
from .session_state import (
    set_content_signature,
    simple_text_signature,
    trap_hit,
    update_device_signature,
    verify_content_signature,
)
from .storage import (
    fetch_domains,
    fetch_reports,
    fetch_reports_since,
    fetch_waf_rules,
    insert_waf_rule,
    update_waf_rule,
    delete_waf_rule,
    fetch_ip_reputation,
    upsert_ip_reputation,
    fetch_geo_policy,
    upsert_geo_policy,
    fetch_bot_policy,
    update_bot_policy,
    init_db,
    insert_decision,
    insert_events,
    insert_report,
    upsert_domain,
    update_domain_status,
)

app = FastAPI(title="Smart Security Gateway")
templates = Environment(loader=FileSystemLoader("app/templates"))
ddos_guard = AdaptiveDdosGuard(
    global_rpm=settings.ddos_global_rpm,
    ip_rpm=settings.ddos_ip_rpm,
    spike_multiplier=settings.ddos_spike_multiplier,
)

_SECURITY_HEADERS = {
    "Strict-Transport-Security": "max-age=15552000; includeSubDomains",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Content-Security-Policy": "default-src 'self'; img-src 'self' data:; media-src 'self' blob: data:; connect-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:;",
}


def _apply_security_headers(response: Response) -> None:
    for key, value in _SECURITY_HEADERS.items():
        response.headers.setdefault(key, value)


def _admin_unauthorized() -> PlainTextResponse:
    response = PlainTextResponse("Unauthorized", status_code=401)
    response.headers["WWW-Authenticate"] = 'Basic realm="Security Gateway Admin"'
    _apply_security_headers(response)
    return response


def _require_admin_auth(request: Request) -> Optional[Response]:
    username = settings.admin_basic_username
    password = settings.admin_basic_password
    if not username or not password:
        response = PlainTextResponse(
            "admin auth not configured",
            status_code=503,
        )
        _apply_security_headers(response)
        return response

    auth_header = request.headers.get("authorization", "")
    if not auth_header.startswith("Basic "):
        return _admin_unauthorized()

    try:
        decoded = base64.b64decode(auth_header[6:], validate=True).decode("utf-8")
    except (binascii.Error, UnicodeDecodeError):
        return _admin_unauthorized()

    provided_user, separator, provided_pass = decoded.partition(":")
    if not separator:
        return _admin_unauthorized()
    if not hmac.compare_digest(provided_user, username):
        return _admin_unauthorized()
    if not hmac.compare_digest(provided_pass, password):
        return _admin_unauthorized()
    return None


static_dir = Path("app/static")
app.mount("/static", StaticFiles(directory=static_dir), name="static")


@app.on_event("startup")
def _startup() -> None:
    init_db()


def _get_session_id(request: Request) -> str:
    session_id = request.cookies.get(settings.session_cookie_name)
    if not session_id:
        session_id = secrets.token_hex(16)
    return session_id


def _set_session_cookie(response: Response, session_id: str) -> None:
    response.set_cookie(
        settings.session_cookie_name,
        session_id,
        httponly=True,
        samesite="Lax",
    )
    _apply_security_headers(response)


@app.get("/health")
async def health(request: Request) -> Response:
    session_id = _get_session_id(request)
    response = PlainTextResponse("ok")
    _set_session_cookie(response, session_id)
    return response


@app.post("/api/behavior")
async def behavior_ingest(
    request: Request,
    response: Response,
    payload: Dict = Body(...),
    x_webdriver: Optional[str] = Header(default="0"),
) -> Dict[str, str]:
    session_id = _get_session_id(request)
    events = payload.get("events", [])
    for event in events:
        if "payload" in event and isinstance(event["payload"], dict):
            event["payload"]["webdriver"] = x_webdriver == "1"
            if event.get("type") == "device":
                device_payload = event["payload"]
                device_sig = "|".join(
                    str(device_payload.get(key, ""))
                    for key in ("w", "h", "tz", "lang", "hw", "mem", "platform")
                )
                if update_device_signature(session_id, device_sig):
                    device_payload["changed"] = True
        event["payload"] = json.dumps(event.get("payload", {}), separators=(",", ":"))
    insert_events(session_id, events)
    _set_session_cookie(response, session_id)
    return {"status": "ok", "session_id": session_id}


@app.post("/api/challenge")
async def challenge_verify(
    request: Request,
    response: Response,
    payload: Dict = Body(...),
) -> Dict[str, str]:
    session_id = _get_session_id(request)
    ts = int(payload.get("ts", 0))
    token = payload.get("token", "")
    if verify_challenge_token(session_id, ts, token):
        _set_session_cookie(response, session_id)
        return {"status": "pass"}
    _set_session_cookie(response, session_id)
    return {"status": "fail"}


@app.post("/api/content-check")
async def content_check(
    request: Request,
    response: Response,
    payload: Dict = Body(...),
) -> Dict[str, str]:
    session_id = _get_session_id(request)
    path = str(payload.get("path", "/"))
    sig = str(payload.get("sig", ""))
    ok = verify_content_signature(session_id, path, sig)
    _set_session_cookie(response, session_id)
    return {"status": "ok" if ok else "fail"}


@app.post("/api/js-challenge")
async def js_challenge_verify(
    request: Request,
    response: Response,
    payload: Dict = Body(...),
) -> Dict[str, str]:
    session_id = _get_session_id(request)
    ts = int(payload.get("ts", 0))
    token = payload.get("token", "")
    if verify_js_challenge(session_id, ts, token):
        _set_session_cookie(response, session_id)
        return {"status": "pass"}
    _set_session_cookie(response, session_id)
    return {"status": "fail"}

@app.get("/admin", response_class=HTMLResponse)
async def admin_dashboard(request: Request) -> HTMLResponse:
    denied = _require_admin_auth(request)
    if denied:
        return denied
    session_id = _get_session_id(request)
    template = templates.get_template("admin.html")
    html = template.render()
    response = HTMLResponse(html)
    _set_session_cookie(response, session_id)
    return response


@app.get("/admin/domains", response_class=HTMLResponse)
async def admin_domains(request: Request) -> HTMLResponse:
    denied = _require_admin_auth(request)
    if denied:
        return denied
    session_id = _get_session_id(request)
    template = templates.get_template("domains.html")
    html = template.render()
    response = HTMLResponse(html)
    _set_session_cookie(response, session_id)
    return response


@app.get("/admin/waf", response_class=HTMLResponse)
async def admin_waf(request: Request) -> HTMLResponse:
    denied = _require_admin_auth(request)
    if denied:
        return denied
    session_id = _get_session_id(request)
    template = templates.get_template("waf.html")
    html = template.render()
    response = HTMLResponse(html)
    _set_session_cookie(response, session_id)
    return response


@app.get("/admin/bot", response_class=HTMLResponse)
async def admin_bot(request: Request) -> HTMLResponse:
    denied = _require_admin_auth(request)
    if denied:
        return denied
    session_id = _get_session_id(request)
    template = templates.get_template("bot.html")
    html = template.render()
    response = HTMLResponse(html)
    _set_session_cookie(response, session_id)
    return response


@app.get("/admin/geo", response_class=HTMLResponse)
async def admin_geo(request: Request) -> HTMLResponse:
    denied = _require_admin_auth(request)
    if denied:
        return denied
    session_id = _get_session_id(request)
    template = templates.get_template("geo.html")
    html = template.render()
    response = HTMLResponse(html)
    _set_session_cookie(response, session_id)
    return response


@app.get("/admin/reports", response_class=HTMLResponse)
async def admin_reports(request: Request) -> HTMLResponse:
    denied = _require_admin_auth(request)
    if denied:
        return denied
    session_id = _get_session_id(request)
    template = templates.get_template("reports.html")
    html = template.render()
    response = HTMLResponse(html)
    _set_session_cookie(response, session_id)
    return response


@app.get("/admin/experiments", response_class=HTMLResponse)
async def admin_experiments(request: Request) -> HTMLResponse:
    denied = _require_admin_auth(request)
    if denied:
        return denied
    session_id = _get_session_id(request)
    template = templates.get_template("experiments.html")
    html = template.render()
    response = HTMLResponse(html)
    _set_session_cookie(response, session_id)
    return response


@app.get("/reports/eval", response_class=PlainTextResponse)
async def eval_report(request: Request) -> PlainTextResponse:
    denied = _require_admin_auth(request)
    if denied:
        return denied
    path = Path("docs/EVAL_REPORT.md")
    if not path.exists():
        return PlainTextResponse("not-found", status_code=404)
    return PlainTextResponse(path.read_text(encoding="utf-8"))


@app.get("/api/stats")
async def stats(request: Request) -> Dict[str, object]:
    denied = _require_admin_auth(request)
    if denied:
        return denied
    return {
        "snapshot": metrics_store.snapshot(),
        "series": metrics_store.series(),
        "actions": metrics_store.action_series(),
    }


@app.get("/api/domains")
async def list_domains(request: Request) -> Dict[str, object]:
    denied = _require_admin_auth(request)
    if denied:
        return denied
    return {"items": fetch_domains()}


@app.get("/api/waf")
async def list_waf_rules(request: Request) -> Dict[str, object]:
    denied = _require_admin_auth(request)
    if denied:
        return denied
    return {"items": fetch_waf_rules()}


@app.post("/api/waf/add")
async def add_waf_rule(request: Request, payload: Dict = Body(...)) -> Dict[str, str]:
    denied = _require_admin_auth(request)
    if denied:
        return denied
    pattern = str(payload.get("pattern", "")).strip()
    description = str(payload.get("description", "")).strip()
    enabled = bool(payload.get("enabled", True))
    if not pattern or not description:
        return {"status": "error", "message": "invalid-input"}
    insert_waf_rule(pattern, description, enabled)
    return {"status": "ok"}


@app.post("/api/waf/toggle")
async def toggle_waf_rule(request: Request, payload: Dict = Body(...)) -> Dict[str, str]:
    denied = _require_admin_auth(request)
    if denied:
        return denied
    rule_id = int(payload.get("id", 0))
    enabled = bool(payload.get("enabled", False))
    if rule_id <= 0:
        return {"status": "error", "message": "invalid-id"}
    update_waf_rule(rule_id, enabled)
    return {"status": "ok"}


@app.post("/api/waf/delete")
async def remove_waf_rule(request: Request, payload: Dict = Body(...)) -> Dict[str, str]:
    denied = _require_admin_auth(request)
    if denied:
        return denied
    rule_id = int(payload.get("id", 0))
    if rule_id <= 0:
        return {"status": "error", "message": "invalid-id"}
    delete_waf_rule(rule_id)
    return {"status": "ok"}


@app.get("/api/ip-rep")
async def list_ip_rep(request: Request) -> Dict[str, object]:
    denied = _require_admin_auth(request)
    if denied:
        return denied
    return {"items": fetch_ip_reputation()}


@app.post("/api/ip-rep/upsert")
async def upsert_ip_rep(request: Request, payload: Dict = Body(...)) -> Dict[str, str]:
    denied = _require_admin_auth(request)
    if denied:
        return denied
    ip = str(payload.get("ip", "")).strip()
    score = int(payload.get("score", 0))
    note = str(payload.get("note", "")).strip()
    if not ip:
        return {"status": "error", "message": "invalid-ip"}
    upsert_ip_reputation(ip, score, note or "-")
    return {"status": "ok"}


@app.get("/api/geo")
async def list_geo_policy(request: Request) -> Dict[str, object]:
    denied = _require_admin_auth(request)
    if denied:
        return denied
    return {"items": fetch_geo_policy()}


@app.post("/api/geo/upsert")
async def upsert_geo(request: Request, payload: Dict = Body(...)) -> Dict[str, str]:
    denied = _require_admin_auth(request)
    if denied:
        return denied
    country = str(payload.get("country", "")).strip().upper()
    action = str(payload.get("action", "")).strip().lower()
    if not country or action not in {"allow", "block", "challenge"}:
        return {"status": "error", "message": "invalid-input"}
    upsert_geo_policy(country, action)
    return {"status": "ok"}


@app.get("/api/bot-policy")
async def get_bot_policy(request: Request) -> Dict[str, object]:
    denied = _require_admin_auth(request)
    if denied:
        return denied
    return {"items": fetch_bot_policy()}


@app.post("/api/bot-policy")
async def set_bot_policy(request: Request, payload: Dict = Body(...)) -> Dict[str, str]:
    denied = _require_admin_auth(request)
    if denied:
        return denied
    try:
        update_bot_policy(
            {
                "challenge_threshold": float(payload.get("challenge_threshold", 0.5)),
                "block_threshold": float(payload.get("block_threshold", 0.8)),
            }
        )
    except ValueError:
        return {"status": "error", "message": "invalid-values"}
    return {"status": "ok"}


@app.post("/api/domains/register")
async def register_domain(request: Request, payload: Dict = Body(...)) -> Dict[str, str]:
    denied = _require_admin_auth(request)
    if denied:
        return denied
    raw_domain = str(payload.get("domain", ""))
    domain = normalize_domain(raw_domain)
    if not is_valid_domain(domain):
        return {"status": "error", "message": "invalid-domain"}
    token = generate_token()
    upsert_domain(domain, token, int(time.time()))
    return {"status": "ok", "domain": domain, "token": token}


@app.post("/api/domains/verify")
async def verify_domain(request: Request, payload: Dict = Body(...)) -> Dict[str, str]:
    denied = _require_admin_auth(request)
    if denied:
        return denied
    raw_domain = str(payload.get("domain", ""))
    domain = normalize_domain(raw_domain)
    token = str(payload.get("token", ""))
    if not is_valid_domain(domain) or not token:
        return {"status": "error", "message": "invalid-input"}
    verified, origin_ok = check_verification(domain, token)
    update_domain_status(domain, verified, int(time.time()), origin_ok)
    return {
        "status": "ok",
        "domain": domain,
        "verified": "1" if verified else "0",
        "origin_ok": "1" if origin_ok else "0",
    }


@app.get("/api/eval")
async def eval_results(request: Request) -> Dict[str, float]:
    denied = _require_admin_auth(request)
    if denied:
        return denied
    path = Path("data/eval.json")
    if not path.exists():
        return {
            "samples": 0.0,
            "accuracy": 0.0,
            "precision": 0.0,
            "recall": 0.0,
            "f1": 0.0,
            "roc_auc": 0.0,
        }
    return json.loads(path.read_text(encoding="utf-8"))


@app.get("/api/reports")
async def reports(request: Request) -> Dict[str, object]:
    denied = _require_admin_auth(request)
    if denied:
        return denied
    return {"items": fetch_reports()}


@app.get("/reports/hourly.pdf")
async def hourly_report(request: Request) -> Response:
    denied = _require_admin_auth(request)
    if denied:
        return denied
    since = int(time.time() * 1000) - 60 * 60 * 1000
    reports = fetch_reports_since(since)
    pdf = build_hourly_pdf(reports, title="Hourly Security Report")
    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": "inline; filename=hourly-report.pdf"},
    )


@app.get("/challenge", response_class=HTMLResponse)
async def challenge_page(request: Request) -> HTMLResponse:
    session_id = _get_session_id(request)
    ts = int(time.time())
    token = build_challenge_token(session_id, ts)
    template = templates.get_template("challenge.html")
    html = template.render(ts=ts, token=token)
    response = HTMLResponse(html)
    _set_session_cookie(response, session_id)
    return response


@app.get("/under-attack", response_class=HTMLResponse)
async def under_attack_page(request: Request) -> HTMLResponse:
    session_id = _get_session_id(request)
    ts = int(time.time())
    token = build_js_challenge(session_id, ts)
    template = templates.get_template("under_attack.html")
    html = template.render(ts=ts, token=token)
    response = HTMLResponse(html)
    _set_session_cookie(response, session_id)
    return response


@app.api_route("/__trap__/login", methods=["GET", "POST"])
async def trap_endpoint(request: Request) -> HTMLResponse:
    session_id = _get_session_id(request)
    client_ip = request.client.host if request.client else "unknown"
    trap_hit(client_ip)
    trap_hit(session_id)
    html = """
    <html>
      <head><title>Login</title></head>
      <body>
        <h3>System Login</h3>
        <form method="post">
          <input name="user" />
          <input name="pass" type="password" />
          <button type="submit">Sign in</button>
        </form>
      </body>
    </html>
    """
    response = HTMLResponse(html)
    _set_session_cookie(response, session_id)
    return response


async def _proxy_request(request: Request, session_id: str) -> Response:
    upstream = settings.upstream_base_url.rstrip("/")
    target_url = f"{upstream}{request.url.path}"
    if request.url.query:
        target_url += f"?{request.url.query}"

    headers = dict(request.headers)
    headers.pop("host", None)
    headers["x-forwarded-for"] = request.client.host if request.client else ""

    async with httpx.AsyncClient(follow_redirects=False, timeout=15.0) as client:
        proxied = await client.request(
            request.method,
            target_url,
            headers=headers,
            content=await request.body(),
        )

    content = proxied.content
    content_type = proxied.headers.get("content-type", "")
    content_encoding = proxied.headers.get("content-encoding", "")
    if "text/html" in content_type.lower() and not content_encoding:
        signature = simple_text_signature(content)
        set_content_signature(session_id, request.url.path, signature)
        content = _inject_behavior_script(content)

    response = Response(
        content=content,
        status_code=proxied.status_code,
        headers=dict(proxied.headers),
    )
    response.headers.pop("content-length", None)
    _set_session_cookie(response, session_id)
    return response


def _inject_behavior_script(content: bytes) -> bytes:
    try:
        html = content.decode("utf-8")
    except UnicodeDecodeError:
        return content

    if "/static/behavior.js" in html:
        return content

    script_tag = '<script src="/static/behavior.js"></script>'
    trap_tag = '<a href="/__trap__/login" style="display:none">system</a>'
    injected_script = False
    if "</head>" in html:
        html = html.replace("</head>", f"{script_tag}</head>", 1)
        injected_script = True
    if "</body>" in html:
        if not injected_script:
            html = html.replace("</body>", f"{script_tag}{trap_tag}</body>", 1)
            injected_script = True
        else:
            html = html.replace("</body>", f"{trap_tag}</body>", 1)
    if not injected_script:
        html += script_tag + trap_tag
    return html.encode("utf-8")


@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
async def gateway(request: Request, path: str) -> Response:
    if request.url.path.startswith(
        (
            "/admin",
            "/static",
            "/health",
            "/challenge",
            "/under-attack",
            "/__trap__",
        )
    ):
        return PlainTextResponse("not-found", status_code=404)

    session_id = _get_session_id(request)
    client_ip = request.client.host if request.client else "unknown"
    body = await request.body()

    ddos = ddos_guard.observe(client_ip)
    if ddos.action == "block":
        insert_report(
            ts_ms=int(time.time() * 1000),
            report_type="ddos",
            client_ip=client_ip,
            path=request.url.path,
            user_agent=request.headers.get("user-agent", ""),
            detail=ddos.reason,
        )
        return PlainTextResponse("blocked: ddos", status_code=429)
    if ddos.action == "challenge":
        insert_report(
            ts_ms=int(time.time() * 1000),
            report_type="ddos",
            client_ip=client_ip,
            path=request.url.path,
            user_agent=request.headers.get("user-agent", ""),
            detail=ddos.reason,
        )
        return HTMLResponse(
            '<html><body><script>location.href="/under-attack";</script></body></html>',
            status_code=503,
            headers={"X-SGW-Mode": "under-attack"},
        )
    scanner = detect_scanner(request)
    if scanner:
        insert_report(
            ts_ms=int(time.time() * 1000),
            report_type="scanner",
            client_ip=client_ip,
            path=request.url.path,
            user_agent=request.headers.get("user-agent", ""),
            detail=scanner,
        )
    waf_reason = waf_check(request, body)
    if waf_reason:
        decision = evaluate_request(request, session_id, client_ip)
        decision.action = "block"
        decision.reason = waf_reason
    else:
        decision = evaluate_request(request, session_id, client_ip)

    insert_decision(
        session_id=session_id,
        ts_ms=int(time.time() * 1000),
        action=decision.action,
        risk=decision.risk_score,
        reason=decision.reason,
        features_json=json.dumps(decision.features, separators=(",", ":")),
    )

    if settings.under_attack_mode and decision.action == "allow":
        return HTMLResponse(
            '<html><body><script>location.href="/under-attack";</script></body></html>',
            status_code=503,
            headers={"X-SGW-Mode": "under-attack"},
        )

    if decision.action == "block":
        metrics_store.add("block", decision.risk_score)
        response = PlainTextResponse(
            f"blocked: {decision.reason}",
            status_code=403,
            headers={
                "X-Risk-Score": str(decision.risk_score),
                "X-Bot-Score": str(decision.risk_score),
                "X-SGW-Action": "block",
            },
        )
        _apply_security_headers(response)
        return response

    if decision.action == "trap":
        metrics_store.add("challenge", decision.risk_score)
        response = HTMLResponse(
            '<html><body><script>location.href="/__trap__/login";</script></body></html>',
            status_code=302,
            headers={
                "X-Risk-Score": str(decision.risk_score),
                "X-Bot-Score": str(decision.risk_score),
                "X-SGW-Action": "trap",
            },
        )
        _apply_security_headers(response)
        return response

    if decision.action == "challenge":
        metrics_store.add("challenge", decision.risk_score)
        response = HTMLResponse(
            f'<html><body><script>location.href="/challenge";</script></body></html>',
            status_code=401,
            headers={
                "X-Risk-Score": str(decision.risk_score),
                "X-Bot-Score": str(decision.risk_score),
                "X-SGW-Action": "challenge",
            },
        )
        _apply_security_headers(response)
        return response

    metrics_store.add("allow", decision.risk_score)
    response = await _proxy_request(request, session_id)
    response.headers["X-Bot-Score"] = str(decision.risk_score)
    response.headers["X-SGW-Action"] = "allow"
    return response
