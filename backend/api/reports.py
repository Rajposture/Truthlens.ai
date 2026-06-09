from fastapi import APIRouter

from services.report_service import (
    ReportService
)

router = APIRouter()


@router.get("/reports")
def get_reports():

    return ReportService.get_reports()


@router.post("/reports")
def save_report(
    report: dict
):

    return ReportService.save_report(
        report
    )