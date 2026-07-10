#!/usr/bin/env python3
"""Build a compact, validated multiple-myeloma landscape snapshot.

Uses only the Python standard library so the scheduled workflow stays portable.
"""
from __future__ import annotations

import hashlib
from html.parser import HTMLParser
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "data"
PREVIOUS = OUT / "trials.json"
ONTOLOGY = json.loads((ROOT / "config" / "ontology.json").read_text())
REGULATORY = json.loads((ROOT / "config" / "regulatory_events.json").read_text())
API = "https://clinicaltrials.gov/api/v2/studies"
FDA_ONCOLOGY = "https://www.fda.gov/drugs/resources-information-approved-drugs/oncology-cancerhematologic-malignancies-approval-notifications"
EUTILS = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"
NIH_REPORTER = "https://api.reporter.nih.gov/v2/projects/search"
QUERY = '"Multiple Myeloma"'
FIELDS = "|".join([
    "NCTId", "BriefTitle", "BriefSummary", "OverallStatus", "Phase", "StudyType",
    "LeadSponsorName", "CollaboratorName", "InterventionName", "InterventionType",
    "Condition", "StartDate", "PrimaryCompletionDate", "CompletionDate", "EnrollmentCount",
    "LocationCity", "LocationState", "LocationCountry", "HasResults", "StudyFirstPostDate",
    "LastUpdatePostDate",
])
ACTIVE = {"RECRUITING", "ACTIVE_NOT_RECRUITING", "NOT_YET_RECRUITING", "ENROLLING_BY_INVITATION"}
PHASE_ORDER = {"EARLY_PHASE1": 0.5, "PHASE1": 1, "PHASE2": 2, "PHASE3": 3, "PHASE4": 4, "NA": 0}


def fetch_json(url: str, attempts: int = 4) -> dict:
    for attempt in range(attempts):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "myeloma-landscape-radar/0.1 (public research project)"})
            with urllib.request.urlopen(req, timeout=45) as response:
                return json.load(response)
        except Exception:
            if attempt == attempts - 1:
                raise
            time.sleep(2 ** attempt)
    raise RuntimeError("unreachable")


def post_json(url: str, payload: dict, attempts: int = 4) -> dict:
    body = json.dumps(payload).encode("utf-8")
    for attempt in range(attempts):
        try:
            req = urllib.request.Request(url, data=body, headers={"User-Agent": "myeloma-landscape-radar/0.1 (public research project)", "Content-Type": "application/json"}, method="POST")
            with urllib.request.urlopen(req, timeout=60) as response:
                return json.load(response)
        except Exception:
            if attempt == attempts - 1:
                raise
            time.sleep(2 ** attempt)
    raise RuntimeError("unreachable")


def fetch_studies() -> list[dict]:
    studies, token = [], None
    while True:
        params = {"query.cond": QUERY, "pageSize": "1000", "format": "json", "fields": FIELDS}
        if token:
            params["pageToken"] = token
        payload = fetch_json(f"{API}?{urllib.parse.urlencode(params)}")
        studies.extend(payload.get("studies", []))
        token = payload.get("nextPageToken")
        print(f"Fetched {len(studies):,} studies", file=sys.stderr)
        if not token:
            return studies


class FdaTableParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_row = False; self.in_cell = False; self.cell_parts = []; self.cells = []; self.href = None; self.rows = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "tr":
            self.in_row = True; self.cells = []; self.href = None
        elif self.in_row and tag == "td":
            self.in_cell = True; self.cell_parts = []
        elif self.in_cell and tag == "a" and not self.href:
            self.href = attrs.get("href")

    def handle_data(self, data):
        if self.in_cell:
            self.cell_parts.append(data)

    def handle_endtag(self, tag):
        if tag == "td" and self.in_cell:
            self.cells.append(re.sub(r"\s+", " ", "".join(self.cell_parts)).strip())
            self.in_cell = False
        elif tag == "tr" and self.in_row:
            if len(self.cells) >= 3:
                self.rows.append((self.cells[0], self.cells[1], self.cells[2], self.href))
            self.in_row = False


