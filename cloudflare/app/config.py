import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    upstream_base_url: str = os.getenv("UPSTREAM_BASE_URL", "http://localhost:8080")
    session_cookie_name: str = os.getenv("SESSION_COOKIE_NAME", "sgw_session")
    challenge_secret: str = os.getenv("CHALLENGE_SECRET", "change-me")
    challenge_ttl_seconds: int = int(os.getenv("CHALLENGE_TTL_SECONDS", "120"))
    max_req_per_minute: int = int(os.getenv("MAX_REQ_PER_MINUTE", "120"))
    max_req_per_minute_ip: int = int(os.getenv("MAX_REQ_PER_MINUTE_IP", "300"))
    under_attack_mode: bool = os.getenv("UNDER_ATTACK_MODE", "0") == "1"
    allowlist_ips: str = os.getenv("ALLOWLIST_IPS", "")
    blocklist_ips: str = os.getenv("BLOCKLIST_IPS", "")
    block_ttl_seconds: int = int(os.getenv("BLOCK_TTL_SECONDS", "300"))
    gateway_ips: str = os.getenv("GATEWAY_IPS", "")
    ddos_global_rpm: int = int(os.getenv("DDOS_GLOBAL_RPM", "3000"))
    ddos_ip_rpm: int = int(os.getenv("DDOS_IP_RPM", "600"))
    ddos_spike_multiplier: float = float(os.getenv("DDOS_SPIKE_MULTIPLIER", "2.5"))
    model_dir: str = os.getenv("MODEL_DIR", "models")
    data_db_path: str = os.getenv("DATA_DB_PATH", "data/behavior.db")
    admin_basic_username: str = os.getenv("ADMIN_BASIC_USERNAME", "").strip()
    admin_basic_password: str = os.getenv("ADMIN_BASIC_PASSWORD", "")


settings = Settings()
