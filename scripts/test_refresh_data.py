import unittest
import io
from datetime import date
from unittest.mock import patch
from urllib.parse import parse_qs, urlparse

from scripts.refresh_data import add_months, eutils_url, snapshot_changes, fiscal_year, date_in_window, classify_intervention, normalize, make_assets, build_summary, build_strategic_intelligence, fetch_json


def sample_trial(nct="NCT00000001", **overrides):
    return {"nctId": nct, "title": "Example study", "studyType": "INTERVENTIONAL", "status": "RECRUITING", "phases": ["PHASE2"], "sponsor": "Example sponsor", "sponsorClass": "INDUSTRY", "interventions": [classify_intervention("Dexamethasone", "DRUG")], "setting": "Not classified", "countries": ["United States"], "locations": [{"country": "United States"}], "hasResults": False, "primaryCompletionDate": "2027-01-10", "firstPosted": "2026-01-01", "lastUpdated": "2026-11-02", **overrides}


class CorrectnessRegressionTest(unittest.TestCase):
    def test_retries_http_success_with_api_error(self):
        responses = [io.StringIO('{"error":"temporary upstream error"}'), io.StringIO('{"esearchresult":{"count":"20"}}')]
        with patch("urllib.request.urlopen", side_effect=responses) as request, patch("time.sleep"):
            result = fetch_json("https://example.org/api", attempts=2)
        self.assertEqual(2, request.call_count)
        self.assertEqual("20", result["esearchresult"]["count"])

    def test_fallback_funding_keeps_recorded_fiscal_year(self):
        trials = [sample_trial()]
        assets = make_assets(trials)
        summary = build_summary(trials, assets, "2026-11-02T00:00:00Z", "test")
        evidence = {"targetMomentum": [], "grants": [{"fiscalYear": 2026, "awardAmount": 500000, "title": "Example myeloma project"}], "targetCountWindow": "2024–2026", "grantAwardsByYear": [{"name": "2026", "value": 500000}]}
        result = build_strategic_intelligence(trials, assets, summary, evidence, "2026-11-02T00:00:00Z")
        self.assertIsNone(result["targetLandscape"][0]["recentPublications"])
        funding = next(x for x in result["landscapeMeasures"] if x["id"] == "nih-funding")
        self.assertEqual("$500K in FY2026", funding["metric"])
        self.assertIn("1 FY2026 records", funding["title"])

    def test_distinct_entity_studies(self):
        trial = sample_trial()
        trial["interventions"].append(classify_intervention("Dexamethasone 10mg", "DRUG"))
        asset = make_assets([trial])[0]
        self.assertEqual(1, asset["activeTrialCount"])
        self.assertEqual(1, asset["recruitingTrialCount"])
        self.assertEqual({"RECRUITING": 1}, asset["statusCounts"])

    def test_country_aggregation_precedes_display_limit(self):
        raw = {"protocolSection": {"identificationModule": {"nctId": "NCT00000001"}, "contactsLocationsModule": {"locations": [{"city": str(n), "country": "United States"} for n in range(12)] + [{"city": "London", "country": "United Kingdom"}]}}}
        trial = normalize(raw)
        self.assertEqual(12, len(trial["locations"]))
        self.assertEqual(["United Kingdom", "United States"], trial["countries"])

    def test_classification_token_collision(self):
        self.assertEqual("p300/CBP", classify_intervention("CCS1477", "DRUG")["target"])
        self.assertNotIn("target", classify_intervention("CCS1234", "DRUG"))
        self.assertEqual("SLAMF7", classify_intervention("Anti-CS1 antibody", "BIOLOGICAL")["target"])

    def test_fiscal_rollover_and_imprecise_dates(self):
        self.assertEqual(2026, fiscal_year(date(2026, 9, 30)))
        self.assertEqual(2027, fiscal_year(date(2026, 10, 1)))
        self.assertTrue(date_in_window("2026-11", date(2026, 11, 20), date(2027, 1, 1)))
        self.assertFalse(date_in_window("2026-10", date(2026, 11, 1), date(2027, 1, 1)))

    def test_phase3_window_not_limited_by_first_twenty_studies(self):
        trials = [sample_trial(f"NCT{n:08d}", primaryCompletionDate="2026-11-05") for n in range(21)]
        trials.append(sample_trial("NCT00000999", phases=["PHASE3"], primaryCompletionDate="2027-01-10"))
        assets = make_assets(trials)
        summary = build_summary(trials, assets, "2026-11-02T00:00:00Z", "test")
        evidence = {"targetMomentum": [], "grants": [], "targetCountWindow": "2024–2026", "currentFiscalYear": 2027}
        strategic = build_strategic_intelligence(trials, assets, summary, evidence, "2026-11-02T00:00:00Z")
        self.assertEqual(20, len(summary["upcomingMilestones"]))
        self.assertEqual(["NCT00000999"], [x["nctId"] for x in strategic["lateStageMilestones"]])

    def test_completion_and_results_changes_preserve_before_after(self):
        old = sample_trial()
        current = sample_trial(primaryCompletionDate="2027-02", hasResults=True)
        event = snapshot_changes([current], [old], "2026-11-02T00:00:00Z")[0]
        self.assertEqual("RESULTS_POSTED", event["type"])
        self.assertEqual(2, len(event["changes"]))
        self.assertEqual("2027-01-10", event["changes"][0]["before"])


