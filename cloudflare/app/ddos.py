import time
from collections import deque
from dataclasses import dataclass
from typing import Deque, Dict


@dataclass
class DdosDecision:
    action: str
    reason: str


class AdaptiveDdosGuard:
    def __init__(
        self,
        global_rpm: int,
        ip_rpm: int,
        spike_multiplier: float = 2.5,
        window_seconds: int = 10,
    ) -> None:
        self.global_rpm = global_rpm
        self.ip_rpm = ip_rpm
        self.spike_multiplier = spike_multiplier
        self.window_seconds = window_seconds
        self._global: Deque[float] = deque()
        self._per_ip: Dict[str, Deque[float]] = {}
        self._last_rates: Deque[int] = deque(maxlen=6)

    def _trim(self, bucket: Deque[float], now: float) -> None:
        window_start = now - self.window_seconds
        while bucket and bucket[0] < window_start:
            bucket.popleft()

    def observe(self, ip: str) -> DdosDecision:
        now = time.time()
        self._trim(self._global, now)
        self._global.append(now)

        ip_bucket = self._per_ip.setdefault(ip, deque())
        self._trim(ip_bucket, now)
        ip_bucket.append(now)

        global_rps = len(self._global) / self.window_seconds
        ip_rps = len(ip_bucket) / self.window_seconds
        self._last_rates.append(int(global_rps))
        avg_rate = sum(self._last_rates) / len(self._last_rates) if self._last_rates else 0.0

        if ip_rps * 60 > self.ip_rpm:
            return DdosDecision(action="block", reason="ddos-ip-rate")

        if avg_rate > 0 and global_rps > avg_rate * self.spike_multiplier:
            return DdosDecision(action="challenge", reason="ddos-spike")

        if global_rps * 60 > self.global_rpm:
            return DdosDecision(action="challenge", reason="ddos-global-rate")

        return DdosDecision(action="allow", reason="ok")
