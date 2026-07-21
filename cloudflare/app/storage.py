import sqlite3
from pathlib import Path
from typing import Any, Dict, List

from .config import settings


def _connect() -> sqlite3.Connection:
    Path(settings.data_db_path).parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(settings.data_db_path)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    conn = _connect()
    try:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS behavior_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                event_type TEXT NOT NULL,
                ts_ms INTEGER NOT NULL,
                payload TEXT NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS decisions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                ts_ms INTEGER NOT NULL,
                action TEXT NOT NULL,
                risk REAL NOT NULL,
                reason TEXT NOT NULL,
                features TEXT NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS domains (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                domain TEXT NOT NULL UNIQUE,
                token TEXT NOT NULL,
                verified INTEGER NOT NULL DEFAULT 0,
                verified_ts INTEGER,
                origin_ok INTEGER NOT NULL DEFAULT 0,
                created_ts INTEGER NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS security_reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ts_ms INTEGER NOT NULL,
                report_type TEXT NOT NULL,
                client_ip TEXT NOT NULL,
                path TEXT NOT NULL,
                user_agent TEXT NOT NULL,
                detail TEXT NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS waf_rules (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                pattern TEXT NOT NULL,
                description TEXT NOT NULL,
                enabled INTEGER NOT NULL DEFAULT 1
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS ip_reputation (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ip TEXT NOT NULL UNIQUE,
                score INTEGER NOT NULL,
                note TEXT NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS geo_policy (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                country TEXT NOT NULL UNIQUE,
                action TEXT NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS bot_policy (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key TEXT NOT NULL UNIQUE,
                value REAL NOT NULL
            )
            """
        )
        conn.commit()
        _seed_defaults(conn)
        conn.commit()
    finally:
        conn.close()


def _seed_defaults(conn: sqlite3.Connection) -> None:
    existing = conn.execute("SELECT COUNT(*) FROM waf_rules").fetchone()[0]
    if existing == 0:
        conn.executemany(
            "INSERT INTO waf_rules (pattern, description, enabled) VALUES (?, ?, 1)",
            [
                (r"(?i)\bunion\b.+\bselect\b", "SQLi UNION SELECT"),
                (r"(?i)<script\b", "XSS script tag"),
                (r"(?i)\b(or|and)\b\s+1=1", "SQLi tautology"),
                (r"(?i)\bbenchmark\(", "SQLi benchmark"),
            ],
        )
    existing = conn.execute("SELECT COUNT(*) FROM bot_policy").fetchone()[0]
    if existing == 0:
        conn.executemany(
            "INSERT INTO bot_policy (key, value) VALUES (?, ?)",
            [
                ("allow_threshold", 0.5),
                ("challenge_threshold", 0.5),
                ("block_threshold", 0.8),
            ],
        )



def insert_events(session_id: str, events: List[Dict[str, Any]]) -> None:
    if not events:
        return
    conn = _connect()
    try:
        conn.executemany(
            "INSERT INTO behavior_events (session_id, event_type, ts_ms, payload) VALUES (?, ?, ?, ?)",
            [
                (
                    session_id,
                    event.get("type", "unknown"),
                    int(event.get("ts", 0)),
                    event.get("payload", "{}"),
                )
                for event in events
            ],
        )
        conn.commit()
    finally:
        conn.close()


def fetch_recent_events(session_id: str, limit: int = 200) -> List[Dict[str, Any]]:
    conn = _connect()
    try:
        rows = conn.execute(
            """
            SELECT event_type, ts_ms, payload
            FROM behavior_events
            WHERE session_id = ?
            ORDER BY ts_ms DESC
            LIMIT ?
            """,
            (session_id, limit),
        ).fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()


def insert_decision(
    session_id: str,
    ts_ms: int,
    action: str,
    risk: float,
    reason: str,
    features_json: str,
) -> None:
    conn = _connect()
    try:
        conn.execute(
            """
            INSERT INTO decisions (session_id, ts_ms, action, risk, reason, features)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (session_id, ts_ms, action, risk, reason, features_json),
        )
        conn.commit()
    finally:
        conn.close()


def upsert_domain(domain: str, token: str, created_ts: int) -> None:
    conn = _connect()
    try:
        conn.execute(
            """
            INSERT INTO domains (domain, token, created_ts)
            VALUES (?, ?, ?)
            ON CONFLICT(domain) DO UPDATE SET token=excluded.token
            """,
            (domain, token, created_ts),
        )
        conn.commit()
    finally:
        conn.close()


def update_domain_status(domain: str, verified: bool, verified_ts: int, origin_ok: bool) -> None:
    conn = _connect()
    try:
        conn.execute(
            """
            UPDATE domains
            SET verified = ?, verified_ts = ?, origin_ok = ?
            WHERE domain = ?
            """,
            (1 if verified else 0, verified_ts, 1 if origin_ok else 0, domain),
        )
        conn.commit()
    finally:
        conn.close()


def fetch_domains() -> List[Dict[str, Any]]:
    conn = _connect()
    try:
        rows = conn.execute(
            """
            SELECT domain, token, verified, verified_ts, origin_ok, created_ts
            FROM domains
            ORDER BY created_ts DESC
            """
        ).fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()


def insert_report(
    ts_ms: int,
    report_type: str,
    client_ip: str,
    path: str,
    user_agent: str,
    detail: str,
) -> None:
    conn = _connect()
    try:
        conn.execute(
            """
            INSERT INTO security_reports (ts_ms, report_type, client_ip, path, user_agent, detail)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (ts_ms, report_type, client_ip, path, user_agent, detail),
        )
        conn.commit()
    finally:
        conn.close()


def fetch_reports(limit: int = 50) -> List[Dict[str, Any]]:
    conn = _connect()
    try:
        rows = conn.execute(
            """
            SELECT ts_ms, report_type, client_ip, path, user_agent, detail
            FROM security_reports
            ORDER BY ts_ms DESC
            LIMIT ?
            """,
            (limit,),
        ).fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()


def fetch_reports_since(ts_ms: int) -> List[Dict[str, Any]]:
    conn = _connect()
    try:
        rows = conn.execute(
            """
            SELECT ts_ms, report_type, client_ip, path, user_agent, detail
            FROM security_reports
            WHERE ts_ms >= ?
            ORDER BY ts_ms DESC
            """,
            (ts_ms,),
        ).fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()


def fetch_waf_rules() -> List[Dict[str, Any]]:
    conn = _connect()
    try:
        rows = conn.execute(
            "SELECT id, pattern, description, enabled FROM waf_rules ORDER BY id DESC"
        ).fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()


def insert_waf_rule(pattern: str, description: str, enabled: bool) -> None:
    conn = _connect()
    try:
        conn.execute(
            "INSERT INTO waf_rules (pattern, description, enabled) VALUES (?, ?, ?)",
            (pattern, description, 1 if enabled else 0),
        )
        conn.commit()
    finally:
        conn.close()


def update_waf_rule(rule_id: int, enabled: bool) -> None:
    conn = _connect()
    try:
        conn.execute(
            "UPDATE waf_rules SET enabled = ? WHERE id = ?",
            (1 if enabled else 0, rule_id),
        )
        conn.commit()
    finally:
        conn.close()


def delete_waf_rule(rule_id: int) -> None:
    conn = _connect()
    try:
        conn.execute("DELETE FROM waf_rules WHERE id = ?", (rule_id,))
        conn.commit()
    finally:
        conn.close()


def fetch_ip_reputation() -> List[Dict[str, Any]]:
    conn = _connect()
    try:
        rows = conn.execute(
            "SELECT id, ip, score, note FROM ip_reputation ORDER BY score DESC"
        ).fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()


def upsert_ip_reputation(ip: str, score: int, note: str) -> None:
    conn = _connect()
    try:
        conn.execute(
            """
            INSERT INTO ip_reputation (ip, score, note)
            VALUES (?, ?, ?)
            ON CONFLICT(ip) DO UPDATE SET score=excluded.score, note=excluded.note
            """,
            (ip, score, note),
        )
        conn.commit()
    finally:
        conn.close()


def fetch_geo_policy() -> List[Dict[str, Any]]:
    conn = _connect()
    try:
        rows = conn.execute(
            "SELECT id, country, action FROM geo_policy ORDER BY country ASC"
        ).fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()


def upsert_geo_policy(country: str, action: str) -> None:
    conn = _connect()
    try:
        conn.execute(
            """
            INSERT INTO geo_policy (country, action)
            VALUES (?, ?)
            ON CONFLICT(country) DO UPDATE SET action=excluded.action
            """,
            (country, action),
        )
        conn.commit()
    finally:
        conn.close()


def fetch_bot_policy() -> Dict[str, float]:
    conn = _connect()
    try:
        rows = conn.execute("SELECT key, value FROM bot_policy").fetchall()
        return {row["key"]: float(row["value"]) for row in rows}
    finally:
        conn.close()


def update_bot_policy(values: Dict[str, float]) -> None:
    conn = _connect()
    try:
        for key, value in values.items():
            conn.execute(
                """
                INSERT INTO bot_policy (key, value)
                VALUES (?, ?)
                ON CONFLICT(key) DO UPDATE SET value=excluded.value
                """,
                (key, float(value)),
            )
        conn.commit()
    finally:
        conn.close()