def fetch_fda_events() -> list[dict]:
    req = urllib.request.Request(FDA_ONCOLOGY, headers={"User-Agent": "myeloma-landscape-radar/0.1 (public research project)"})
    with urllib.request.urlopen(req, timeout=45) as response:
        html = response.read().decode("utf-8", "replace")
    parser = FdaTableParser(); parser.feed(html)
    events = []
    for title, detail, raw_date, href in parser.rows:
        if "multiple myeloma" not in f"{title} {detail}".lower():
            continue
        try:
            date = datetime.strptime(raw_date.strip(), "%m/%d/%Y").date().isoformat()
        except ValueError:
            continue
        classified = classify_intervention(title, "BIOLOGICAL")
        direct_url = urllib.parse.urljoin("https://www.fda.gov", href or FDA_ONCOLOGY)
        events.append({
            "id": slug(f"fda-{date}-{title}"), "date": date,
            "asset": classified["canonicalName"] if classified["canonicalName"] != title else "Multiple myeloma therapy",
            "title": title, "detail": detail, "target": classified.get("target", "See FDA source"),
            "eventType": "Accelerated approval" if "accelerated approval" in title.lower() else "Approval",
            "sourceUrl": direct_url,
        })
    if not events:
        raise RuntimeError("FDA page returned no multiple myeloma approval events")
    return sorted(events, key=lambda x: x["date"], reverse=True)


def fetch_pubmed_evidence() -> dict:
    query = '("multiple myeloma"[Title] OR "plasma cell myeloma"[Title])'
    params = {"db": "pubmed", "term": query, "retmode": "json", "retmax": "200", "sort": "pub date"}
    search = fetch_json(f"{EUTILS}/esearch.fcgi?{urllib.parse.urlencode(params)}")
    search_result = search.get("esearchresult", {})
    ids = search_result.get("idlist", [])
    if not ids:
        raise RuntimeError("PubMed returned no evidence records")
    time.sleep(0.4)
    summaries = fetch_json(f"{EUTILS}/esummary.fcgi?{urllib.parse.urlencode({'db':'pubmed','id':','.join(ids),'retmode':'json'})}").get("result", {})
    publications = []
    for pmid in ids:
        item = summaries.get(pmid, {})
        title = re.sub(r"\s+", " ", item.get("title", "")).strip().rstrip(".")
        if not title:
            continue
        lower = title.lower()
        linked_assets = []
        linked_targets = set()
        for asset in ONTOLOGY["assets"]:
            if any(re.search(rf"(?<![a-z0-9]){re.escape(alias)}(?![a-z0-9])", lower) for alias in asset["aliases"]):
                linked_assets.append(asset["name"]); linked_targets.add(asset["target"])
        for rule in ONTOLOGY["target_rules"]:
            if re.search(rule["pattern"], lower, re.I):
                linked_targets.add(rule["value"])
        article_ids = {x.get("idtype"): x.get("value") for x in item.get("articleids", [])}
        date = item.get("sortpubdate", "")[:10].replace("/", "-") or item.get("pubdate", "")
        authors = [x.get("name") for x in item.get("authors", [])[:4] if x.get("name")]
        publications.append({
            "pmid": pmid, "title": title, "date": date, "journal": item.get("fulljournalname") or item.get("source") or "Not reported",
            "authors": authors, "doi": article_ids.get("doi"), "linkedAssets": sorted(set(linked_assets)),
            "linkedTargets": sorted(linked_targets), "sourceUrl": f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/",
        })
    counts_by_year = []
    current_year = datetime.now(timezone.utc).year
    for year in range(current_year - 5, current_year + 1):
        time.sleep(0.4)
        year_query = f'{query} AND {year}[PDAT]'
        count_payload = fetch_json(f"{EUTILS}/esearch.fcgi?{urllib.parse.urlencode({'db':'pubmed','term':year_query,'retmode':'json','retmax':'0'})}")
        counts_by_year.append({"name": str(year), "value": int(count_payload.get("esearchresult", {}).get("count", 0))})
    target_counter = Counter(target for pub in publications for target in pub["linkedTargets"])
    journal_counter = Counter(pub["journal"] for pub in publications)
    grant_payload = {
        "criteria": {"advanced_text_search": {"operator": "and", "search_field": "projecttitle", "search_text": '"multiple myeloma"'}, "fiscal_years": [current_year - 2, current_year - 1, current_year]},
        "include_fields": ["ApplId", "ProjectTitle", "Organization", "ProjectNum", "FiscalYear", "AwardAmount", "AwardNoticeDate", "ProjectStartDate", "ProjectEndDate", "PrincipalInvestigators", "ProjectDetailUrl"],
        "offset": 0, "limit": 250, "sort_field": "award_notice_date", "sort_order": "desc"
    }
    grant_response = post_json(NIH_REPORTER, grant_payload)
    grants = []
    for item in grant_response.get("results", []):
        org = item.get("organization") or {}
        grants.append({
            "id": str(item.get("appl_id")), "title": item.get("project_title", "Untitled project"),
            "organization": org.get("org_name", "Not reported"), "projectNumber": item.get("project_num"),
            "fiscalYear": item.get("fiscal_year"), "awardAmount": item.get("award_amount") or 0,
            "awardDate": (item.get("award_notice_date") or "")[:10],
            "principalInvestigators": [x.get("full_name", "").strip() for x in item.get("principal_investigators", []) if x.get("full_name")],
            "sourceUrl": item.get("project_detail_url") or "https://reporter.nih.gov/",
        })
    grant_years = Counter()
    for grant in grants:
        grant_years[str(grant["fiscalYear"])] += grant["awardAmount"]
    return {
        "generatedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "query": query, "totalCount": int(search_result.get("count", 0)), "sampleSize": len(publications),
        "countsByYear": counts_by_year, "targetMomentum": [{"name": k, "value": v} for k, v in target_counter.most_common(10)],
        "topJournals": [{"name": k, "value": v} for k, v in journal_counter.most_common(8)],
        "publications": publications,
        "grantCount": int(grant_response.get("meta", {}).get("total", len(grants))), "grants": grants,
        "grantAwardsByYear": [{"name": str(y), "value": grant_years[str(y)]} for y in range(current_year - 2, current_year + 1)],
        "methodology": "Most recent PubMed records matching multiple myeloma in the citation title; target and asset links use deterministic title matching and do not imply evidence quality, clinical relevance or positive outcomes. NIH funding records require the disease phrase in the project title."
    }


