from fastapi import APIRouter

router = APIRouter()


@router.get("/reports")
def get_reports():
    return {
        "status": "success",
        "reports": []
    }


@router.get("/reports/{report_id}")
def get_report(report_id: str):
    return {
        "status": "success",
        "report_id": report_id
    }