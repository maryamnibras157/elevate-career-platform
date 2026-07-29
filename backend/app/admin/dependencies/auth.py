from typing import Callable, Any, List
from fastapi import Depends
from app.models.user import User, UserRole
from app.middleware.auth import get_current_user
from app.admin.constants.enums import AdminRole, Permission
from app.admin.exceptions.admin_exceptions import PermissionDeniedException, InvalidAdminOperationException
from app.admin.schemas.auth import AdminContext
from app.admin.utils.auth import has_required_role, has_required_permissions
from app.admin.core.audit import log_admin_event
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_async_session
from app.admin.repositories.admin import AdminProfileRepository

async def get_current_admin(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
) -> AdminContext:
    """
    Validates JWT authentication, verifies administrator privileges, and returns the AdminContext.
    Reuses existing get_current_user for JWT and active status checks, then queries the database for admin details.
    """
    if current_user.role != UserRole.ADMIN:
        await log_admin_event("unauthorized_access", str(current_user.id), "FAILED", {"reason": "Not an admin"})
        raise PermissionDeniedException(detail="Administrator privileges required")

    repo = AdminProfileRepository(session)
    admin_profile = await repo.get_by_user_id(current_user.id)

    if not admin_profile or not admin_profile.is_active:
        await log_admin_event("unauthorized_access", str(current_user.id), "FAILED", {"reason": "Admin profile inactive or not found"})
        raise PermissionDeniedException(detail="Administrator account is disabled or not fully configured")

    permissions = []
    for perm in admin_profile.permissions:
        try:
            permissions.append(Permission(perm.name))
        except ValueError:
            pass # ignore invalid enum names stored in db just in case
    
    admin_context = AdminContext(
        user=current_user,
        role=admin_profile.role,
        permissions=permissions
    )
    
    await log_admin_event("admin_login", str(current_user.id), "SUCCESS", {"role": admin_profile.role.value})
    return admin_context

def require_admin_role(roles: List[AdminRole]) -> Callable:
    """
    Dependency generator to enforce role checks.
    """
    async def role_checker(admin_context: AdminContext = Depends(get_current_admin)) -> AdminContext:
        if not has_required_role(admin_context.role, roles):
            await log_admin_event("role_validation_failed", admin_context.admin_id, "FAILED", {"required": [r.value for r in roles], "actual": admin_context.role.value})
            raise PermissionDeniedException(detail="Insufficient role privileges")
        return admin_context
    return role_checker

def require_permission(permissions: List[Permission]) -> Callable:
    """
    Dependency generator to enforce permission checks.
    """
    async def permission_checker(admin_context: AdminContext = Depends(get_current_admin)) -> AdminContext:
        if not has_required_permissions(admin_context.permissions, permissions):
            await log_admin_event("permission_validation_failed", admin_context.admin_id, "FAILED", {"required": [p.value for p in permissions]})
            raise PermissionDeniedException(detail="Insufficient permissions")
        return admin_context
    return permission_checker
