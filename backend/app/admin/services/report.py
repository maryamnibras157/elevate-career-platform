import uuid
import csv
import io
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.admin.repositories.report import AdminReportRepository
from app.admin.schemas.report.report import ReportConfigCreate, ReportFilterParams
from app.models.report import ReportConfig, ReportSchedule, ReportHistory, ReportCategory, ReportFormat, ReportScheduleFrequency
from app.models.user import User
from app.models.career import Career
from app.models.resume import ResumeAnalysis
from app.models.audit import AuditLog
from app.models.notification import Notification
from app.admin.core.audit import log_admin_event

class AdminReportService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repo = AdminReportRepository(session)

    async def get_report_configs(self, params: ReportFilterParams) -> Dict[str, Any]:
        items, total = await self.repo.get_report_configs(params)
        return {
            "items": items,
            "total": total,
            "page": params.page,
            "page_size": params.page_size,
            "pages": (total + params.page_size - 1) // params.page_size
        }

    async def get_report_history(self, params: ReportFilterParams) -> Dict[str, Any]:
        items, total = await self.repo.get_report_history(params)
        return {
            "items": items,
            "total": total,
            "page": params.page,
            "page_size": params.page_size,
            "pages": (total + params.page_size - 1) // params.page_size
        }

    async def get_executive_metrics(self) -> Dict[str, Any]:
        return await self.repo.get_executive_metrics()
        
    async def get_report_config(self, config_id: uuid.UUID) -> Optional[ReportConfig]:
        return await self.repo.get_report_config(config_id)

    async def create_report_config(self, payload: ReportConfigCreate, admin_id: uuid.UUID) -> ReportConfig:
        config = ReportConfig(
            name=payload.name,
            category=payload.category,
            format=payload.format,
            filters=payload.filters,
            created_by=admin_id
        )
        self.session.add(config)
        await self.session.flush()

        if payload.schedule:
            next_run = datetime.utcnow()
            if payload.schedule.frequency == ReportScheduleFrequency.DAILY:
                next_run += timedelta(days=1)
            elif payload.schedule.frequency == ReportScheduleFrequency.WEEKLY:
                next_run += timedelta(weeks=1)
            elif payload.schedule.frequency == ReportScheduleFrequency.MONTHLY:
                next_run += timedelta(days=30)
                
            schedule = ReportSchedule(
                report_config_id=config.id,
                frequency=payload.schedule.frequency,
                is_active=payload.schedule.is_active,
                next_run_at=next_run
            )
            self.session.add(schedule)

        await self.session.commit()
        await log_admin_event("report_configured", str(admin_id), "SUCCESS", {"report_config_id": str(config.id)})
        return await self.get_report_config(config.id)

    async def delete_report_config(self, config_id: uuid.UUID, admin_id: uuid.UUID) -> bool:
        c = await self.session.get(ReportConfig, config_id)
        if not c:
            return False
        await self.session.delete(c)
        await self.session.commit()
        await log_admin_event("report_deleted", str(admin_id), "SUCCESS", {"report_config_id": str(config_id)})
        return True

    async def generate_csv_report(self, category: ReportCategory, filters: Dict[str, Any]) -> Tuple[io.StringIO, int]:
        """
        Dynamically builds the query based on category and returns a CSV stringIO along with the row count.
        """
        output = io.StringIO()
        writer = csv.writer(output)
        row_count = 0

        # We will dispatch to different internal methods
        if category == ReportCategory.USERS:
            stmt = select(User.id, User.email, User.full_name, User.role, User.is_verified, User.created_at)
            # apply generic date filters if present
            result = await self.session.execute(stmt)
            writer.writerow(["ID", "Email", "Full Name", "Role", "Verified", "Created At"])
            for row in result.all():
                writer.writerow(row)
                row_count += 1

        elif category == ReportCategory.CAREERS:
            stmt = select(Career.id, Career.title, Career.category, Career.demand_level, Career.average_salary, Career.created_at)
            result = await self.session.execute(stmt)
            writer.writerow(["ID", "Title", "Category", "Demand Level", "Avg Salary", "Created At"])
            for row in result.all():
                writer.writerow(row)
                row_count += 1

        elif category == ReportCategory.RESUMES:
            stmt = select(Resume.id, Resume.user_id, Resume.score, Resume.ats_score, Resume.created_at)
            result = await self.session.execute(stmt)
            writer.writerow(["ID", "User ID", "Overall Score", "ATS Score", "Created At"])
            for row in result.all():
                writer.writerow(row)
                row_count += 1

        elif category == ReportCategory.AUDIT_LOGS:
            stmt = select(AuditLog.id, AuditLog.action, AuditLog.user_id, AuditLog.user_email, AuditLog.status, AuditLog.created_at)
            result = await self.session.execute(stmt)
            writer.writerow(["ID", "Action", "Admin ID", "Admin Email", "Status", "Timestamp"])
            for row in result.all():
                writer.writerow(row)
                row_count += 1

        elif category == ReportCategory.NOTIFICATIONS:
            stmt = select(Notification.id, Notification.title, Notification.type, Notification.priority, Notification.status, Notification.created_at)
            result = await self.session.execute(stmt)
            writer.writerow(["ID", "Title", "Type", "Priority", "Status", "Created At"])
            for row in result.all():
                writer.writerow(row)
                row_count += 1

        output.seek(0)
        return output, row_count

    async def run_and_log_report(self, config_id: uuid.UUID, admin_id: Optional[uuid.UUID] = None) -> Tuple[io.StringIO, str]:
        """
        Runs the report defined by config_id, logs it to ReportHistory, and returns the CSV.
        """
        config = await self.get_report_config(config_id)
        if not config:
            raise ValueError("Report configuration not found")

        try:
            csv_output, count = await self.generate_csv_report(config.category, config.filters)
            
            history = ReportHistory(
                report_config_id=config.id,
                generated_by=admin_id,
                status="SUCCESS",
                record_count=count,
                filters_snapshot=config.filters
            )
            self.session.add(history)
            await self.session.commit()
            
            if admin_id:
                await log_admin_event("report_exported", str(admin_id), "SUCCESS", {"report_config_id": str(config.id)})
            
            return csv_output, f"{config.name.replace(' ', '_')}_{datetime.utcnow().strftime('%Y%m%d')}.csv"
            
        except Exception as e:
            history = ReportHistory(
                report_config_id=config.id,
                generated_by=admin_id,
                status="FAILED",
                record_count=0,
                filters_snapshot=config.filters
            )
            self.session.add(history)
            await self.session.commit()
            raise e
