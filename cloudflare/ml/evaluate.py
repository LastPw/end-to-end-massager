import csv
import json
from pathlib import Path

import joblib
import numpy as np
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
    confusion_matrix,
)


FEATURES = [
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
]


def load_csv(path: Path) -> tuple[np.ndarray, np.ndarray]:
    with path.open("r", newline="") as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    X = np.array([[float(row[name]) for name in FEATURES] for row in rows], dtype=float)
    y = np.array([int(float(row["label"])) for row in rows], dtype=int)
    return X, y


def main() -> None:
    data_path = Path("data/synthetic_dataset.csv")
    X, y = load_csv(data_path)

    model_dir = Path("models")
    clf = joblib.load(model_dir / "classifier.joblib")
    proba = clf.predict_proba(X)[:, 1]
    preds = (proba >= 0.5).astype(int)
    tn, fp, fn, tp = confusion_matrix(y, preds).ravel()

    results = {
        "samples": int(len(y)),
        "accuracy": float(accuracy_score(y, preds)),
        "precision": float(precision_score(y, preds)),
        "recall": float(recall_score(y, preds)),
        "f1": float(f1_score(y, preds)),
        "roc_auc": float(roc_auc_score(y, proba)),
        "confusion_matrix": {
            "tn": int(tn),
            "fp": int(fp),
            "fn": int(fn),
            "tp": int(tp),
        },
        "threshold": 0.5,
    }

    out_path = Path("data/eval.json")
    out_path.parent.mkdir(exist_ok=True)
    out_path.write_text(json.dumps(results, indent=2), encoding="utf-8")
    print(json.dumps(results, indent=2))


if __name__ == "__main__":
    main()
