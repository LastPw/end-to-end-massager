import time
from collections import deque
from typing import Deque, Dict


class SlidingWindowRateLimiter:
    def __init__(self, max_requests_per_minute: int) -> None:
        self.max_requests = max_requests_per_minute
        self._buckets: Dict[str, Deque[float]] = {}

    def allow(self, key: str) -> bool:
        now = time.time()
        window_start = now - 60
        bucket = self._buckets.setdefault(key, deque())
        while bucket and bucket[0] < window_start:
            bucket.popleft()
        if len(bucket) >= self.max_requests:
            return False
        bucket.append(now)
        return True
