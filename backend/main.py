from fastapi import FastAPI

from backend.api.health import router as health_router
from backend.api.test_llm import router as llm_router
from backend.api.verify import router as verify_router
from backend.api.documents import router as documents_router

app = FastAPI(
    title="TruthLens AI",
    version="0.1.0"
)


app.include_router(
    health_router,
    tags=["Health"]
)


app.include_router(
    llm_router,
    tags=["LLM"]
)

app.include_router(
    verify_router,
    tags=["Verification"]
)


app.include_router(
    documents_router,
    tags=["Documents"]
)


@app.get("/")
def root():
    return {
        "message": "TruthLens AI Running"
    }