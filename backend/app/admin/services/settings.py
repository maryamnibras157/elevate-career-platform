from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.admin.repositories.settings import AdminSettingsRepository
from app.admin.schemas.settings.settings import SystemSettingUpdateBatch, SystemInfoOut
from app.config import settings as app_settings
import sys
import fastapi

class AdminSettingsService:
    def __init__(self, session: AsyncSession):
        self.repo = AdminSettingsRepository(session)

    async def initialize_defaults(self):
        await self.repo.seed_default_settings()

    async def get_all_settings(self) -> Dict[str, Any]:
        await self.initialize_defaults()
        db_settings = await self.repo.get_all()
        
        grouped: Dict[str, List[Dict[str, Any]]] = {
            "general": [],
            "platform": [],
            "ai": [],
            "email": [],
            "security": []
        }
        
        for setting in db_settings:
            cat = setting.category
            if cat not in grouped:
                grouped[cat] = []
                
            val = setting.value.get("value") if setting.value else None
            if setting.is_secret:
                val = "********"
                
            grouped[cat].append({
                "key": setting.key,
                "category": setting.category,
                "value": val,
                "description": setting.description,
                "is_secret": setting.is_secret,
                "updated_by": str(setting.updated_by) if setting.updated_by else None,
                "updated_at": setting.updated_at.isoformat()
            })
            
        # Add Read-Only Environment Settings
        grouped["email"].extend([
            {"key": "MAIL_SERVER", "category": "email", "value": app_settings.MAIL_SERVER, "description": "SMTP Host", "is_secret": False, "read_only": True},
            {"key": "MAIL_PORT", "category": "email", "value": app_settings.MAIL_PORT, "description": "SMTP Port", "is_secret": False, "read_only": True},
            {"key": "MAIL_FROM", "category": "email", "value": app_settings.MAIL_FROM, "description": "Sender Address", "is_secret": False, "read_only": True},
            {"key": "MAIL_USERNAME", "category": "email", "value": "********" if app_settings.MAIL_USERNAME else "Not Configured", "description": "SMTP Username", "is_secret": True, "read_only": True},
        ])
        
        grouped["security"].extend([
            {"key": "ACCESS_TOKEN_EXPIRE_MINUTES", "category": "security", "value": app_settings.ACCESS_TOKEN_EXPIRE_MINUTES, "description": "JWT Lifetime (minutes)", "is_secret": False, "read_only": True},
            {"key": "REFRESH_TOKEN_EXPIRE_DAYS", "category": "security", "value": app_settings.REFRESH_TOKEN_EXPIRE_DAYS, "description": "Refresh Lifetime (days)", "is_secret": False, "read_only": True},
            {"key": "SECRET_KEY", "category": "security", "value": "********", "description": "JWT Secret", "is_secret": True, "read_only": True},
        ])
        
        grouped["ai"].extend([
            {"key": "GEMINI_API_KEY", "category": "ai", "value": "********" if app_settings.GEMINI_API_KEY else "Not Configured", "description": "Gemini API Key", "is_secret": True, "read_only": True},
            {"key": "GEMINI_MODEL", "category": "ai", "value": app_settings.GEMINI_MODEL, "description": "Gemini Model", "is_secret": False, "read_only": True},
        ])

        return grouped

    async def update_settings(self, batch: SystemSettingUpdateBatch, admin_id: UUID) -> None:
        updates = [{"key": s.key, "value": s.value} for s in batch.settings]
        await self.repo.upsert_settings(updates, admin_id)

    async def get_system_info(self) -> SystemInfoOut:
        # Check DB status
        db_status = "Healthy"
        try:
            from sqlalchemy import text
            await self.repo.session.execute(text("SELECT 1"))
        except Exception:
            db_status = "Unhealthy"

        # Check Redis status
        redis_status = "Unknown"
        try:
            import redis.asyncio as redis
            r = redis.from_url(app_settings.REDIS_URL)
            if await r.ping():
                redis_status = "Healthy"
            await r.aclose()
        except Exception:
            redis_status = "Unhealthy"

        return SystemInfoOut(
            environment=app_settings.ENVIRONMENT,
            python_version=sys.version.split(' ')[0],
            fastapi_version=fastapi.__version__,
            database_version="PostgreSQL 16", # Hardcoded or queried if needed
            database_status=db_status,
            redis_version="Redis 7",
            redis_status=redis_status,
            nextjs_version="15.1.0",
            app_version=app_settings.APP_VERSION
        )
