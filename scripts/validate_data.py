#!/usr/bin/env python3
import json
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "public" / "data"
ACTIVE = {"RECRUITING", "ACTIVE_NOT_RECRUITING", "NOT_YET_RECRUITING", "ENROLLING_BY_INVITATION"}

def target_family(value):
    if not value or value == "Unclassified": return None
    for family in ("BCMA", "GPRC5D", "FcRH5", "CD38", "Cereblon", "Proteasome", "XPO1", "BCL-2", "SLAMF7"):
        if value.startswith(family): return family
    return value

def fail(message):
    raise SystemExit(f"DATA VALIDATION FAILED: {message}")

def main():
    required = ["summary", "trials", "assets", "changes", "regulatory", "evidence", "market-context", "strategic"]
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
    if any(t.get("sourceUrl") != f"https://clinicaltrials.gov/study/{t.get('nctId')}" for t in trials): fail("ClinicalTrials.gov source URL missing or invalid")
    if any(not t.get("sponsorClass") for t in trials): fail("trial sponsor class missing")
    if summary["trialCount"] != len(trials): fail("summary trial count mismatch")
    if summary["assetCount"] != len(assets): fail("summary asset count mismatch")
    active = [t for t in trials if t["studyType"] == "INTERVENTIONAL" and t["status"] in ACTIVE]
    if summary["activeTrialCount"] != len(active): fail("summary active trial count mismatch")
    if summary["recruitingTrialCount"] != sum(t["studyType"] == "INTERVENTIONAL" and t["status"] == "RECRUITING" for t in trials): fail("summary recruiting count mismatch")
    if not summary.get("datasetVersion") or not summary.get("sourceRetrievedAt"): fail("missing provenance")
    id_set = set(ids)
    broken = [a["id"] for a in assets if not set(a["trialIds"]).issubset(id_set)]
    if broken: fail(f"broken asset references: {broken[:3]}")
    if any(not a.get("trialIds") for a in assets): fail("asset without a linked ClinicalTrials.gov study")
    changes = payload["changes"]
    if not 1 <= len(changes) <= 50: fail(f"unexpected registry change count {len(changes)}")
    change_ids = [event.get("id") for event in changes]
    if len(change_ids) != len(set(change_ids)) or None in change_ids: fail("registry change IDs are missing or duplicated")
    change_records = [(event.get("nctId"), event.get("date")) for event in changes]
    if len(change_records) != len(set(change_records)): fail("registry changes repeat a study and date")
    if any(event.get("type") not in {"RECENT_UPDATE", "NEW_STUDY", "STATUS_CHANGE"} for event in changes): fail("registry change type invalid")
    if any(event.get("severity") not in {"high", "medium", "low"} for event in changes): fail("registry change severity invalid")
    if any(not event.get("sourceUrl") or not event.get("observedAt") or not event.get("date") for event in changes): fail("registry change provenance incomplete")
    severity_order = {"high": 0, "medium": 1, "low": 2}
    type_priority = {"RECENT_UPDATE": 0, "NEW_STUDY": 1, "STATUS_CHANGE": 2}
    expected_change_order = sorted(changes, key=lambda event: severity_order[event["severity"]])
    expected_change_order.sort(key=lambda event: type_priority[event["type"]], reverse=True)
    expected_change_order.sort(key=lambda event: event["date"], reverse=True)
    if changes != expected_change_order: fail("registry changes are not ordered by date, event type, and severity")
    if not payload["regulatory"]: fail("regulatory timeline empty")
    evidence = payload["evidence"]
    if evidence.get("sampleSize", 0) < 100 or len(evidence.get("countsByYear", [])) != 6: fail("PubMed evidence snapshot incomplete")
    if evidence["sampleSize"] != len(evidence["publications"]): fail("PubMed sample size mismatch")
    pmids = [p.get("pmid") for p in evidence["publications"]]
    if len(pmids) != len(set(pmids)): fail("PubMed IDs are duplicated")
    if any(not p.get("pmid") or not p.get("sourceUrl") for p in evidence["publications"]): fail("PubMed evidence provenance incomplete")
    target_counts = evidence.get("targetMomentum", [])
    if len(target_counts) < 10 or not evidence.get("targetCountWindow"): fail("target-level PubMed counts incomplete")
    if len({x.get("name") for x in target_counts}) != len(target_counts): fail("target-level PubMed counts duplicated")
    if any(not isinstance(x.get("value"), int) or x["value"] < 0 for x in target_counts): fail("target-level PubMed count invalid")
    if evidence.get("grantCount", 0) < 25 or not evidence.get("grants"): fail("NIH RePORTER snapshot incomplete")
    grant_ids = [g.get("id") for g in evidence["grants"]]
    if len(grant_ids) != len(set(grant_ids)): fail("NIH application IDs are duplicated")
    if evidence["grantCount"] < len(evidence["grants"]): fail("NIH result total is smaller than retrieved records")
    if any(not g.get("id") or not g.get("sourceUrl") for g in evidence["grants"]): fail("NIH grant provenance incomplete")
    market = payload["market-context"]
    if len(market.get("dailyMedLabels", [])) < 10: fail("DailyMed label snapshot incomplete")
    label_ids = [x.get("setId") for x in market["dailyMedLabels"]]
    if len(label_ids) != len(set(label_ids)): fail("DailyMed set IDs are duplicated")
    if len(market.get("emaMedicines", [])) < 20: fail("EMA medicine snapshot incomplete")
    if not market.get("shortageSourceUpdatedAt"): fail("FDA shortage provenance incomplete")
    if any(not x.get("sourceUrl") for x in market.get("shortages", [])): fail("FDA shortage source URL missing")
    strategic = payload["strategic"]
    if len(strategic.get("targetLandscape", [])) < 5 or len(strategic.get("landscapeMeasures", [])) != 6: fail("strategic landscape measures incomplete")
    strategic_targets = strategic["targetLandscape"]
    if len({x.get("target") for x in strategic_targets}) != len(strategic_targets): fail("strategic target rows duplicated")
    if any(x.get("activeTrials", 0) < x.get("recruitingTrials", 0) for x in strategic_targets): fail("recruiting target count exceeds active count")
    if any(not 0 <= x.get("crowdingScore", -1) <= 100 for x in strategic_targets): fail("target activity index outside 0-100")
    expected_target_trials = defaultdict(set)
    for trial in active:
        families = {target_family(item.get("target")) for item in trial["interventions"]}
        for family in families - {None}:
            expected_target_trials[family].add(trial["nctId"])
    for row in strategic_targets:
        if row["activeTrials"] != len(expected_target_trials[row["target"]]): fail(f"target active-trial mismatch for {row['target']}")
    sponsor_counts = Counter(t["sponsor"] for t in active)
    expected_top5_share = round(100 * sum(v for _, v in sponsor_counts.most_common(5)) / len(active), 1)
    if strategic["top5SponsorShare"] != expected_top5_share: fail("top-five sponsor share mismatch")
    if not strategic.get("geographicFootprint") or not strategic.get("topSponsors") or not strategic.get("industrySponsors") or not strategic.get("institutionSponsors"): fail("strategic landscape cuts incomplete")
    if any(x.get("sponsorClass") != "INDUSTRY" for x in strategic["industrySponsors"]): fail("industry sponsor classification invalid")
    if any(x.get("sponsorClass") == "INDUSTRY" for x in strategic["institutionSponsors"]): fail("institution sponsor classification invalid")
    print(f"Data valid: {len(trials):,} trials, {len(assets):,} assets, {len(changes)} registry changes, {evidence['sampleSize']} publications, {evidence['grantCount']} grants, {len(market['dailyMedLabels'])} labels, {len(market['emaMedicines'])} EMA records, {len(strategic['targetLandscape'])} target families")

if __name__ == "__main__": main()