class AddMonthsTest(unittest.TestCase):
    def test_clamps_month_end_across_leap_year(self):
        self.assertEqual(date(2028, 2, 29), add_months(date(2026, 8, 31), 18))

    def test_clamps_month_end_in_non_leap_year(self):
        self.assertEqual(date(2027, 2, 28), add_months(date(2027, 1, 31), 1))

    def test_preserves_valid_day(self):
        self.assertEqual(date(2027, 7, 15), add_months(date(2026, 1, 15), 18))


class EutilsUrlTest(unittest.TestCase):
    def test_requires_contact(self):
        with patch.dict("os.environ", {"NCBI_EMAIL": ""}):
            with self.assertRaisesRegex(RuntimeError, "NCBI_EMAIL is required"):
                eutils_url("esearch.fcgi", {"db": "pubmed"})

    def test_identifies_pubmed_requests(self):
        with patch.dict("os.environ", {"NCBI_EMAIL": "contact@example.org"}):
            url = eutils_url("esearch.fcgi", {"db": "pubmed", "term": "multiple myeloma"})

        parsed = urlparse(url)
        self.assertEqual("eutils.ncbi.nlm.nih.gov", parsed.hostname)
        self.assertEqual(
            {
                "db": ["pubmed"],
                "term": ["multiple myeloma"],
                "tool": ["myeloma_landscape"],
                "email": ["contact@example.org"],
            },
            parse_qs(parsed.query),
        )


class SnapshotChangesTest(unittest.TestCase):
    def test_retains_history_and_prefers_explicit_changes(self):
        now = "2026-07-14T11:17:00Z"
        previous_trial = {
            "nctId": "NCT00000001",
            "title": "Example study",
            "status": "RECRUITING",
            "phases": ["PHASE2"],
            "sponsor": "Example sponsor",
            "firstPosted": "2026-07-10",
            "lastUpdated": "2026-07-14",
        }
        current_trial = {**previous_trial, "status": "SUSPENDED"}
        previous_events = [
            {
                "id": "recent-update-nct00000001-2026-07-14",
                "type": "RECENT_UPDATE",
                "severity": "medium",
                "title": "Older generic update",
                "detail": "Older detail",
                "date": "2026-07-14",
                "nctId": "NCT00000001",
                "sourceUrl": "https://clinicaltrials.gov/study/NCT00000001",
                "observedAt": "2026-07-14T10:00:00Z",
            },
            {
                "id": "status-change-nct00000002-2026-07-13",
                "type": "STATUS_CHANGE",
                "severity": "medium",
                "title": "Historical status change",
                "detail": "Historical detail",
                "date": "2026-07-13",
                "nctId": "NCT00000002",
                "sourceUrl": "https://clinicaltrials.gov/study/NCT00000002",
                "observedAt": "2026-07-13T10:00:00Z",
            },
        ]

        events = snapshot_changes(
            [current_trial], [previous_trial], now, previous_events
        )

        self.assertEqual(2, len(events))
        self.assertEqual("STATUS_CHANGE", events[0]["type"])
        self.assertEqual("NCT00000001", events[0]["nctId"])
        self.assertEqual("NCT00000002", events[1]["nctId"])


if __name__ == "__main__":
    unittest.main()
