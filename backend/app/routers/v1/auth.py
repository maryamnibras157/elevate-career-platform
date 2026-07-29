from fastapi import APIRouter, Depends, Request, status
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_async_session
from app.services.auth import AuthService
from app.schemas.auth import (
    RegisterRequest, LoginRequest, TokenResponse,
    RefreshTokenRequest, ForgotPasswordRequest, ResetPasswordRequest,
    GoogleAuthRequest
)
from app.schemas.common import APIResponse
from app.middleware.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED, summary="Register new user")
async def register(
    data: RegisterRequest,
    request: Request,
    session: AsyncSession = Depends(get_async_session),
):
    service = AuthService(session)
    return await service.register(data, ip_address=get_client_ip(request))


@router.post("/login", response_model=TokenResponse, summary="Login")
async def login(
    data: LoginRequest,
    request: Request,
    session: AsyncSession = Depends(get_async_session),
):
    service = AuthService(session)
    return await service.login(
        data,
        ip_address=get_client_ip(request),
        user_agent=request.headers.get("User-Agent"),
    )


@router.post("/refresh", response_model=TokenResponse, summary="Refresh access token")
async def refresh_token(
    data: RefreshTokenRequest,
    session: AsyncSession = Depends(get_async_session),
):
    service = AuthService(session)
    return await service.refresh_tokens(data.refresh_token)


@router.post("/logout", status_code=status.HTTP_200_OK, summary="Logout")
async def logout(
    data: RefreshTokenRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
):
    service = AuthService(session)
    await service.logout(data.refresh_token, current_user.id)
    return APIResponse(success=True, message="Logged out successfully")


@router.post("/forgot-password", status_code=status.HTTP_200_OK, summary="Request password reset")
async def forgot_password(
    data: ForgotPasswordRequest,
    session: AsyncSession = Depends(get_async_session),
):
    service = AuthService(session)
    await service.forgot_password(data.email)
    return APIResponse(success=True, message="If an account with that email exists, a reset link has been sent.")


@router.post("/reset-password", status_code=status.HTTP_200_OK, summary="Reset password using token")
async def reset_password(
    data: ResetPasswordRequest,
    session: AsyncSession = Depends(get_async_session),
):
    service = AuthService(session)
    await service.reset_password(data.token, data.new_password)
    return APIResponse(success=True, message="Password has been reset successfully.")


@router.post("/google", response_model=TokenResponse, summary="Google OAuth login/register")
async def google_auth(
    data: GoogleAuthRequest,
    request: Request,
    session: AsyncSession = Depends(get_async_session),
):
    service = AuthService(session)
    return await service.google_auth(
        data.code,
        ip_address=get_client_ip(request),
        user_agent=request.headers.get("User-Agent"),
    )


@router.get("/me", summary="Get current user")
async def get_me(current_user: User = Depends(get_current_user)):
    from app.schemas.user import UserOut
    return APIResponse(success=True, message="User retrieved", data=UserOut.model_validate(current_user))
