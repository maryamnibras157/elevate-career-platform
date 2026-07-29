from app.config import settings

# Pagination
DEFAULT_PAGE_SIZE = getattr(settings, "ADMIN_DEFAULT_PAGE_SIZE", 20)
MAX_PAGE_SIZE = getattr(settings, "ADMIN_MAX_PAGE_SIZE", 100)

# Caching
DASHBOARD_CACHE_TTL = getattr(settings, "ADMIN_DASHBOARD_CACHE_TTL", 300)
ANALYTICS_CACHE_TTL = getattr(settings, "ADMIN_ANALYTICS_CACHE_TTL", 3600)
REFRESH_INTERVAL = getattr(settings, "ADMIN_REFRESH_INTERVAL", 60)

# Export
EXPORT_LIMIT = getattr(settings, "ADMIN_EXPORT_LIMIT", 10000)

# Analytics Defaults
DEFAULT_ANALYTICS_DAYS = 30
