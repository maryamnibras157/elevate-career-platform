from fastapi import APIRouter, Depends
from app.admin.schemas.auth import AdminContext
from app.admin.utils.response import success_response
from app.admin.dependencies.auth import get_current_admin
from app.admin.routers.dashboard import router as dashboard_router
from app.admin.routers.users import router as users_router
from app.admin.routers.careers import router as careers_router
from app.admin.routers.resume_stats import router as resume_stats_router
from app.admin.routers.analytics import router as analytics_router
from app.admin.routers.settings import router as settings_router
from app.admin.routers.audit import router as audit_router
from app.admin.routers.notification import router as notification_router
from app.admin.routers.report import router as report_router
from app.admin.routers.profile import router as profile_router

# Root router for the admin module.
# Future sprint prompts will register business endpoints here.
router = APIRouter(tags=["Admin"], dependencies=[Depends(get_current_admin)])

router.include_router(dashboard_router)
router.include_router(users_router)
router.include_router(careers_router)
router.include_router(resume_stats_router)
router.include_router(analytics_router)
router.include_router(settings_router)
router.include_router(audit_router)
router.include_router(notification_router)
router.include_router(report_router)
router.include_router(profile_router)

@router.get("/me", response_model=dict, summary="Get current admin context")
async def get_current_admin_context(admin: AdminContext = Depends(get_current_admin)):
    """
    Returns the currently authenticated admin's role and resolved permissions.
    Used by the frontend to build role-aware UIs.
    """
    data = {
        "user_id": str(admin.user.id),
        "email": admin.user.email,
        "full_name": admin.user.full_name,
        "role": admin.role.value,
        "permissions": [p.value for p in admin.permissions]
    }
    return success_response(data=data, message="Admin context retrieved successfully")
