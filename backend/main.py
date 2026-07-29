from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from loguru import logger
import sys

from app.config import settings
from app.middleware.logging import RequestLoggingMiddleware
from app.routers.v1 import health, auth, users, careers, recommendations, resume_analysis, roadmaps, skill_gap, dashboard, mentor, interviews
from app.admin.routers import admin_root
from app.admin.core.scheduler import start_notification_scheduler

# Configure logger
logger.remove()
logger.add(
    sys.stdout,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
    level="INFO",
)


def create_application() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        description="The AI Operating System for Student Careers — REST API",
        version=settings.APP_VERSION,
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        openapi_url="/api/openapi.json",
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Request Logging
    app.add_middleware(RequestLoggingMiddleware)

    # Exception Handlers
    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"success": False, "message": str(exc.detail), "code": f"HTTP_{exc.status_code}"},
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        errors = []
        for error in exc.errors():
            field = ".".join(str(loc) for loc in error["loc"][1:]) if len(error["loc"]) > 1 else None
            errors.append({"field": field, "message": error["msg"]})
        return JSONResponse(
            status_code=422,
            content={"success": False, "message": "Validation error", "errors": errors},
        )

    # Routers
    api_prefix = "/api/v1"
    app.include_router(health.router, prefix=api_prefix)
    app.include_router(auth.router, prefix=api_prefix)
    app.include_router(users.router, prefix=api_prefix)
    app.include_router(careers.router, prefix=api_prefix)
    app.include_router(recommendations.router, prefix=api_prefix)
    app.include_router(resume_analysis.router, prefix=api_prefix)
    app.include_router(roadmaps.router, prefix=api_prefix)
    app.include_router(skill_gap.router, prefix=api_prefix)
    app.include_router(dashboard.router, prefix=api_prefix)
    app.include_router(mentor.router, prefix=api_prefix)
    app.include_router(interviews.router, prefix=api_prefix)
    
    # Admin Router
    app.include_router(admin_root.router, prefix=f"{api_prefix}/admin")

    @app.get("/", include_in_schema=False)
    async def root():
        return {"message": f"{settings.APP_NAME} API", "version": settings.APP_VERSION, "docs": "/api/docs"}

    @app.on_event("startup")
    async def startup_event():
        logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
        logger.info(f"Environment: {settings.ENVIRONMENT}")
        logger.info(f"Docs available at: http://{settings.HOST}:{settings.PORT}/api/docs")
        start_notification_scheduler()

    return app


app = create_application()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
