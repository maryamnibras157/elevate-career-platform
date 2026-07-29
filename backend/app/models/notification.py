import uuid
import enum
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, Enum, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base

class NotificationType(str, enum.Enum):
    INFORMATION = "Information"
    WARNING = "Warning"
    SUCCESS = "Success"
    ERROR = "Error"
    MAINTENANCE = "Maintenance"
    SYSTEM_UPDATE = "System Update"
    FEATURE_RELEASE = "Feature Release"

class NotificationPriority(str, enum.Enum):
    LOW = "Low"
    NORMAL = "Normal"
    HIGH = "High"
    CRITICAL = "Critical"

class NotificationStatus(str, enum.Enum):
    DRAFT = "Draft"
    SCHEDULED = "Scheduled"
    PUBLISHED = "Published"
    ARCHIVED = "Archived"
    EXPIRED = "Expired"

class NotificationAudience(str, enum.Enum):
    ALL_USERS = "All Users"
    VERIFIED_USERS = "Verified Users"
    ADMINS = "Admins"
    STUDENTS = "Students"
    PROFESSIONALS = "Professionals"

class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    type: Mapped[NotificationType] = mapped_column(Enum(NotificationType, name="notification_type"), nullable=False, default=NotificationType.INFORMATION)
    priority: Mapped[NotificationPriority] = mapped_column(Enum(NotificationPriority, name="notification_priority"), nullable=False, default=NotificationPriority.NORMAL)
    status: Mapped[NotificationStatus] = mapped_column(Enum(NotificationStatus, name="notification_status"), nullable=False, default=NotificationStatus.DRAFT, index=True)
    target_audience: Mapped[NotificationAudience] = mapped_column(Enum(NotificationAudience, name="notification_audience"), nullable=False, default=NotificationAudience.ALL_USERS)
    
    created_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    scheduled_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True, index=True)
    published_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    creator: Mapped["User"] = relationship("User", foreign_keys=[created_by])
    recipients: Mapped[list["NotificationRecipient"]] = relationship("NotificationRecipient", back_populates="notification", cascade="all, delete-orphan")

class NotificationRecipient(Base):
    __tablename__ = "notification_recipients"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    notification_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("notifications.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    read_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    notification: Mapped["Notification"] = relationship("Notification", back_populates="recipients")
    user: Mapped["User"] = relationship("User", foreign_keys=[user_id])