def compact_date(module: dict, key: str) -> str | None:
    return (module.get(key) or {}).get("date")


def clean_name(value: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"[®™]", "", value)).strip()


def slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def classify_intervention(name: str, kind: str) -> dict:
    cleaned, lower = clean_name(name), clean_name(name).lower()
    for asset in ONTOLOGY["assets"]:
        if any(re.search(rf"(?<![a-z0-9]){re.escape(alias)}(?![a-z0-9])", lower) for alias in asset["aliases"]):
            return {"name": cleaned, "canonicalName": asset["name"], "type": kind, "target": asset["target"], "modality": asset["modality"]}
    target = next((r["value"] for r in ONTOLOGY["target_rules"] if re.search(r["pattern"], lower, re.I)), None)
    modality = next((r["value"] for r in ONTOLOGY["modality_rules"] if re.search(r["pattern"], lower, re.I)), None)
    if not modality:
        modality = {"DRUG": "Drug", "BIOLOGICAL": "Biological", "COMBINATION_PRODUCT": "Combination product"}.get(kind)
    result = {"name": cleaned, "canonicalName": cleaned, "type": kind}
    if target:
        result["target"] = target
    if modality:
        result["modality"] = modality
    return result


def infer_setting(title: str, summary: str) -> str:
    text = f"{title} {summary}".lower()
    if "smoldering" in text or "smouldering" in text:
        return "Smoldering"
    if "newly diagnosed" in text or "new diagnosis" in text or "frontline" in text or "front-line" in text:
        if "transplant ineligible" in text or "not eligible for transplant" in text:
            return "Newly diagnosed · transplant ineligible"
        if "transplant eligible" in text:
            return "Newly diagnosed · transplant eligible"
        return "Newly diagnosed"
    if "relapsed" in text or "refractory" in text or "rrmm" in text:
        return "Relapsed / refractory"
    if "maintenance" in text:
        return "Maintenance"
    if "plasma cell leukemia" in text:
        return "Plasma cell leukemia"
    return "Multiple myeloma · setting not classified"


