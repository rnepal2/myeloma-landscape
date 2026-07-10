#!/usr/bin/env python3
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "public" / "data"

def fail(message):
    raise SystemExit(f"DATA VALIDATION FAILED: {message}")

def main():
    required = ["summary", "trials", "assets", "changes", "regulatory"]
    payload = {}
    for name in required:
        path = DATA / f"{name}.json"
        if not path.exists() or path.stat().st_size == 0:
            fail(f"missing {path}")
        payload[name] = json.loads(path.read_text())
    trials, assets, summary = payload["trials"], payload["assets"], payload["summary"]
    if len(trials) < 1000: fail(f"unexpected trial count {len(trials)}")
    ids = [t.get("nctId") for t in trials]
    if len(ids) != len(set(ids)) or None in ids: fail("NCT IDs are missing or duplicated")
    if summary["trialCount"] != len(trials): fail("summary trial count mismatch")
    if summary["assetCount"] != len(assets): fail("summary asset count mismatch")
    if not summary.get("datasetVersion") or not summary.get("sourceRetrievedAt"): fail("missing provenance")
    id_set = set(ids)
    broken = [a["id"] for a in assets if not set(a["trialIds"]).issubset(id_set)]
    if broken: fail(f"broken asset references: {broken[:3]}")
    if not payload["regulatory"]: fail("regulatory timeline empty")
    print(f"Data valid: {len(trials):,} trials, {len(assets):,} assets, {len(payload['changes'])} signals")

if __name__ == "__main__": main()
