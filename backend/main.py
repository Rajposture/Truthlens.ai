from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.health import router as health_router
from api.verify import router as verify_router
from api.documents import router as documents_router
from api.reports import router as reports_router

app = FastAPI(
    title="TruthLens AI",
    version="0.1.0"
)

# CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health
app.include_router(
    health_router,
    tags=["Health"]
)

# Verification
app.include_router(
    verify_router,
    tags=["Verification"]
)

# Documents
app.include_router(
    documents_router,
    tags=["Documents"]
)

# Reports
app.include_router(
    reports_router,
    tags=["Reports"]
)


@app.get("/")
def root():
    return {
        "message": "TruthLens AI Running",
        "status": "healthy"
    }