import json
from pathlib import Path


def render_report(data: dict) -> str:
    cm = data.get("confusion_matrix", {})
    return f"""# Evaluation Report

## Summary
- Samples: {data.get("samples", 0)}
- Threshold: {data.get("threshold", 0.5)}
- Accuracy: {data.get("accuracy", 0):.3f}
- Precision: {data.get("precision", 0):.3f}
- Recall: {data.get("recall", 0):.3f}
- F1: {data.get("f1", 0):.3f}
- ROC-AUC: {data.get("roc_auc", 0):.3f}

## Confusion Matrix
|            | Pred 0 | Pred 1 |
|------------|--------|--------|
| True 0     | {cm.get("tn", 0)}     | {cm.get("fp", 0)}     |
| True 1     | {cm.get("fn", 0)}     | {cm.get("tp", 0)}     |

## Notes
- Results are based on the synthetic dataset in `data/synthetic_dataset.csv`.
- Re-run `python ml/evaluate.py` before regenerating this report.
"""


def main() -> None:
    eval_path = Path("data/eval.json")
    if not eval_path.exists():
        raise SystemExit("data/eval.json not found. Run python ml/evaluate.py first.")
    data = json.loads(eval_path.read_text(encoding="utf-8"))
    report = render_report(data)
    out_path = Path("docs/EVAL_REPORT.md")
    out_path.parent.mkdir(exist_ok=True)
    out_path.write_text(report, encoding="utf-8")
    print(f"Saved {out_path}")


if __name__ == "__main__":
    main()
