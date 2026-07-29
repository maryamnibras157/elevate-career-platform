import uuid
import enum
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, Enum, Boolean, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base

class ReportCategory(str, enum.Enum):
    USERS = "Users"
    CAREERS = "Careers"
    RESUMES = "Resumes"
    AUDIT_LOGS = "Audit Logs"
    NOTIFICATIONS = "Notifications"

class ReportFormat(str, enum.Enum):
    CSV = "CSV"

class ReportScheduleFrequency(str, enum.Enum):
    DAILY = "Daily"
    WEEKLY = "Weekly"
    MONTHLY = "Monthly"

class ReportConfig(Base):
    __tablename__ = "report_configs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[ReportCategory] = mapped_column(Enum(ReportCategory, name="report_category"), nullable=False)
    format: Mapped[ReportFormat] = mapped_column(Enum(ReportFormat, name="report_format"), nullable=False, default=ReportFormat.CSV)
    filters: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    
    created_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    creator: Mapped["User"] = relationship("User", foreign_keys=[created_by])
    schedule: Mapped["ReportSchedule"] = relationship("ReportSchedule", back_populates="config", cascade="all, delete-orphan", uselist=False)
    history: Mapped[list["ReportHistory"]] = relationship("ReportHistory", back_populates="config", cascade="all, delete-orphan")


class ReportSchedule(Base):
    __tablename__ = "report_schedules"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    report_config_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("report_configs.id", ondelete="CASCADE"), nullable=False, unique=True)
    frequency: Mapped[ReportScheduleFrequency] = mapped_column(Enum(ReportScheduleFrequency, name="report_frequency"), nullable=False)
    next_run_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)

    config: Mapped["ReportConfig"] = relationship("ReportConfig", back_populates="schedule")


class ReportHistory(Base):
    __tablename__ = "report_history"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    report_config_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("report_configs.id", ondelete="CASCADE"), nullable=False, index=True)
    generated_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    generated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False) # SUCCESS, FAILED
    record_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    
    # Store a snapshot of the filters used at generation time in case the config changes
    filters_snapshot: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)

    config: Mapped["ReportConfig"] = relationship("ReportConfig", back_populates="history")
    generator: Mapped["User"] = relationship("User", foreign_keys=[generated_by])