def normalize(raw: dict) -> dict:
    p = raw.get("protocolSection", {})
    ident, status = p.get("identificationModule", {}), p.get("statusModule", {})
    sponsor = p.get("sponsorCollaboratorsModule", {})
    design, arms = p.get("designModule", {}), p.get("armsInterventionsModule", {})
    contacts, conditions = p.get("contactsLocationsModule", {}), p.get("conditionsModule", {})
    desc = p.get("descriptionModule", {})
    title, brief = ident.get("briefTitle", "Untitled study"), desc.get("briefSummary", "")
    interventions = [classify_intervention(x.get("name", "Unknown intervention"), x.get("type", "OTHER")) for x in arms.get("interventions", [])]
    locations = []
    seen_locations = set()
    for loc in contacts.get("locations", []):
        item = {k: v for k, v in {"city": loc.get("city"), "state": loc.get("state"), "country": loc.get("country")}.items() if v}
        marker = tuple(item.items())
        if marker and marker not in seen_locations:
            locations.append(item); seen_locations.add(marker)
    nct_id = ident.get("nctId")
    return {
        "nctId": nct_id, "title": title, "status": status.get("overallStatus", "UNKNOWN"),
        "phases": design.get("phases", ["NA"]), "sponsor": (sponsor.get("leadSponsor") or {}).get("name", "Not reported"),
        "collaborators": [x.get("name") for x in sponsor.get("collaborators", []) if x.get("name")],
        "interventions": interventions, "conditions": conditions.get("conditions", []),
        "startDate": compact_date(status, "startDateStruct"),
        "primaryCompletionDate": compact_date(status, "primaryCompletionDateStruct"),
        "completionDate": compact_date(status, "completionDateStruct"),
        "enrollment": (design.get("enrollmentInfo") or {}).get("count"), "studyType": design.get("studyType", "UNKNOWN"),
        "hasResults": bool(raw.get("hasResults")), "locations": locations[:12], "briefSummary": brief[:800],
        "firstPosted": compact_date(status, "studyFirstPostDateStruct"), "lastUpdated": compact_date(status, "lastUpdatePostDateStruct"),
        "setting": infer_setting(title, brief), "sourceUrl": f"https://clinicaltrials.gov/study/{nct_id}"
    }


def make_assets(trials: list[dict]) -> list[dict]:
    groups = {}
    ignored = {"PLACEBO", "NO INTERVENTION", "STANDARD OF CARE"}
    for trial in trials:
        for intervention in trial["interventions"]:
            if intervention["type"] not in {"DRUG", "BIOLOGICAL", "COMBINATION_PRODUCT"} or intervention["canonicalName"].upper() in ignored:
                continue
            key = slug(intervention["canonicalName"])
            group = groups.setdefault(key, {"id": key, "name": intervention["canonicalName"], "aliases": set(), "target": intervention.get("target", "Unclassified"), "modality": intervention.get("modality", "Unclassified"), "trials": [], "sponsors": set(), "settings": set(), "statuses": Counter(), "phases": set(), "active": 0, "recruiting": 0})
            group["aliases"].add(intervention["name"]); group["trials"].append(trial["nctId"]); group["sponsors"].add(trial["sponsor"]); group["settings"].add(trial["setting"]); group["statuses"][trial["status"]] += 1; group["phases"].update(trial["phases"])
            if trial["studyType"] == "INTERVENTIONAL" and trial["status"] in ACTIVE:
                group["active"] += 1
            if trial["studyType"] == "INTERVENTIONAL" and trial["status"] == "RECRUITING":
                group["recruiting"] += 1
    result = []
    for g in groups.values():
        unique_trials = sorted(set(g["trials"]))
        statuses = g["statuses"]
        result.append({"id": g["id"], "name": g["name"], "aliases": sorted(g["aliases"]), "target": g["target"], "modality": g["modality"], "trialCount": len(unique_trials), "activeTrialCount": g["active"], "recruitingTrialCount": g["recruiting"], "highestPhase": max(g["phases"] or {"NA"}, key=lambda x: PHASE_ORDER.get(x, 0)), "sponsors": sorted(g["sponsors"]), "settings": sorted(g["settings"]), "statusCounts": dict(statuses), "trialIds": unique_trials})
    return sorted(result, key=lambda x: (-x["activeTrialCount"], -x["trialCount"], x["name"].lower()))


