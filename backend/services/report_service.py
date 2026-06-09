import json
from pathlib import Path


class ReportService:

    REPORT_FILE = Path(
        "data/reports.json"
    )

    @classmethod
    def get_reports(cls):

        if not cls.REPORT_FILE.exists():
            return []

        with open(
            cls.REPORT_FILE,
            "r",
            encoding="utf-8"
        ) as f:
            return json.load(f)

    @classmethod
    def save_report(
        cls,
        report
    ):

        reports = cls.get_reports()

        reports.insert(
            0,
            report
        )

        cls.REPORT_FILE.parent.mkdir(
            parents=True,
            exist_ok=True
        )

        with open(
            cls.REPORT_FILE,
            "w",
            encoding="utf-8"
        ) as f:
            json.dump(
                reports,
                f,
                indent=2
            )

        return report