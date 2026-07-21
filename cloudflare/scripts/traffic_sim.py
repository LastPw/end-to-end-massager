import argparse
import asyncio
import random
import time
from dataclasses import dataclass

import httpx


@dataclass
class Scenario:
    name: str
    requests: int
    min_delay: float
    max_delay: float
    path: str


SCENARIOS = {
    "human": Scenario("human", requests=30, min_delay=0.3, max_delay=1.2, path="/"),
    "bot": Scenario("bot", requests=80, min_delay=0.02, max_delay=0.08, path="/"),
    "recon": Scenario("recon", requests=12, min_delay=0.1, max_delay=0.3, path="/.env"),
    "bruteforce": Scenario(
        "bruteforce", requests=40, min_delay=0.05, max_delay=0.15, path="/login"
    ),
}


async def run_scenario(base_url: str, scenario: Scenario) -> None:
    async with httpx.AsyncClient(base_url=base_url, timeout=10.0) as client:
        for i in range(scenario.requests):
            try:
                await client.get(scenario.path)
            except httpx.RequestError:
                pass
            await asyncio.sleep(random.uniform(scenario.min_delay, scenario.max_delay))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="http://localhost:8000")
    parser.add_argument(
        "--scenario",
        choices=sorted(SCENARIOS.keys()),
        default="human",
    )
    args = parser.parse_args()
    scenario = SCENARIOS[args.scenario]
    start = time.time()
    asyncio.run(run_scenario(args.base_url, scenario))
    elapsed = time.time() - start
    print(f"Finished {scenario.name} scenario in {elapsed:.2f}s")


if __name__ == "__main__":
    main()