def snapshot_changes(trials: list[dict], previous: list[dict] | None, now: str) -> list[dict]:
    events = []
    current_map = {t["nctId"]: t for t in trials}
    previous_map = {t["nctId"]: t for t in previous or []}
    if previous:
        for nct, trial in current_map.items():
            old = previous_map.get(nct)
            if not old:
                events.append({"type":"NEW_STUDY", "severity":"medium", "title":f"New study registered: {trial['title']}", "detail":f"{trial['sponsor']} added a {', '.join(trial['phases']) or 'phase not reported'} study.", "date":trial.get("firstPosted") or now[:10], "nctId":nct})
            elif old.get("status") != trial.get("status"):
                severe = "high" if trial["status"] in {"TERMINATED", "WITHDRAWN", "SUSPENDED"} else "medium"
                events.append({"type":"STATUS_CHANGE", "severity":severe, "title":f"{nct} moved to {trial['status'].replace('_', ' ').title()}", "detail":f"Registry status changed from {old.get('status', 'unknown').replace('_', ' ').title()} for {trial['title']}.", "date":trial.get("lastUpdated") or now[:10], "nctId":nct})
    if not events:
        dated = sorted([t for t in trials if t.get("lastUpdated")], key=lambda x: x["lastUpdated"], reverse=True)
        for trial in dated[:16]:
            severity = "high" if trial["status"] in {"TERMINATED", "SUSPENDED", "WITHDRAWN"} or "PHASE3" in trial["phases"] else "medium" if trial["status"] == "RECRUITING" else "low"
            events.append({"type":"RECENT_UPDATE", "severity":severity, "title":f"Registry update: {trial['title']}", "detail":f"{trial['sponsor']} updated this {', '.join(trial['phases']).replace('_', ' ').title()} record; current status is {trial['status'].replace('_', ' ').title()}.", "date":trial["lastUpdated"], "nctId":trial["nctId"]})
    for event in events:
        event["id"] = slug(f"{event['type']}-{event.get('nctId')}-{event['date']}")
        event["sourceUrl"] = f"https://clinicaltrials.gov/study/{event.get('nctId')}"
        event["observedAt"] = now
    severity_order = {"high": 0, "medium": 1, "low": 2}
    events.sort(key=lambda e: e["date"], reverse=True)
    events.sort(key=lambda e: severity_order[e["severity"]])
    return events[:50]


