from typing import List, Dict, Any, Tuple, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, desc, asc, cast, Date
from sqlalchemy.orm import selectinload
from app.models.report import ReportConfig, ReportSchedule, ReportHistory, ReportCategory, ReportFormat
from app.models.user import User
from app.models.career import Career
from app.models.resume import ResumeAnalysis
from app.models.interview import InterviewSession
from app.models.notification import Notification
from app.models.audit import AuditLog
from app.admin.schemas.report.report import ReportFilterParams
from datetime import datetime, timedelta
import uuid

class AdminReportRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_report_configs(self, params: ReportFilterParams) -> Tuple[List[ReportConfig], int]:
        stmt = select(ReportConfig).options(selectinload(ReportConfig.schedule))
        count_stmt = select(func.count(ReportConfig.id))

        filters = []
        if params.search:
            filters.append(ReportConfig.name.ilike(f"%{params.search}%"))
        if params.category:
            filters.append(ReportConfig.category == ReportCategory(params.category))
        if params.format:
            filters.append(ReportConfig.format == ReportFormat(params.format))

        if filters:
            stmt = stmt.where(*filters)
            count_stmt = count_stmt.where(*filters)

        total_result = await self.session.execute(count_stmt)
        total = total_result.scalar_one_or_none() or 0

        sort_col = getattr(ReportConfig, params.sort_by, ReportConfig.created_at)
        if params.sort_desc:
            stmt = stmt.order_by(desc(sort_col))
        else:
            stmt = stmt.order_by(asc(sort_col))

        stmt = stmt.offset((params.page - 1) * params.page_size).limit(params.page_size)
        result = await self.session.execute(stmt)
        return result.scalars().all(), total

    async def get_report_history(self, params: ReportFilterParams) -> Tuple[List[Dict[str, Any]], int]:
        # We join with ReportConfig and User (generator) to get rich data
        stmt = select(ReportHistory, ReportConfig.name, ReportConfig.category, User.full_name).join(
            ReportConfig, ReportHistory.report_config_id == ReportConfig.id
        ).outerjoin(User, ReportHistory.generated_by == User.id)
        
        count_stmt = select(func.count(ReportHistory.id)).join(
            ReportConfig, ReportHistory.report_config_id == ReportConfig.id
        )

        filters = []
        if params.search:
            filters.append(ReportConfig.name.ilike(f"%{params.search}%"))
        if params.category:
            filters.append(ReportConfig.category == ReportCategory(params.category))
        if params.status:
            filters.append(ReportHistory.status == params.status)

        if filters:
            stmt = stmt.where(*filters)
            count_stmt = count_stmt.where(*filters)

        total_result = await self.session.execute(count_stmt)
        total = total_result.scalar_one_or_none() or 0

        # sort by generated_at descending primarily
        sort_col = getattr(ReportHistory, params.sort_by, ReportHistory.generated_at)
        if params.sort_desc:
            stmt = stmt.order_by(desc(sort_col))
        else:
            stmt = stmt.order_by(asc(sort_col))

        stmt = stmt.offset((params.page - 1) * params.page_size).limit(params.page_size)
        result = await self.session.execute(stmt)
        
        items = []
        for history, config_name, config_category, generator_name in result.all():
            items.append({
                "id": history.id,
                "report_config_id": history.report_config_id,
                "generated_by": history.generated_by,
                "generated_at": history.generated_at,
                "status": history.status,
                "record_count": history.record_count,
                "filters_snapshot": history.filters_snapshot,
                "config_name": config_name,
                "config_category": config_category,
                "generator_name": generator_name
            })
        
        return items, total

    async def get_executive_metrics(self) -> Dict[str, Any]:
        metrics = {}
        
        # Totals
        metrics["total_users"] = (await self.session.execute(select(func.count(User.id)))).scalar_one_or_none() or 0
        metrics["total_careers"] = (await self.session.execute(select(func.count(Career.id)))).scalar_one_or_none() or 0
        metrics["total_resumes"] = (await self.session.execute(select(func.count(ResumeAnalysis.id)))).scalar_one_or_none() or 0
        metrics["total_interviews"] = (await self.session.execute(select(func.count(InterviewSession.id)))).scalar_one_or_none() or 0
        
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        
        # User Growth (last 30 days)
        ug_stmt = select(cast(User.created_at, Date).label('date'), func.count(User.id)).where(User.created_at >= thirty_days_ago).group_by(cast(User.created_at, Date)).order_by(cast(User.created_at, Date))
        metrics["user_growth"] = [{"date": str(r[0]), "count": r[1]} for r in (await self.session.execute(ug_stmt)).all()]
        
        # Career Distribution
        cd_stmt = select(Career.category, func.count(Career.id)).group_by(Career.category)
        metrics["career_distribution"] = [{"name": r[0] or "Uncategorized", "value": r[1]} for r in (await self.session.execute(cd_stmt)).all()]
        
        # Resume Scores (Distribution in buckets: 0-50, 51-70, 71-100)
        # Using a simple CASE in postgres
        rs_stmt = select(
            func.sum(func.cast(ResumeAnalysis.resume_score <= 50, func.Integer())).label('Low (0-50)'),
            func.sum(func.cast((ResumeAnalysis.resume_score > 50) & (ResumeAnalysis.resume_score <= 75), func.Integer())).label('Medium (51-75)'),
            func.sum(func.cast(ResumeAnalysis.resume_score > 75, func.Integer())).label('High (76-100)')
        ).where(ResumeAnalysis.resume_score != None)
        rs_row = (await self.session.execute(rs_stmt)).first()
        if rs_row:
            metrics["resume_scores"] = [
                {"name": "0-50", "value": int(rs_row[0] or 0)},
                {"name": "51-75", "value": int(rs_row[1] or 0)},
                {"name": "76-100", "value": int(rs_row[2] or 0)}
            ]
        else:
            metrics["resume_scores"] = []

        # Platform Activity (last 30 days Notification and Audit Events)
        pa_stmt = select(cast(AuditLog.created_at, Date).label('date'), func.count(AuditLog.id)).where(AuditLog.created_at >= thirty_days_ago).group_by(cast(AuditLog.created_at, Date)).order_by(cast(AuditLog.created_at, Date))
        metrics["platform_activity"] = [{"date": str(r[0]), "count": r[1]} for r in (await self.session.execute(pa_stmt)).all()]
        
        return metrics

    async def get_report_config(self, config_id: uuid.UUID) -> Optional[ReportConfig]:
        stmt = select(ReportConfig).options(selectinload(ReportConfig.schedule)).where(ReportConfig.id == config_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
