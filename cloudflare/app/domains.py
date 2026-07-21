import re
import secrets
import time
from typing import List, Tuple

import dns.resolver

from .config import settings


DOMAIN_RE = re.compile(r"^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$")


def normalize_domain(domain: str) -> str:
    return domain.strip().lower().rstrip(".")


def is_valid_domain(domain: str) -> bool:
    return bool(DOMAIN_RE.match(domain))


def generate_token() -> str:
    return secrets.token_hex(16)


def expected_txt_value(token: str) -> str:
    return f"sgw-verify={token}"


def resolve_txt(domain: str) -> List[str]:
    values: List[str] = []
    for name in [domain, f"_sgw.{domain}"]:
        try:
            answers = dns.resolver.resolve(name, "TXT")
            for rdata in answers:
                values.extend([part.decode("utf-8") for part in rdata.strings])
        except Exception:
            continue
    return values


def resolve_ips(domain: str) -> List[str]:
    ips: List[str] = []
    try:
        answers = dns.resolver.resolve(domain, "A")
        ips.extend([rdata.to_text() for rdata in answers])
    except Exception:
        pass
    try:
        answers = dns.resolver.resolve(domain, "AAAA")
        ips.extend([rdata.to_text() for rdata in answers])
    except Exception:
        pass
    return ips


def check_verification(domain: str, token: str) -> Tuple[bool, bool]:
    txt_values = resolve_txt(domain)
    verified = expected_txt_value(token) in txt_values
    gateway_ips = {ip.strip() for ip in settings.gateway_ips.split(",") if ip.strip()}
    if not gateway_ips:
        return verified, False
    resolved = set(resolve_ips(domain))
    origin_ok = bool(resolved & gateway_ips)
    return verified, origin_ok
