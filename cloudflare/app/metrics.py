import time
from collections import deque
from dataclasses import dataclass
from typing import Deque, Dict, List


@dataclass
class DecisionRecord:
    ts: float
    action: str
    risk: float


class MetricsStore:
    def __init__(self, max_records: int = 5000) -> None:
        self._records: Deque[DecisionRecord] = deque(maxlen=max_records)

    def add(self, action: str, risk: float) -> None:
        self._records.append(DecisionRecord(time.time(), action, risk))

    def snapshot(self) -> Dict[str, float]:
        total = len(self._records)
        allow = sum(1 for r in self._records if r.action == "allow")
        block = sum(1 for r in self._records if r.action == "block")
        challenge = sum(1 for r in self._records if r.action == "challenge")
        avg_risk = sum(r.risk for r in self._records) / total if total else 0.0
        return {
            "total": float(total),
            "allow": float(allow),
            "block": float(block),
            "challenge": float(challenge),
            "avg_risk": float(avg_risk),
        }

    def series(self, points: int = 30) -> List[Dict[str, float]]:
        if not self._records:
            return []
        now = time.time()
        bucket_size = 60
        series = []
        for i in range(points):
            start = now - bucket_size * (points - i)
            end = start + bucket_size
            count = sum(1 for r in self._records if start <= r.ts < end)
            series.append({"ts": start, "count": float(count)})
        return series

    def action_series(self, points: int = 30) -> List[Dict[str, float]]:
        if not self._records:
            return []
        now = time.time()
        bucket_size = 60
        series = []
        for i in range(points):
            start = now - bucket_size * (points - i)
            end = start + bucket_size
            allow = sum(1 for r in self._records if start <= r.ts < end and r.action == "allow")
            block = sum(1 for r in self._records if start <= r.ts < end and r.action == "block")
            challenge = sum(
                1 for r in self._records if start <= r.ts < end and r.action == "challenge"
            )
            series.append(
                {
                    "ts": start,
                    "allow": float(allow),
                    "block": float(block),
                    "challenge": float(challenge),
                }
            )
        return series


metrics_store = MetricsStore()
