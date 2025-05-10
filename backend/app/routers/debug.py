from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse
from app.core.config import settings
from typing import Dict, Any

router = APIRouter()

@router.get("/debug", response_model=Dict[str, Any])
async def debug_info(request: Request) -> JSONResponse:
    """Debug endpoint to return information about API configuration."""
    return JSONResponse({
        "cors_origins": settings.BACKEND_CORS_ORIGINS,
        "client_host": request.client.host if request.client else None,
        "request_headers": dict(request.headers),
        "request_url": str(request.url),
        "frontend_url": settings.FRONTEND_URL,
        "debug_mode": settings.DEBUG,
        "use_sqlite": settings.USE_SQLITE,
    })
