from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.dialects.postgresql import insert
from app.models.setting import SystemSetting
from uuid import UUID

class AdminSettingsRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_all(self) -> List[SystemSetting]:
        stmt = select(SystemSetting).order_by(SystemSetting.category, SystemSetting.key)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_by_category(self, category: str) -> List[SystemSetting]:
        stmt = select(SystemSetting).where(SystemSetting.category == category).order_by(SystemSetting.key)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def upsert_settings(self, settings: List[Dict[str, Any]], admin_id: UUID) -> None:
        """
        Upsert a list of settings. 
        Expects a list of dictionaries with 'key' and 'value'.
        """
        for setting in settings:
            # We use an insert statement with on_conflict_do_update for PostgreSQL
            # But wait, we must make sure the row exists first if we don't want to create arbitrary keys?
            # Or we can allow creating if it doesn't exist, but typically settings are seeded.
            # Let's use simple select and update if exists, or insert if not.
            key = setting.get("key")
            value = setting.get("value")
            
            stmt = select(SystemSetting).where(SystemSetting.key == key)
            result = await self.session.execute(stmt)
            existing = result.scalars().first()
            
            if existing:
                existing.value = {"value": value} # Store in JSON wrapper
                existing.updated_by = admin_id
            else:
                # If a setting doesn't exist, we skip or create? 
                # Better to skip and log, or we require settings to be seeded.
                pass
        
        await self.session.commit()

    async def seed_default_settings(self) -> None:
        # Seed default feature flags and settings if they don't exist
        defaults = [
            # General
            {"key": "platform_name", "category": "general", "value": "ELEVATE", "description": "Name of the platform"},
            {"key": "platform_description", "category": "general", "value": "AI-powered career guidance platform.", "description": "Platform description"},
            {"key": "contact_email", "category": "general", "value": "support@elevate.com", "description": "Public contact email"},
            {"key": "support_email", "category": "general", "value": "support@elevate.com", "description": "Support email"},
            {"key": "time_zone", "category": "general", "value": "UTC", "description": "Default timezone"},
            {"key": "default_language", "category": "general", "value": "en-US", "description": "Default language"},
            {"key": "default_theme", "category": "general", "value": "system", "description": "Default UI theme"},
            
            # Platform (Feature Flags)
            {"key": "maintenance_mode", "category": "platform", "value": False, "description": "Enable maintenance mode (disables public access)"},
            {"key": "user_registration_enabled", "category": "platform", "value": True, "description": "Allow new users to register"},
            {"key": "resume_analysis_enabled", "category": "platform", "value": True, "description": "Enable AI resume analysis"},
            {"key": "career_recommendation_enabled", "category": "platform", "value": True, "description": "Enable career recommendations"},
            {"key": "ai_mentor_enabled", "category": "platform", "value": True, "description": "Enable AI Mentor chat"},
            {"key": "mock_interview_enabled", "category": "platform", "value": True, "description": "Enable mock interviews"},
            {"key": "roadmaps_enabled", "category": "platform", "value": True, "description": "Enable roadmap generation"},
            
            # AI
            {"key": "default_ai_provider", "category": "ai", "value": "gemini", "description": "Default AI provider for generating content"},
            {"key": "recommendation_confidence_threshold", "category": "ai", "value": 0.7, "description": "Minimum confidence required for recommendations"},
            {"key": "resume_score_threshold", "category": "ai", "value": 60, "description": "Minimum acceptable resume score before warnings"},
            {"key": "ats_threshold", "category": "ai", "value": 75, "description": "Target ATS score"},
        ]
        
        for item in defaults:
            stmt = select(SystemSetting).where(SystemSetting.key == item["key"])
            result = await self.session.execute(stmt)
            existing = result.scalars().first()
            if not existing:
                new_setting = SystemSetting(
                    key=item["key"],
                    category=item["category"],
                    value={"value": item["value"]},
                    description=item["description"],
                    is_secret=False
                )
                self.session.add(new_setting)
                
        await self.session.commit()
