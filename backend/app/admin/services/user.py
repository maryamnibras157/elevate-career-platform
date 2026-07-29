from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.admin.repositories.user import AdminUserRepository
from app.admin.schemas.users.users import AdminUserFilterParams, AdminUserOut, AdminUserActivityOut
from app.admin.exceptions.admin_exceptions import AdminValidationException
from app.admin.utils.pagination import PaginatedResponse
from app.admin.core.audit import log_admin_event

class AdminUserService:
    def __init__(self, session: AsyncSession):
        self.repo = AdminUserRepository(session)

    async def get_users(self, page: int, size: int, filters: AdminUserFilterParams) -> PaginatedResponse[AdminUserOut]:
        paginated_users = await self.repo.get_all_paginated(page, size, filters)
        items = [AdminUserOut.model_validate(user) for user in paginated_users.items]
        return PaginatedResponse(
            items=items,
            total=paginated_users.total,
            page=paginated_users.page,
            size=paginated_users.size,
            pages=paginated_users.pages
        )

    async def get_user_by_id(self, user_id: UUID) -> AdminUserOut:
        user = await self.repo.get_by_id(user_id)
        if not user:
            raise AdminValidationException("User not found", status_code=404)
        return AdminUserOut.model_validate(user)

    async def get_user_activity(self, user_id: UUID) -> AdminUserActivityOut:
        activity = await self.repo.get_activity(user_id)
        return AdminUserActivityOut(**activity)

    async def _enforce_role_hierarchy(self, target_role: str, admin_id: str):
        admin = await self.repo.get_by_id(UUID(admin_id))
        if not admin:
            raise AdminValidationException("Acting admin not found", status_code=404)
        
        # SUPER_ADMIN can modify anyone. ADMIN cannot modify SUPER_ADMIN or ADMIN.
        if admin.role == "ADMIN":
            if target_role in ["SUPER_ADMIN", "ADMIN"]:
                raise AdminValidationException("You lack sufficient privileges to modify this user's account", status_code=403)

    async def update_status(self, user_id: UUID, is_active: bool, admin_id: str) -> AdminUserOut:
        user = await self.repo.get_by_id(user_id)
        if not user:
            raise AdminValidationException("User not found", status_code=404)
            
        if str(user_id) == admin_id and not is_active:
            raise AdminValidationException("You cannot deactivate your own account", status_code=403)
            
        await self._enforce_role_hierarchy(user.role, admin_id)
        
        # Protect the last super admin from deactivation
        if not is_active and user.role == "SUPER_ADMIN":
            filters = AdminUserFilterParams(role="SUPER_ADMIN", is_active=True)
            active_supers = await self.repo.get_all_paginated(1, 10, filters)
            if active_supers.total <= 1:
                raise AdminValidationException("Cannot deactivate the last active super admin", status_code=403)
        
        user = await self.repo.update_status(user, is_active)
        action = "user_activation" if is_active else "user_deactivation"
        await log_admin_event(action, admin_id, "SUCCESS", {"target_user_id": str(user_id)})
        return AdminUserOut.model_validate(user)

    async def delete_user(self, user_id: UUID, admin_id: str) -> None:
        user = await self.repo.get_by_id(user_id)
        if not user:
            raise AdminValidationException("User not found", status_code=404)
            
        if str(user_id) == admin_id:
            raise AdminValidationException("You cannot delete your own account", status_code=403)
            
        await self._enforce_role_hierarchy(user.role, admin_id)
        
        # Protect the last super admin from deletion
        if user.role == "SUPER_ADMIN":
            filters = AdminUserFilterParams(role="SUPER_ADMIN")
            all_supers = await self.repo.get_all_paginated(1, 10, filters)
            if all_supers.total <= 1:
                raise AdminValidationException("Cannot delete the last super admin", status_code=403)
        
        await self.repo.delete(user)
        await log_admin_event("user_deletion", admin_id, "SUCCESS", {"target_user_id": str(user_id)})
