from fastapi import FastAPI

from backend.api.health import router as health_router
from backend.api.test_llm import router as llm_router

app = FastAPI(
    title="TruthLens AI"
)

app.include_router(
    health_router,
    tags=["Health"]
)

app.include_router(
    llm_router,
    tags=["LLM"]
)


@app.get("/")
def root():
    return {
        "message": "TruthLens AI Running"
    }