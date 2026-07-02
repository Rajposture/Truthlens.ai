import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address

from core.config import settings

from api.health import router as health_router
from api.verify import router as verify_router
from api.documents import router as documents_router
from api.reports import router as reports_router
from api.users import router as users_router
from api.chat import router as chat_router



logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper()),
    format="%(asctime)s | %(levelname)s | %(message)s",
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting TruthLens AI...")
    yield
    logger.info("Stopping TruthLens AI...")



limiter = Limiter(key_func=get_remote_address)



app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    lifespan=lifespan,
)

app.state.limiter = limiter

app.add_exception_handler(
    RateLimitExceeded,
    _rate_limit_exceeded_handler,
)

app.add_middleware(SlowAPIMiddleware)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://truthlens-ai-official.vercel.app/",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)




@app.middleware("http")
async def security_headers(request: Request, call_next):

    response = await call_next(request)

    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["X-XSS-Protection"] = "1; mode=block"

    return response



@app.exception_handler(Exception)
async def global_exception_handler(
    request: Request,
    exc: Exception,
):

    logger.exception(exc)

    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "Internal Server Error",
        },
    )



app.include_router(
    health_router,
    tags=["Health"],
)

app.include_router(
    verify_router,
    tags=["Verification"],
)

app.include_router(
    documents_router,
    tags=["Documents"],
)

app.include_router(
    reports_router,
    tags=["Reports"],
)

app.include_router(
    users_router,
    tags=["Users"],
)

app.include_router(
    chat_router,
    tags=["Chat"],
)


@app.get("/")
async def root():

    return {
        "application": settings.APP_NAME,
        "version": "1.0.0",
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "features": [
            "Verification",
            "Documents",
            "Reports",
            "Chat Assistant",
        ],
    }