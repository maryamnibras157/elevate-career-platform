from typing import Tuple, List
from app.models.user import User, UserRole
from app.admin.constants.enums import AdminRole, Permission

def resolve_admin_privileges(user: User) -> Tuple[AdminRole, List[Permission]]:
    """
    Temporarily maps `UserRole.ADMIN` to `AdminRole.SUPER_ADMIN` and all permissions.
    This acts as a bridge before database models for admin profiles are created.
    """
    if user.role != UserRole.ADMIN:
        # Default fallback, should theoretically not be reached if validated prior
        return AdminRole.VIEWER, []
        
    all_permissions = list(Permission)
    return AdminRole.SUPER_ADMIN, all_permissions

def has_required_role(current_role: AdminRole, required_roles: List[AdminRole]) -> bool:
    """
    Checks if the current role is within the required roles.
    SUPER_ADMIN always passes the check.
    """
    if current_role == AdminRole.SUPER_ADMIN:
        return True
    return current_role in required_roles

def has_required_permissions(current_permissions: List[Permission], required_permissions: List[Permission]) -> bool:
    """
    Checks if all required permissions are present in the current permissions.
    """
    return all(perm in current_permissions for perm in required_permissions)

def has_any_permission(current_permissions: List[Permission], allowed_permissions: List[Permission]) -> bool:
    """
    Checks if at least one of the allowed permissions is present.
    """
    return any(perm in current_permissions for perm in allowed_permissions)
