import uuid
import hashlib
from datetime import datetime
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.models.auth import RefreshToken, Session
from app.models.audit import AuditLog


class AuthRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_refresh_token(self, user_id: uuid.UUID, token: str, expires_at: datetime) -> RefreshToken:
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        refresh_token = RefreshToken(
            user_id=user_id,
            token_hash=token_hash,
            expires_at=expires_at,
        )
        self.session.add(refresh_token)
        await self.session.flush()
        return refresh_token

    async def get_refresh_token(self, token: str) -> Optional[RefreshToken]:
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        result = await self.session.execute(
            select(RefreshToken).where(
                RefreshToken.token_hash == token_hash,
                RefreshToken.revoked == False,
                RefreshToken.expires_at > datetime.utcnow(),
            )
        )
        return result.scalar_one_or_none()

    async def revoke_refresh_token(self, token: str) -> None:
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        await self.session.execute(
            update(RefreshToken)
            .where(RefreshToken.token_hash == token_hash)
            .values(revoked=True)
        )

    async def revoke_all_user_tokens(self, user_id: uuid.UUID) -> None:
        await self.session.execute(
            update(RefreshToken)
            .where(RefreshToken.user_id == user_id, RefreshToken.revoked == False)
            .values(revoked=True)
        )

    async def create_session(self, user_id: uuid.UUID, ip_address: Optional[str], user_agent: Optional[str], expires_at: datetime) -> Session:
        session_obj = Session(
            user_id=user_id,
            ip_address=ip_address,
            user_agent=user_agent,
            expires_at=expires_at,
        )
        self.session.add(session_obj)
        await self.session.flush()
        return session_obj

    async def create_audit_log(self, user_id: Optional[uuid.UUID], action: str, resource: Optional[str] = None, resource_id: Optional[str] = None, metadata: Optional[dict] = None, ip_address: Optional[str] = None) -> AuditLog:
        log = AuditLog(
            user_id=user_id,
            action=action,
            resource=resource,
            resource_id=resource_id,
            metadata_=metadata,
            ip_address=ip_address,
        )
        self.session.add(log)
        await self.session.flush()
        return log
