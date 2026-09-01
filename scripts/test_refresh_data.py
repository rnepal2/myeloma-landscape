import unittest
from datetime import date

from scripts.refresh_data import add_months, snapshot_changes


class AddMonthsTest(unittest.TestCase):
    def test_clamps_month_end_across_leap_year(self):
        self.assertEqual(date(2028, 2, 29), add_months(date(2026, 8, 31), 18))

    def test_clamps_month_end_in_non_leap_year(self):
        self.assertEqual(date(2027, 2, 28), add_months(date(2027, 1, 31), 1))

    def test_preserves_valid_day(self):
        self.assertEqual(date(2027, 7, 15), add_months(date(2026, 1, 15), 18))


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
