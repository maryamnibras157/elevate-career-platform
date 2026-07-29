import os
from .base import AIProvider
from .local_provider import LocalProvider
from .gemini_provider import GeminiProvider
from app.config import settings
from loguru import logger

def get_ai_provider() -> AIProvider:
    provider_name = os.getenv("AI_PROVIDER", "local").lower()
    api_key = os.getenv("GEMINI_API_KEY", "")
    model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-pro")

    if provider_name == "gemini" and api_key:
        logger.info(f"Using Gemini AI Provider (Model: {model_name})")
        return GeminiProvider(api_key=api_key, model_name=model_name)
    else:
        logger.info("Using Local Fallback AI Provider")
        return LocalProvider()
