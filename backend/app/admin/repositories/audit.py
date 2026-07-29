from typing import List, Dict, Any, Tuple, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, desc, asc, cast, Date
from app.models.audit import AuditLog
from app.models.user import User
from app.admin.schemas.audit.audit import AuditFilterParams
from datetime import datetime, timedelta
import uuid

class AdminAuditRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_logs(self, params: AuditFilterParams) -> Tuple[List[Dict[str, Any]], int]:
        stmt = select(AuditLog, User).outerjoin(User, AuditLog.user_id == User.id)
        count_stmt = select(func.count(AuditLog.id))

        filters = []
        if params.search:
            search = f"%{params.search}%"
            filters.append(or_(
                AuditLog.action.ilike(search),
                AuditLog.resource.ilike(search),
                User.email.ilike(search),
                User.full_name.ilike(search)
            ))
        if params.action:
            filters.append(AuditLog.action == params.action)
        if params.user_id:
            filters.append(AuditLog.user_id == params.user_id)
        if params.date_from:
            filters.append(AuditLog.created_at >= params.date_from)
        if params.date_to:
            filters.append(AuditLog.created_at <= params.date_to)
            
        # Status is inside metadata_
        if params.status:
            # We can use JSONB specific query if it's JSONB, but metadata_ is JSON.
            # We can use func.json_extract_path_text(AuditLog.metadata_, 'status') == params.status for postgres
            # A simpler cross-db way if metadata_ maps to a dictionary in Python is to filter in Python, but that ruins pagination.
            # For Postgres JSON/JSONB:
            filters.append(AuditLog.metadata_['status'].astext == params.status)

        if filters:
            stmt = stmt.where(*filters)
            count_stmt = count_stmt.where(*filters)

        total_result = await self.session.execute(count_stmt)
        total = total_result.scalar_one_or_none() or 0

        # Sorting
        sort_col = getattr(AuditLog, params.sort_by, AuditLog.created_at)
        if params.sort_desc:
            stmt = stmt.order_by(desc(sort_col))
        else:
            stmt = stmt.order_by(asc(sort_col))

        stmt = stmt.offset((params.page - 1) * params.page_size).limit(params.page_size)
        result = await self.session.execute(stmt)
        rows = result.all()
        
        logs = []
        for audit, user in rows:
            # Masking sensitive info
            masked_metadata = self._mask_sensitive_data(audit.metadata_)
            
            logs.append({
                "id": audit.id,
                "user_id": audit.user_id,
                "user_name": user.full_name if user else None,
                "user_email": user.email if user else None,
                "action": audit.action,
                "resource": audit.resource,
                "resource_id": audit.resource_id,
                "status": masked_metadata.get("status") if masked_metadata else None,
                "metadata_": masked_metadata,
                "ip_address": audit.ip_address,
                "created_at": audit.created_at
            })
            
        return logs, total

    async def get_log_by_id(self, log_id: uuid.UUID) -> Optional[Dict[str, Any]]:
        stmt = select(AuditLog, User).outerjoin(User, AuditLog.user_id == User.id).where(AuditLog.id == log_id)
        result = await self.session.execute(stmt)
        row = result.first()
        if not row:
            return None
            
        audit, user = row
        masked_metadata = self._mask_sensitive_data(audit.metadata_)
        return {
            "id": audit.id,
            "user_id": audit.user_id,
            "user_name": user.full_name if user else None,
            "user_email": user.email if user else None,
            "action": audit.action,
            "resource": audit.resource,
            "resource_id": audit.resource_id,
            "status": masked_metadata.get("status") if masked_metadata else None,
            "metadata_": masked_metadata,
            "ip_address": audit.ip_address,
            "created_at": audit.created_at
        }

    async def get_statistics(self) -> Dict[str, Any]:
        stats = {}
        
        # 1. KPIs
        today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        
        total_stmt = select(func.count(AuditLog.id))
        total_result = await self.session.execute(total_stmt)
        stats["total_events"] = total_result.scalar_one_or_none() or 0
        
        today_stmt = select(func.count(AuditLog.id)).where(AuditLog.created_at >= today)
        today_result = await self.session.execute(today_stmt)
        stats["events_today"] = today_result.scalar_one_or_none() or 0
        
        success_stmt = select(func.count(AuditLog.id)).where(AuditLog.metadata_['status'].astext == 'SUCCESS')
        success_result = await self.session.execute(success_stmt)
        stats["successful_operations"] = success_result.scalar_one_or_none() or 0
        
        failed_stmt = select(func.count(AuditLog.id)).where(AuditLog.metadata_['status'].astext == 'FAILED')
        failed_result = await self.session.execute(failed_stmt)
        stats["failed_operations"] = failed_result.scalar_one_or_none() or 0
        
        # 2. Activity Over Time (Last 30 days)
        thirty_days_ago = today - timedelta(days=30)
        time_stmt = select(
            cast(AuditLog.created_at, Date).label('date'),
            func.count(AuditLog.id).label('count')
        ).where(AuditLog.created_at >= thirty_days_ago).group_by(cast(AuditLog.created_at, Date)).order_by(cast(AuditLog.created_at, Date))
        time_result = await self.session.execute(time_stmt)
        stats["activity_over_time"] = [{"date": str(r.date), "count": r.count} for r in time_result.all()]
        
        # 3. Actions by Category
        category_stmt = select(
            AuditLog.action,
            func.count(AuditLog.id).label('count')
        ).group_by(AuditLog.action).order_by(desc('count')).limit(10)
        category_result = await self.session.execute(category_stmt)
        stats["actions_by_category"] = [{"name": r.action, "value": r.count} for r in category_result.all()]
        
        # 4. Success vs Failure
        stats["success_vs_failure"] = [
            {"name": "Success", "value": stats["successful_operations"]},
            {"name": "Failed", "value": stats["failed_operations"]}
        ]
        
        # 5. Top Administrators
        admin_stmt = select(
            User.full_name,
            User.email,
            func.count(AuditLog.id).label('count')
        ).join(User, AuditLog.user_id == User.id).group_by(User.id).order_by(desc('count')).limit(5)
        admin_result = await self.session.execute(admin_stmt)
        stats["top_administrators"] = [{"name": r.full_name or r.email, "count": r.count} for r in admin_result.all()]
        
        return stats

    def _mask_sensitive_data(self, data: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        if not data:
            return data
            
        masked = dict(data)
        sensitive_keys = ['password', 'secret', 'key', 'token', 'credentials', 'authorization']
        
        for k, v in masked.items():
            if any(s in k.lower() for s in sensitive_keys):
                masked[k] = "********"
            elif isinstance(v, dict):
                masked[k] = self._mask_sensitive_data(v)
                
        return masked
