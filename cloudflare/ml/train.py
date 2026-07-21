import os
from pathlib import Path

import joblib
import numpy as np
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.semi_supervised import SelfTrainingClassifier
from sklearn.linear_model import LogisticRegression


def generate_synthetic_data(n_samples: int = 2000):
    rng = np.random.default_rng(42)
    # Human-like patterns
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

    # Bot-like patterns
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
    return X, y


def main() -> None:
    X, y = generate_synthetic_data()
    X_train, X_test, y_train, _ = train_test_split(X, y, test_size=0.2, random_state=42)

    isoforest = IsolationForest(n_estimators=120, contamination=0.2, random_state=42)
    isoforest.fit(X_train)

    classifier = RandomForestClassifier(
        n_estimators=140, max_depth=8, random_state=42
    )
    classifier.fit(X_train, y_train)

    semi_base = LogisticRegression(max_iter=200)
    y_partial = y_train.copy()
    mask = np.random.default_rng(7).choice(
        [True, False], size=y_partial.shape, p=[0.5, 0.5]
    )
    y_partial[mask] = -1
    semi = SelfTrainingClassifier(semi_base)
    semi.fit(X_train, y_partial)

    model_dir = Path("models")
    model_dir.mkdir(exist_ok=True)
    joblib.dump(isoforest, model_dir / "isoforest.joblib")
    joblib.dump(classifier, model_dir / "classifier.joblib")
    joblib.dump(semi, model_dir / "classifier_semi.joblib")
    print("Models saved to models/")


if __name__ == "__main__":
    main()
