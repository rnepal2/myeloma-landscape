#!/usr/bin/env python3
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "public" / "data"

def fail(message):
    raise SystemExit(f"DATA VALIDATION FAILED: {message}")

def main():
    required = ["summary", "trials", "assets", "changes", "regulatory", "evidence"]
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
    evidence = payload["evidence"]
    if evidence.get("sampleSize", 0) < 100 or len(evidence.get("countsByYear", [])) != 6: fail("PubMed evidence snapshot incomplete")
    if any(not p.get("pmid") or not p.get("sourceUrl") for p in evidence["publications"]): fail("PubMed evidence provenance incomplete")
    if evidence.get("grantCount", 0) < 25 or not evidence.get("grants"): fail("NIH RePORTER snapshot incomplete")
    if any(not g.get("id") or not g.get("sourceUrl") for g in evidence["grants"]): fail("NIH grant provenance incomplete")
    print(f"Data valid: {len(trials):,} trials, {len(assets):,} assets, {len(payload['changes'])} signals, {evidence['sampleSize']} publications, {evidence['grantCount']} grants")

if __name__ == "__main__": main()
