#!/usr/bin/env python3
import argparse
import csv
import json
import math
from collections import Counter, defaultdict
from pathlib import Path
from statistics import mean

PARENT_LABELS = {
    "READ - Products",
    "FR07 - Shopping Cart",
    "TRANSACTIONAL - Coupon and Checkout",
}


def percentile(sorted_values, fraction):
    if not sorted_values:
        return None
    return sorted_values[max(0, math.ceil(len(sorted_values) * fraction) - 1)]


def analyze_resource_csv(path):
    if not path.exists():
        return None
    with path.open(encoding="utf-8-sig", newline="") as stream:
        rows = list(csv.DictReader(stream))
    if not rows:
        return None
    working = [float(row["WorkingSetMB"]) for row in rows]
    private = [float(row["PrivateMemoryMB"]) for row in rows]
    duration_minutes = max((len(rows) - 1) / 60, 1 / 60)
    return {
        "samples": len(rows),
        "working_set_start_mb": working[0],
        "working_set_end_mb": working[-1],
        "working_set_max_mb": max(working),
        "private_max_mb": max(private),
        "working_set_change_mb": working[-1] - working[0],
        "working_set_slope_mb_per_min": (working[-1] - working[0]) / duration_minutes,
    }


def analyze_run(label, run_dir):
    jtls = list(run_dir.glob("*.jtl"))
    if len(jtls) != 1:
        raise ValueError(f"Expected exactly one JTL in {run_dir}, found {len(jtls)}")
    elapsed = []
    start_ms = None
    end_ms = None
    errors = Counter()
    response_codes = Counter()
    per_label = defaultdict(lambda: {"elapsed": [], "errors": 0})

    with jtls[0].open(encoding="utf-8-sig", newline="") as stream:
        for row in csv.DictReader(stream):
            sample_label = row.get("label", "")
            if sample_label in PARENT_LABELS:
                continue
            value = float(row["elapsed"])
            timestamp = float(row["timeStamp"])
            success = row.get("success", "").lower() == "true"
            code = row.get("responseCode", "")
            elapsed.append(value)
            per_label[sample_label]["elapsed"].append(value)
            response_codes[code] += 1
            start_ms = timestamp if start_ms is None else min(start_ms, timestamp)
            end_ms = timestamp + value if end_ms is None else max(end_ms, timestamp + value)
            if not success:
                per_label[sample_label]["errors"] += 1
                errors[(sample_label, code, row.get("responseMessage", ""))] += 1

    elapsed.sort()
    duration_seconds = (end_ms - start_ms) / 1000 if start_ms is not None else 0
    error_count = sum(errors.values())
    label_metrics = {}
    for sample_label, values in sorted(per_label.items()):
        values["elapsed"].sort()
        count = len(values["elapsed"])
        label_metrics[sample_label] = {
            "samples": count,
            "errors": values["errors"],
            "average_ms": round(mean(values["elapsed"]), 2),
            "p95_ms": percentile(values["elapsed"], 0.95),
            "max_ms": max(values["elapsed"]),
        }
    return {
        "label": label,
        "directory": str(run_dir),
        "jtl": str(jtls[0]),
        "samples": len(elapsed),
        "errors": error_count,
        "error_rate_percent": round(error_count * 100 / len(elapsed), 4) if elapsed else 0,
        "duration_seconds": round(duration_seconds, 3),
        "throughput_rps": round(len(elapsed) / duration_seconds, 2) if duration_seconds else 0,
        "average_ms": round(mean(elapsed), 2) if elapsed else None,
        "p50_ms": percentile(elapsed, 0.50),
        "p90_ms": percentile(elapsed, 0.90),
        "p95_ms": percentile(elapsed, 0.95),
        "p99_ms": percentile(elapsed, 0.99),
        "max_ms": max(elapsed) if elapsed else None,
        "top_errors": [
            {"count": count, "label": key[0], "code": key[1], "message": key[2]}
            for key, count in errors.most_common(10)
        ],
        "response_codes": dict(response_codes),
        "per_label": label_metrics,
        "resources": analyze_resource_csv(run_dir / "resource-usage.csv"),
    }


def render_markdown(results):
    lines = [
        "# Performance Metrics Summary",
        "",
        "Transaction Controller parent samples are excluded from request counts and throughput.",
        "",
        "| Run | HTTP samples | Errors | Error rate | RPS | Average | p50 | p90 | p95 | p99 | Max | Max working set |",
        "|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|",
    ]
    for result in results:
        resource = result["resources"] or {}
        lines.append(
            f"| {result['label']} | {result['samples']} | {result['errors']} | "
            f"{result['error_rate_percent']:.4f}% | {result['throughput_rps']:.2f} | "
            f"{result['average_ms']:.2f} ms | {result['p50_ms']:.0f} ms | {result['p90_ms']:.0f} ms | "
            f"{result['p95_ms']:.0f} ms | {result['p99_ms']:.0f} ms | {result['max_ms']:.0f} ms | "
            f"{resource.get('working_set_max_mb', 'N/A')} MB |"
        )
    for result in results:
        lines.extend(["", f"## {result['label']}", ""])
        if result["top_errors"]:
            lines.extend(["| Count | Sampler | Code | Message |", "|---:|---|---|---|"])
            for error in result["top_errors"]:
                message = error["message"].replace("|", "\\|").replace("\n", " ")
                lines.append(f"| {error['count']} | {error['label']} | {error['code']} | {message} |")
        else:
            lines.append("No failed HTTP samples.")
        if result["resources"]:
            resource = result["resources"]
            lines.extend([
                "",
                f"Backend working set changed from {resource['working_set_start_mb']:.2f} MB to "
                f"{resource['working_set_end_mb']:.2f} MB, with a maximum of "
                f"{resource['working_set_max_mb']:.2f} MB.",
            ])
    return "\n".join(lines) + "\n"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--run", action="append", required=True, help="Label=run-directory")
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--json-output", type=Path)
    args = parser.parse_args()
    results = []
    for item in args.run:
        label, raw_path = item.split("=", 1)
        results.append(analyze_run(label, Path(raw_path).resolve()))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(render_markdown(results), encoding="utf-8")
    if args.json_output:
        args.json_output.parent.mkdir(parents=True, exist_ok=True)
        args.json_output.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()