def build_summary(trials: list[dict], assets: list[dict], now: str, version: str) -> dict:
    active = [t for t in trials if t["studyType"] == "INTERVENTIONAL" and t["status"] in ACTIVE]
    def ranked(counter, limit=12):
        return [{"name": k, "value": v} for k, v in counter.most_common(limit)]
    phase_counts, status_counts, sponsors = Counter(), Counter(), Counter()
    target_counts, modality_counts = Counter(), Counter()
    for trial in active:
        phase_counts.update(trial["phases"]); status_counts[trial["status"]] += 1; sponsors[trial["sponsor"]] += 1
        target_counts.update({i.get("target", "Unclassified") for i in trial["interventions"] if i["type"] in {"DRUG", "BIOLOGICAL", "COMBINATION_PRODUCT"}})
        modality_counts.update({i.get("modality", "Unclassified") for i in trial["interventions"] if i["type"] in {"DRUG", "BIOLOGICAL", "COMBINATION_PRODUCT"}})
    phase_labels = {"PHASE1":"Phase 1", "PHASE2":"Phase 2", "PHASE3":"Phase 3", "PHASE4":"Phase 4", "EARLY_PHASE1":"Early Phase 1", "NA":"Not applicable"}
    counts_by_phase = [{"name": phase_labels.get(p, p), "value": phase_counts[p]} for p in ["EARLY_PHASE1", "PHASE1", "PHASE2", "PHASE3", "PHASE4", "NA"] if phase_counts[p]]
    today = now[:10]
    upcoming = sorted([{"nctId":t["nctId"], "title":t["title"], "date":t["primaryCompletionDate"], "phase":max(t["phases"], key=lambda x: PHASE_ORDER.get(x,0)), "sponsor":t["sponsor"]} for t in active if t.get("primaryCompletionDate") and t["primaryCompletionDate"] >= today], key=lambda x:x["date"])[:20]
    target_counts.pop("Unclassified", None); modality_counts.pop("Unclassified", None)
    return {"generatedAt":now, "sourceRetrievedAt":now, "datasetVersion":version, "trialCount":len(trials), "activeTrialCount":len(active), "recruitingTrialCount":sum(t["studyType"] == "INTERVENTIONAL" and t["status"] == "RECRUITING" for t in trials), "phase23ActiveCount":sum(bool({"PHASE2","PHASE3"} & set(t["phases"])) for t in active), "assetCount":len(assets), "sponsorCount":len({t["sponsor"] for t in trials}), "resultsTrialCount":sum(t["hasResults"] for t in trials), "countsByPhase":counts_by_phase, "countsByStatus":ranked(status_counts), "countsByTarget":ranked(target_counts), "countsByModality":ranked(modality_counts), "topSponsors":ranked(sponsors), "upcomingMilestones":upcoming, "methodology":{"query":QUERY, "scope":"All returned registry records; headline metrics use interventional studies with recruiting, active-not-recruiting, not-yet-recruiting or enrolling-by-invitation status.", "source":"https://clinicaltrials.gov/data-api/api"}}


def write_json(path: Path, value) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, separators=(",", ":")) + "\n")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    previous = json.loads(PREVIOUS.read_text()) if PREVIOUS.exists() else None
    raw = fetch_studies()
    trials = sorted((normalize(x) for x in raw), key=lambda x: (x.get("lastUpdated") or "", x["nctId"]), reverse=True)
    if len(trials) < 1000 or any(not t.get("nctId") for t in trials):
        raise RuntimeError(f"Validation failed before write: {len(trials)} records")
    version = hashlib.sha256(json.dumps(trials, sort_keys=True).encode()).hexdigest()[:12]
    now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    assets = make_assets(trials)
    changes = snapshot_changes(trials, previous, now)
    summary = build_summary(trials, assets, now, version)
    write_json(OUT / "trials.json", trials); write_json(OUT / "assets.json", assets)
    write_json(OUT / "changes.json", changes); write_json(OUT / "summary.json", summary)
    try:
        fda_events = fetch_fda_events()
        oldest_live = min(x["date"] for x in fda_events)
        regulatory = fda_events + [x for x in REGULATORY if x["date"] < oldest_live]
    except Exception as exc:
        print(f"FDA refresh warning; retaining curated fallback: {exc}", file=sys.stderr)
        regulatory = sorted(REGULATORY, key=lambda x: x["date"], reverse=True)
    write_json(OUT / "regulatory.json", regulatory)
    try:
        evidence = fetch_pubmed_evidence()
        write_json(OUT / "evidence.json", evidence)
    except Exception as exc:
        if not (OUT / "evidence.json").exists():
            raise
        print(f"PubMed refresh warning; retaining accepted evidence snapshot: {exc}", file=sys.stderr)
    print(f"Built {len(trials):,} trials, {len(assets):,} assets, version {version}")


if __name__ == "__main__":
    main()
