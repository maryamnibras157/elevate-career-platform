from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, cast, String
from app.models.user import User
from app.models.career import Career
from app.models.resume import ResumeAnalysis
from app.models.interview import InterviewSession
from app.models.mentor import ChatConversation, ChatMessage

class AdminAnalyticsRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    def _apply_date_filters(self, stmt: Any, date_column: Any, start_date: Optional[datetime], end_date: Optional[datetime]) -> Any:
        if start_date:
            stmt = stmt.where(date_column >= start_date)
        if end_date:
            stmt = stmt.where(date_column <= end_date)
        return stmt

    async def get_user_growth(self, start_date: Optional[datetime], end_date: Optional[datetime], period: str, limit: int) -> List[Dict[str, Any]]:
        # Map period string to valid date_trunc argument
        valid_periods = {"day": "day", "week": "week", "month": "month"}
        pg_period = valid_periods.get(period, "day")
        
        date_expr = func.date_trunc(pg_period, User.created_at)
        
        stmt = select(
            cast(date_expr, String).label("period_label"),
            func.count(User.id).label("count")
        ).group_by(date_expr).order_by(date_expr.asc())
        
        stmt = self._apply_date_filters(stmt, User.created_at, start_date, end_date)
        stmt = stmt.limit(limit)
        
        result = await self.session.execute(stmt)
        return [{"label": row.period_label, "count": row.count} for row in result.all()]

    async def get_career_growth(self, start_date: Optional[datetime], end_date: Optional[datetime], period: str, limit: int) -> List[Dict[str, Any]]:
        valid_periods = {"day": "day", "week": "week", "month": "month"}
        pg_period = valid_periods.get(period, "day")
        
        date_expr = func.date_trunc(pg_period, Career.created_at)
        
        stmt = select(
            cast(date_expr, String).label("period_label"),
            func.count(Career.id).label("count")
        ).group_by(date_expr).order_by(date_expr.asc())
        
        stmt = self._apply_date_filters(stmt, Career.created_at, start_date, end_date)
        stmt = stmt.limit(limit)
        
        result = await self.session.execute(stmt)
        return [{"label": row.period_label, "count": row.count} for row in result.all()]

    async def get_resume_trends(self, start_date: Optional[datetime], end_date: Optional[datetime], period: str, limit: int) -> Dict[str, Any]:
        # Uploads over time
        valid_periods = {"day": "day", "week": "week", "month": "month"}
        pg_period = valid_periods.get(period, "day")
        date_expr = func.date_trunc(pg_period, ResumeAnalysis.created_at)
        
        trend_stmt = select(
            cast(date_expr, String).label("period_label"),
            func.count(ResumeAnalysis.id).label("count")
        ).group_by(date_expr).order_by(date_expr.asc())
        trend_stmt = self._apply_date_filters(trend_stmt, ResumeAnalysis.created_at, start_date, end_date)
        trend_stmt = trend_stmt.limit(limit)
        
        trend_result = await self.session.execute(trend_stmt)
        uploads_data = [{"label": row.period_label, "count": row.count} for row in trend_result.all()]
        
        # Averages
        avg_stmt = select(
            func.avg(ResumeAnalysis.resume_score).label("avg_resume"),
            func.avg(ResumeAnalysis.ats_score).label("avg_ats")
        )
        avg_stmt = self._apply_date_filters(avg_stmt, ResumeAnalysis.created_at, start_date, end_date)
        avg_result = (await self.session.execute(avg_stmt)).one_or_none()
        
        avg_resume = float(avg_result.avg_resume) if avg_result and avg_result.avg_resume is not None else 0.0
        avg_ats = float(avg_result.avg_ats) if avg_result and avg_result.avg_ats is not None else 0.0
        
        return {
            "uploads_data": uploads_data,
            "average_resume_score": avg_resume,
            "average_ats_score": avg_ats
        }

    async def get_interview_analytics(self, start_date: Optional[datetime], end_date: Optional[datetime]) -> Dict[str, Any]:
        stmt = select(
            func.count(InterviewSession.id).label("total"),
            func.sum(cast(InterviewSession.status == 'completed', func.integer)).label("completed"),
            func.sum(cast(InterviewSession.status == 'in_progress', func.integer)).label("in_progress"),
            func.avg(InterviewSession.overall_score).label("avg_score"),
            func.sum(cast(InterviewSession.interview_type == 'Technical', func.integer)).label("tech_count"),
            func.sum(cast(InterviewSession.interview_type == 'Behavioral', func.integer)).label("beh_count"),
            func.sum(cast(InterviewSession.interview_type == 'Mixed', func.integer)).label("mixed_count")
        )
        stmt = self._apply_date_filters(stmt, InterviewSession.created_at, start_date, end_date)
        result = (await self.session.execute(stmt)).one_or_none()
        
        if not result:
            return {
                "total_interviews": 0, "completed_interviews": 0, "in_progress_interviews": 0,
                "average_overall_score": 0.0, "technical_count": 0, "behavioral_count": 0, "mixed_count": 0
            }
            
        return {
            "total_interviews": result.total or 0,
            "completed_interviews": result.completed or 0,
            "in_progress_interviews": result.in_progress or 0,
            "average_overall_score": float(result.avg_score) if result.avg_score is not None else 0.0,
            "technical_count": result.tech_count or 0,
            "behavioral_count": result.beh_count or 0,
            "mixed_count": result.mixed_count or 0
        }

    async def get_mentor_usage_analytics(self, start_date: Optional[datetime], end_date: Optional[datetime]) -> Dict[str, Any]:
        # Sessions
        sess_stmt = select(func.count(ChatConversation.id).label("total"), func.count(func.distinct(ChatConversation.user_id)).label("active_users"))
        sess_stmt = self._apply_date_filters(sess_stmt, ChatConversation.created_at, start_date, end_date)
        sess_result = (await self.session.execute(sess_stmt)).one_or_none()
        
        total_sessions = sess_result.total if sess_result else 0
        active_users = sess_result.active_users if sess_result else 0
        
        # Messages
        msg_stmt = select(func.count(ChatMessage.id).label("total"))
        msg_stmt = self._apply_date_filters(msg_stmt, ChatMessage.created_at, start_date, end_date)
        msg_result = (await self.session.execute(msg_stmt)).one_or_none()
        
        total_messages = msg_result.total if msg_result else 0
        
        avg_msgs = total_messages / total_sessions if total_sessions > 0 else 0.0
        
        return {
            "total_sessions": total_sessions,
            "total_messages": total_messages,
            "average_messages_per_session": avg_msgs,
            "active_users": active_users
        }
