from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_async_session
from app.services.user import UserService
from app.schemas.user import UserOut, UserUpdate, UserPreferencesOut, UserPreferencesUpdate
from app.schemas.common import APIResponse
from app.middleware.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=APIResponse[UserOut], summary="Get my profile")
async def get_my_profile(current_user: User = Depends(get_current_user)):
    return APIResponse(success=True, message="Profile retrieved", data=UserOut.model_validate(current_user))


@router.patch("/me", response_model=APIResponse[UserOut], summary="Update my profile")
async def update_my_profile(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
):
    service = UserService(session)
    updated_user = await service.update_user(current_user.id, data)
    return APIResponse(success=True, message="Profile updated", data=UserOut.model_validate(updated_user))


@router.get("/me/preferences", response_model=APIResponse[UserPreferencesOut], summary="Get my preferences")
async def get_my_preferences(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
):
    from app.repositories.user import UserRepository
    repo = UserRepository(session)
    prefs = await repo.get_preferences(current_user.id)
    return APIResponse(success=True, message="Preferences retrieved", data=UserPreferencesOut.model_validate(prefs) if prefs else None)


@router.patch("/me/preferences", response_model=APIResponse[UserPreferencesOut], summary="Update my preferences")
async def update_my_preferences(
    data: UserPreferencesUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
):
    service = UserService(session)
    prefs = await service.update_preferences(current_user.id, data)
    return APIResponse(success=True, message="Preferences updated", data=UserPreferencesOut.model_validate(prefs))
