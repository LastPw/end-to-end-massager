import csv
from pathlib import Path

import numpy as np


def generate_samples(n_samples: int = 2000) -> np.ndarray:
    rng = np.random.default_rng(123)
    human_mouse_speed = rng.normal(0.6, 0.15, n_samples)
    human_mouse_std = rng.normal(0.2, 0.08, n_samples)
    human_click_interval = rng.normal(450, 120, n_samples)
    human_key_interval = rng.normal(170, 50, n_samples)
    human_event_count = rng.integers(30, 120, n_samples)
    human_webdriver = rng.choice([0, 0, 0, 1], n_samples)
    human_scroll_avg = rng.normal(0.4, 0.12, n_samples)
    human_scroll_std = rng.normal(0.18, 0.08, n_samples)
    human_nav_count = rng.integers(2, 10, n_samples)
    human_nav_unique = rng.normal(0.8, 0.1, n_samples)
    human_nav_dwell = rng.normal(24000, 8000, n_samples)
    human_device_change = rng.choice([0, 0, 0, 1], n_samples)
    human_fingerprint_shift = rng.choice([0, 0, 0, 1], n_samples)
    human_content_mismatch = rng.choice([0, 0, 0, 1], n_samples)

    bot_mouse_speed = rng.normal(0.05, 0.03, n_samples)
    bot_mouse_std = rng.normal(0.02, 0.01, n_samples)
    bot_click_interval = rng.normal(50, 20, n_samples)
    bot_key_interval = rng.normal(30, 10, n_samples)
    bot_event_count = rng.integers(1, 20, n_samples)
    bot_webdriver = rng.choice([1, 1, 1, 0], n_samples)
    bot_scroll_avg = rng.normal(0.05, 0.03, n_samples)
    bot_scroll_std = rng.normal(0.02, 0.01, n_samples)
    bot_nav_count = rng.integers(1, 3, n_samples)
    bot_nav_unique = rng.normal(0.2, 0.1, n_samples)
    bot_nav_dwell = rng.normal(1500, 700, n_samples)
    bot_device_change = rng.choice([1, 1, 0, 1], n_samples)
    bot_fingerprint_shift = rng.choice([1, 1, 0, 1], n_samples)
    bot_content_mismatch = rng.choice([1, 1, 0, 1], n_samples)

    human = np.column_stack(
        [
            human_mouse_speed,
            human_mouse_std,
            human_click_interval,
            human_key_interval,
            human_event_count,
            human_webdriver,
            human_scroll_avg,
            human_scroll_std,
            human_nav_count,
            human_nav_unique,
            human_nav_dwell,
            human_device_change,
            human_fingerprint_shift,
            human_content_mismatch,
        ]
    )
    bot = np.column_stack(
        [
            bot_mouse_speed,
            bot_mouse_std,
            bot_click_interval,
            bot_key_interval,
            bot_event_count,
            bot_webdriver,
            bot_scroll_avg,
            bot_scroll_std,
            bot_nav_count,
            bot_nav_unique,
            bot_nav_dwell,
            bot_device_change,
            bot_fingerprint_shift,
            bot_content_mismatch,
        ]
    )

    X = np.vstack([human, bot])
    y = np.hstack([np.zeros(n_samples), np.ones(n_samples)])
    return np.column_stack([X, y])


def main() -> None:
    header = [
        "mouse_speed_avg",
        "mouse_speed_std",
        "click_interval_avg",
        "key_interval_avg",
        "event_count",
        "webdriver_flag",
        "scroll_speed_avg",
        "scroll_speed_std",
        "nav_count",
        "nav_unique_ratio",
        "nav_avg_dwell",
        "device_change",
        "fingerprint_shift",
        "content_mismatch",
        "label",
    ]
    data = generate_samples(1000)
    out_path = Path("data/synthetic_dataset.csv")
    out_path.parent.mkdir(exist_ok=True)
    with out_path.open("w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(header)
        writer.writerows(data)
    print(f"Saved {len(data)} rows to {out_path}")


if __name__ == "__main__":
    main()
