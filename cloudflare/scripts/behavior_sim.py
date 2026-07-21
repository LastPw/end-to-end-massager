import argparse
import asyncio
import random
import time

import httpx


async def send_behavior(client: httpx.AsyncClient, batch: list[dict]) -> None:
    try:
        await client.post("/api/behavior", json={"events": batch})
    except httpx.RequestError:
        pass


def gen_mouse_event() -> dict:
    return {"type": "mouse_move", "ts": int(time.time() * 1000), "payload": {"speed": random.uniform(0.2, 0.9)}}


def gen_click_event() -> dict:
    return {"type": "click", "ts": int(time.time() * 1000), "payload": {}}


def gen_key_event() -> dict:
    return {"type": "key", "ts": int(time.time() * 1000), "payload": {"interval": random.uniform(80, 280)}}


def gen_scroll_event() -> dict:
    return {"type": "scroll", "ts": int(time.time() * 1000), "payload": {"speed": random.uniform(0.1, 0.6)}}


def gen_nav_event(path: str) -> dict:
    return {"type": "nav", "ts": int(time.time() * 1000), "payload": {"path": path, "dwell_ms": random.randint(1000, 6000)}}


async def run(base_url: str, path: str, seconds: int) -> None:
    async with httpx.AsyncClient(base_url=base_url, timeout=10.0) as client:
        end = time.time() + seconds
        while time.time() < end:
            batch = [gen_mouse_event(), gen_scroll_event()]
            if random.random() < 0.4:
                batch.append(gen_click_event())
            if random.random() < 0.5:
                batch.append(gen_key_event())
            if random.random() < 0.3:
                batch.append(gen_nav_event(path))
            await send_behavior(client, batch)
            try:
                await client.get(path)
            except httpx.RequestError:
                pass
            await asyncio.sleep(random.uniform(0.2, 0.8))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="http://localhost:8000")
    parser.add_argument("--path", default="/")
    parser.add_argument("--seconds", type=int, default=20)
    args = parser.parse_args()
    asyncio.run(run(args.base_url, args.path, args.seconds))
    print("Behavior simulation finished.")


if __name__ == "__main__":
    main()
