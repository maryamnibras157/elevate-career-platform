import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, Enum as SAEnum, ForeignKey, Table, Column, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
from app.admin.constants.enums import AdminRole

admin_profile_permissions = Table(
    "admin_profile_permissions",
    Base.metadata,
    Column("admin_id", UUID(as_uuid=True), ForeignKey("admin_profiles.user_id", ondelete="CASCADE"), primary_key=True),
    Column("permission_id", Integer, ForeignKey("admin_permissions.id", ondelete="CASCADE"), primary_key=True),
)

class AdminPermission(Base):
    __tablename__ = "admin_permissions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    profiles: Mapped[list["AdminProfile"]] = relationship(
        "AdminProfile", secondary=admin_profile_permissions, back_populates="permissions"
    )

    def __repr__(self) -> str:
        return f"<AdminPermission {self.name}>"

class AdminProfile(Base):
    __tablename__ = "admin_profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    role: Mapped[AdminRole] = mapped_column(
        SAEnum(
            AdminRole,
            values_callable=lambda enum_cls: [e.value for e in enum_cls],
        ),
        default=AdminRole.VIEWER,
        nullable=False,
        index=True
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)
    created_by_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    updated_by_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False, index=True
    )

    # Relationships
    user: Mapped["User"] = relationship("User", foreign_keys=[user_id], back_populates="admin_profile")
    permissions: Mapped[list["AdminPermission"]] = relationship(
        "AdminPermission", secondary=admin_profile_permissions, back_populates="profiles"
    )
    
    created_by: Mapped["User"] = relationship("User", foreign_keys=[created_by_id])
    updated_by: Mapped["User"] = relationship("User", foreign_keys=[updated_by_id])

    def __repr__(self) -> str:
        return f"<AdminProfile user_id={self.user_id} role={self.role}>"
