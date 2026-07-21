import json
from typing import Any, Dict, List

from .storage import fetch_recent_events


def _safe_load(payload: str) -> Dict[str, Any]:
    try:
        return json.loads(payload)
    except json.JSONDecodeError:
        return {}


def extract_features(session_id: str) -> Dict[str, float]:
    events = fetch_recent_events(session_id, limit=300)
    if not events:
        return {
            "mouse_speed_avg": 0.0,
            "mouse_speed_std": 0.0,
            "click_interval_avg": 0.0,
            "key_interval_avg": 0.0,
            "scroll_speed_avg": 0.0,
            "scroll_speed_std": 0.0,
            "event_count": 0.0,
            "webdriver_flag": 0.0,
            "nav_count": 0.0,
            "nav_unique_ratio": 0.0,
            "nav_avg_dwell": 0.0,
            "device_change": 0.0,
        }

    mouse_speeds: List[float] = []
    click_intervals: List[int] = []
    key_intervals: List[int] = []
    scroll_speeds: List[float] = []
    nav_paths: List[str] = []
    nav_dwell: List[float] = []
    last_click_ts = None
    last_key_ts = None
    webdriver_flag = 0.0
    device_change = 0.0

    for row in reversed(events):
        payload = _safe_load(row["payload"])
        if payload.get("webdriver") is True:
            webdriver_flag = 1.0

        if row["event_type"] == "mouse_move":
            speed = float(payload.get("speed", 0.0))
            if speed >= 0.0:
                mouse_speeds.append(speed)
        elif row["event_type"] == "click":
            ts = int(row["ts_ms"])
            if last_click_ts is not None:
                click_intervals.append(max(ts - last_click_ts, 0))
            last_click_ts = ts
        elif row["event_type"] == "key":
            ts = int(row["ts_ms"])
            if last_key_ts is not None:
                key_intervals.append(max(ts - last_key_ts, 0))
            last_key_ts = ts
        elif row["event_type"] == "scroll":
            speed = float(payload.get("speed", 0.0))
            if speed >= 0.0:
                scroll_speeds.append(speed)
        elif row["event_type"] == "nav":
            path = str(payload.get("path", ""))
            dwell = float(payload.get("dwell_ms", 0.0))
            if path:
                nav_paths.append(path)
            if dwell >= 0:
                nav_dwell.append(dwell)
        elif row["event_type"] == "device":
            if payload.get("changed") is True:
                device_change = 1.0

    mouse_speed_avg = sum(mouse_speeds) / len(mouse_speeds) if mouse_speeds else 0.0
    mouse_speed_std = (
        (sum((s - mouse_speed_avg) ** 2 for s in mouse_speeds) / len(mouse_speeds)) ** 0.5
        if mouse_speeds
        else 0.0
    )
    click_interval_avg = (
        sum(click_intervals) / len(click_intervals) if click_intervals else 0.0
    )
    key_interval_avg = sum(key_intervals) / len(key_intervals) if key_intervals else 0.0
    scroll_speed_avg = (
        sum(scroll_speeds) / len(scroll_speeds) if scroll_speeds else 0.0
    )
    scroll_speed_std = (
        (sum((s - scroll_speed_avg) ** 2 for s in scroll_speeds) / len(scroll_speeds))
        ** 0.5
        if scroll_speeds
        else 0.0
    )
    nav_count = float(len(nav_paths))
    unique_paths = len(set(nav_paths)) if nav_paths else 0
    nav_unique_ratio = float(unique_paths / len(nav_paths)) if nav_paths else 0.0
    nav_avg_dwell = float(sum(nav_dwell) / len(nav_dwell)) if nav_dwell else 0.0

    return {
        "mouse_speed_avg": float(mouse_speed_avg),
        "mouse_speed_std": float(mouse_speed_std),
        "click_interval_avg": float(click_interval_avg),
        "key_interval_avg": float(key_interval_avg),
        "scroll_speed_avg": float(scroll_speed_avg),
        "scroll_speed_std": float(scroll_speed_std),
        "event_count": float(len(events)),
        "webdriver_flag": float(webdriver_flag),
        "nav_count": nav_count,
        "nav_unique_ratio": nav_unique_ratio,
        "nav_avg_dwell": nav_avg_dwell,
        "device_change": float(device_change),
    }
