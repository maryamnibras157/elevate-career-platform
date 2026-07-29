import uuid
import asyncio
from datetime import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import BackgroundTasks
from app.admin.repositories.notification import AdminNotificationRepository
from app.admin.schemas.notification.notification import NotificationCreate, NotificationUpdate, NotificationFilterParams
from app.models.notification import Notification, NotificationStatus, NotificationRecipient
from app.admin.core.audit import log_admin_event
from app.database import async_session_maker
from app.config import settings
from loguru import logger

# Since fastapi-mail is installed
try:
    from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
    email_conf = ConnectionConfig(
        MAIL_USERNAME=settings.MAIL_USERNAME or "dummy",
        MAIL_PASSWORD=settings.MAIL_PASSWORD or "dummy",
        MAIL_FROM=settings.MAIL_FROM or "dummy@elevate.com",
        MAIL_PORT=settings.MAIL_PORT,
        MAIL_SERVER=settings.MAIL_SERVER,
        MAIL_FROM_NAME=settings.MAIL_FROM_NAME,
        MAIL_STARTTLS=True,
        MAIL_SSL_TLS=False,
        USE_CREDENTIALS=bool(settings.MAIL_USERNAME)
    )
    mailer = FastMail(email_conf)
except Exception:
    mailer = None

async def _send_emails_bg(emails: List[str], subject: str, body: str):
    if not mailer or not settings.MAIL_USERNAME:
        return # Dummy config, do not send
        
    try:
        # FastMail expects valid emails. 
        if not emails:
            return
        
        # We can send to bcc to protect privacy
        message = MessageSchema(
            subject=subject,
            recipients=[],
            bcc=emails,
            body=body,
            subtype=MessageType.plain
        )
        await mailer.send_message(message)
    except Exception as e:
        logger.error(f"Failed to send background emails: {e}")

async def _publish_notification_bg(notification_id: uuid.UUID):
    async with async_session_maker() as session:
        repo = AdminNotificationRepository(session)
        
        # Lock the row to prevent duplicate execution by multiple workers
        from sqlalchemy import select
        stmt = select(Notification).where(Notification.id == notification_id).with_for_update(skip_locked=True)
        result = await session.execute(stmt)
        notif = result.scalars().first()
        
        if not notif or notif.status == NotificationStatus.PUBLISHED:
            return
            
        logger.info(f"Publishing notification: {notif.id}")
        notif.status = NotificationStatus.PUBLISHED
        notif.published_at = datetime.utcnow()
        
        # Get users
        users = await repo.get_audience_users(notif.target_audience)
        
        # Create recipients
        recipients = [NotificationRecipient(notification_id=notif.id, user_id=u.id) for u in users]
        session.add_all(recipients)
        
        await session.commit()
        
        # Send emails
        emails = [u.email for u in users if u.email]
        if emails:
            await _send_emails_bg(emails, notif.title, notif.message)


class AdminNotificationService:
    def __init__(self, session: AsyncSession, bg_tasks: BackgroundTasks):
        self.session = session
        self.repo = AdminNotificationRepository(session)
        self.bg_tasks = bg_tasks

    async def get_notifications(self, params: NotificationFilterParams) -> Dict[str, Any]:
        items, total = await self.repo.get_notifications(params)
        return {
            "items": items,
            "total": total,
            "page": params.page,
            "page_size": params.page_size,
            "pages": (total + params.page_size - 1) // params.page_size
        }

    async def get_notification(self, notif_id: uuid.UUID) -> Optional[Dict[str, Any]]:
        return await self.repo.get_notification_by_id(notif_id)

    async def create_notification(self, payload: NotificationCreate, admin_id: uuid.UUID) -> Dict[str, Any]:
        n = Notification(
            title=payload.title,
            message=payload.message,
            type=payload.type,
            priority=payload.priority,
            target_audience=payload.target_audience,
            status=NotificationStatus.DRAFT,
            created_by=admin_id,
            scheduled_at=payload.scheduled_at,
            expires_at=payload.expires_at
        )
        self.session.add(n)
        await self.session.commit()
        await log_admin_event("notification_created", str(admin_id), "SUCCESS", {"notification_id": str(n.id)})
        return await self.get_notification(n.id)

    async def update_notification(self, notif_id: uuid.UUID, payload: NotificationUpdate, admin_id: uuid.UUID) -> Optional[Dict[str, Any]]:
        n = await self.session.get(Notification, notif_id)
        if not n:
            return None
            
        if n.status in [NotificationStatus.PUBLISHED, NotificationStatus.ARCHIVED, NotificationStatus.EXPIRED]:
            raise ValueError("Cannot edit a published or archived notification")

        update_data = payload.model_dump(exclude_unset=True)
        for k, v in update_data.items():
            setattr(n, k, v)
            
        await self.session.commit()
        await log_admin_event("notification_updated", str(admin_id), "SUCCESS", {"notification_id": str(n.id)})
        return await self.get_notification(n.id)

    async def delete_notification(self, notif_id: uuid.UUID, admin_id: uuid.UUID) -> bool:
        n = await self.session.get(Notification, notif_id)
        if not n:
            return False
            
        await self.session.delete(n)
        await self.session.commit()
        await log_admin_event("notification_deleted", str(admin_id), "SUCCESS", {"notification_id": str(notif_id)})
        return True

    async def publish_notification(self, notif_id: uuid.UUID, admin_id: uuid.UUID) -> Optional[Dict[str, Any]]:
        n = await self.session.get(Notification, notif_id)
        if not n or n.status == NotificationStatus.PUBLISHED:
            return None
            
        # We spawn a background task to actually do the publishing
        self.bg_tasks.add_task(_publish_notification_bg, n.id)
        
        # Optimistically update status
        n.status = NotificationStatus.PUBLISHED
        await self.session.commit()
        await log_admin_event("notification_published", str(admin_id), "SUCCESS", {"notification_id": str(n.id)})
        return await self.get_notification(n.id)
        
    async def schedule_notification(self, notif_id: uuid.UUID, scheduled_at: datetime, admin_id: uuid.UUID) -> Optional[Dict[str, Any]]:
        n = await self.session.get(Notification, notif_id)
        if not n or n.status == NotificationStatus.PUBLISHED:
            return None
            
        n.status = NotificationStatus.SCHEDULED
        n.scheduled_at = scheduled_at
        await self.session.commit()
        
        await log_admin_event("notification_scheduled", str(admin_id), "SUCCESS", {"notification_id": str(n.id), "scheduled_at": str(scheduled_at)})
        return await self.get_notification(n.id)
        
    async def archive_notification(self, notif_id: uuid.UUID, admin_id: uuid.UUID) -> Optional[Dict[str, Any]]:
        n = await self.session.get(Notification, notif_id)
        if not n:
            return None
            
        n.status = NotificationStatus.ARCHIVED
        await self.session.commit()
        await log_admin_event("notification_archived", str(admin_id), "SUCCESS", {"notification_id": str(n.id)})
        return await self.get_notification(n.id)

    async def get_statistics(self) -> Dict[str, Any]:
        return await self.repo.get_statistics()
