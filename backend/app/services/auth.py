import uuid
import secrets
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from app.config import settings
from app.models.user import User, UserRole
from app.repositories.user import UserRepository
from app.repositories.auth import AuthRepository
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse
from fastapi import HTTPException, status
from loguru import logger

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.user_repo = UserRepository(session)
        self.auth_repo = AuthRepository(session)

    def hash_password(self, password: str) -> str:
        return pwd_context.hash(password)

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

    def create_access_token(self, user_id: uuid.UUID, role: str) -> str:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        payload = {
            "sub": str(user_id),
            "role": role,
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "access",
        }
        return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    def create_refresh_token_value(self) -> str:
        return secrets.token_urlsafe(64)

    async def register(self, data: RegisterRequest, ip_address: Optional[str] = None) -> TokenResponse:
        existing_user = await self.user_repo.get_by_email(data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists"
            )

        user = User(
            email=data.email.lower(),
            hashed_password=self.hash_password(data.password),
            full_name=data.full_name,
            role=UserRole.STUDENT,
            is_verified=False,
        )
        user = await self.user_repo.create(user)
        await self.user_repo.create_preferences(user.id)

        await self.auth_repo.create_audit_log(
            user_id=user.id,
            action="user.register",
            resource="users",
            resource_id=str(user.id),
            ip_address=ip_address,
        )

        return await self._generate_tokens(user, ip_address)

    async def login(self, data: LoginRequest, ip_address: Optional[str] = None, user_agent: Optional[str] = None) -> TokenResponse:
        user = await self.user_repo.get_by_email(data.email)
        if not user or not user.hashed_password:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        if not self.verify_password(data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is disabled. Please contact support."
            )

        await self.user_repo.update(user.id, {"last_login_at": datetime.utcnow()})
        await self.auth_repo.create_audit_log(
            user_id=user.id,
            action="user.login",
            resource="users",
            resource_id=str(user.id),
            ip_address=ip_address,
        )

        return await self._generate_tokens(user, ip_address, user_agent)

    async def refresh_tokens(self, refresh_token: str) -> TokenResponse:
        db_token = await self.auth_repo.get_refresh_token(refresh_token)
        if not db_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token"
            )

        user = await self.user_repo.get_by_id(db_token.user_id)
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive"
            )

        await self.auth_repo.revoke_refresh_token(refresh_token)
        return await self._generate_tokens(user)

    async def logout(self, refresh_token: str, user_id: uuid.UUID) -> None:
        await self.auth_repo.revoke_refresh_token(refresh_token)
        await self.auth_repo.create_audit_log(
            user_id=user_id,
            action="user.logout",
            resource="users",
            resource_id=str(user_id),
        )

    async def _generate_tokens(self, user: User, ip_address: Optional[str] = None, user_agent: Optional[str] = None) -> TokenResponse:
        access_token = self.create_access_token(user.id, user.role.value)
        refresh_token_value = self.create_refresh_token_value()

        expires_at = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        await self.auth_repo.create_refresh_token(user.id, refresh_token_value, expires_at)

        if ip_address or user_agent:
            await self.auth_repo.create_session(
                user_id=user.id,
                ip_address=ip_address,
                user_agent=user_agent,
                expires_at=expires_at,
            )

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token_value,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

    def decode_token(self, token: str) -> dict:
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            return payload
        except JWTError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"},
            )

    async def forgot_password(self, email: str) -> None:
        user = await self.user_repo.get_by_email(email)
        if not user or not user.is_active:
            return  # Fail silently to avoid email enumeration

        expire = datetime.utcnow() + timedelta(hours=1)
        payload = {
            "sub": str(user.id),
            "type": "reset",
            "exp": expire,
        }
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        
        # In a real app, send an email here.
        # For this prototype, we'll log it (or pretend we sent it).
        logger.info(f"Password reset token for {email}: {token}")

    async def reset_password(self, token: str, new_password: str) -> None:
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            if payload.get("type") != "reset":
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token type")
            user_id_str = payload.get("sub")
            if not user_id_str:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token payload")
            user_id = uuid.UUID(user_id_str)
        except JWTError:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token")

        user = await self.user_repo.get_by_id(user_id)
        if not user or not user.is_active:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User not found or inactive")

        new_hashed_password = self.hash_password(new_password)
        await self.user_repo.update(user.id, {"hashed_password": new_hashed_password})
        
        await self.auth_repo.create_audit_log(
            user_id=user.id,
            action="user.reset_password",
            resource="users",
            resource_id=str(user.id),
        )

    async def google_auth(self, code: str, ip_address: Optional[str] = None, user_agent: Optional[str] = None) -> TokenResponse:
        # Mock Google Auth implementation
        # In production, this would exchange the 'code' for an access token,
        # then fetch user info from Google APIs.
        if not code:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Code is required")
            
        # We simulate fetching a user. 
        email = f"google_user_{code[:6]}@example.com"
        full_name = f"Google User {code[:4]}"
        
        user = await self.user_repo.get_by_email(email)
        if not user:
            # Create new user
            new_user = User(
                email=email,
                full_name=full_name,
                role=UserRole.STUDENT,
                is_verified=True,
                is_oauth=True,
                oauth_provider="google",
                oauth_id=f"google_{code[:10]}",
            )
            user = await self.user_repo.create(new_user)
            await self.user_repo.create_preferences(user.id)
            
            await self.auth_repo.create_audit_log(
                user_id=user.id,
                action="user.register.google",
                resource="users",
                resource_id=str(user.id),
                ip_address=ip_address,
            )
        
        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled")

        await self.user_repo.update(user.id, {"last_login_at": datetime.utcnow()})
        await self.auth_repo.create_audit_log(
            user_id=user.id,
            action="user.login.google",
            resource="users",
            resource_id=str(user.id),
            ip_address=ip_address,
        )

        return await self._generate_tokens(user, ip_address, user_agent)
