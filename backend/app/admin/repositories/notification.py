from typing import List, Dict, Any, Tuple, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, desc, asc, cast, Date, update, delete
from app.models.notification import Notification, NotificationRecipient, NotificationStatus, NotificationAudience, NotificationType, NotificationPriority
from app.models.user import User
from app.models.admin import AdminProfile
from app.admin.schemas.notification.notification import NotificationFilterParams
from datetime import datetime
import uuid

class AdminNotificationRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_notifications(self, params: NotificationFilterParams) -> Tuple[List[Dict[str, Any]], int]:
        stmt = select(Notification)
        count_stmt = select(func.count(Notification.id))

        filters = []
        if params.search:
            search = f"%{params.search}%"
            filters.append(or_(
                Notification.title.ilike(search),
                Notification.message.ilike(search)
            ))
        if params.status:
            filters.append(Notification.status == NotificationStatus(params.status))
        if params.type:
            filters.append(Notification.type == NotificationType(params.type))
        if params.priority:
            filters.append(Notification.priority == NotificationPriority(params.priority))
        if params.target_audience:
            filters.append(Notification.target_audience == NotificationAudience(params.target_audience))

        if filters:
            stmt = stmt.where(*filters)
            count_stmt = count_stmt.where(*filters)

        total_result = await self.session.execute(count_stmt)
        total = total_result.scalar_one_or_none() or 0

        # Sorting
        sort_col = getattr(Notification, params.sort_by, Notification.created_at)
        if params.sort_desc:
            stmt = stmt.order_by(desc(sort_col))
        else:
            stmt = stmt.order_by(asc(sort_col))

        stmt = stmt.offset((params.page - 1) * params.page_size).limit(params.page_size)
        result = await self.session.execute(stmt)
        notifs = result.scalars().all()
        
        # We need recipient stats for these. We can do a single aggregate query for all ids.
        notif_ids = [n.id for n in notifs]
        stats_map = {}
        if notif_ids:
            stats_stmt = select(
                NotificationRecipient.notification_id,
                func.count(NotificationRecipient.id).label('total'),
                func.count(NotificationRecipient.read_at).label('read')
            ).where(NotificationRecipient.notification_id.in_(notif_ids)).group_by(NotificationRecipient.notification_id)
            stats_result = await self.session.execute(stats_stmt)
            for r in stats_result.all():
                stats_map[r.notification_id] = {"total": r.total, "read": r.read}

        items = []
        for n in notifs:
            s = stats_map.get(n.id, {"total": 0, "read": 0})
            read_pct = (s["read"] / s["total"] * 100) if s["total"] > 0 else 0
            
            n_dict = {
                "id": n.id,
                "title": n.title,
                "message": n.message,
                "type": n.type,
                "priority": n.priority,
                "status": n.status,
                "target_audience": n.target_audience,
                "created_by": n.created_by,
                "created_at": n.created_at,
                "updated_at": n.updated_at,
                "scheduled_at": n.scheduled_at,
                "published_at": n.published_at,
                "expires_at": n.expires_at,
                "total_recipients": s["total"],
                "read_count": s["read"],
                "read_percentage": round(read_pct, 1)
            }
            items.append(n_dict)
            
        return items, total

    async def get_notification_by_id(self, notif_id: uuid.UUID) -> Optional[Dict[str, Any]]:
        stmt = select(Notification).where(Notification.id == notif_id)
        result = await self.session.execute(stmt)
        n = result.scalar_one_or_none()
        if not n:
            return None
            
        stats_stmt = select(
            func.count(NotificationRecipient.id).label('total'),
            func.count(NotificationRecipient.read_at).label('read')
        ).where(NotificationRecipient.notification_id == notif_id)
        stats_result = await self.session.execute(stats_stmt)
        s = stats_result.first()
        
        total = s.total if s else 0
        read = s.read if s else 0
        read_pct = (read / total * 100) if total > 0 else 0
        
        return {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "type": n.type,
            "priority": n.priority,
            "status": n.status,
            "target_audience": n.target_audience,
            "created_by": n.created_by,
            "created_at": n.created_at,
            "updated_at": n.updated_at,
            "scheduled_at": n.scheduled_at,
            "published_at": n.published_at,
            "expires_at": n.expires_at,
            "total_recipients": total,
            "read_count": read,
            "read_percentage": round(read_pct, 1)
        }

    async def get_statistics(self) -> Dict[str, Any]:
        stats = {}
        
        # KPIs
        total_stmt = select(func.count(Notification.id))
        stats["total_notifications"] = (await self.session.execute(total_stmt)).scalar_one_or_none() or 0
        
        active_stmt = select(func.count(Notification.id)).where(Notification.status == NotificationStatus.PUBLISHED)
        stats["active_notifications"] = (await self.session.execute(active_stmt)).scalar_one_or_none() or 0
        
        scheduled_stmt = select(func.count(Notification.id)).where(Notification.status == NotificationStatus.SCHEDULED)
        stats["scheduled_notifications"] = (await self.session.execute(scheduled_stmt)).scalar_one_or_none() or 0
        
        draft_stmt = select(func.count(Notification.id)).where(Notification.status == NotificationStatus.DRAFT)
        stats["draft_notifications"] = (await self.session.execute(draft_stmt)).scalar_one_or_none() or 0
        
        expired_stmt = select(func.count(Notification.id)).where(Notification.status == NotificationStatus.EXPIRED)
        stats["expired_notifications"] = (await self.session.execute(expired_stmt)).scalar_one_or_none() or 0
        
        # Distribution
        type_stmt = select(Notification.type, func.count(Notification.id)).group_by(Notification.type)
        stats["types_distribution"] = [{"name": r[0].value, "value": r[1]} for r in (await self.session.execute(type_stmt)).all()]
        
        priority_stmt = select(Notification.priority, func.count(Notification.id)).group_by(Notification.priority)
        stats["priority_distribution"] = [{"name": r[0].value, "value": r[1]} for r in (await self.session.execute(priority_stmt)).all()]
        
        audience_stmt = select(Notification.target_audience, func.count(Notification.id)).group_by(Notification.target_audience)
        stats["audience_distribution"] = [{"name": r[0].value, "value": r[1]} for r in (await self.session.execute(audience_stmt)).all()]
        
        # Over time (last 30 days)
        time_stmt = select(cast(Notification.created_at, Date).label('date'), func.count(Notification.id)).group_by(cast(Notification.created_at, Date)).order_by(cast(Notification.created_at, Date))
        stats["notifications_over_time"] = [{"date": str(r[0]), "count": r[1]} for r in (await self.session.execute(time_stmt)).all()]
        
        return stats

    async def get_audience_users(self, audience: NotificationAudience) -> List[User]:
        stmt = select(User)
        if audience == NotificationAudience.VERIFIED_USERS:
            stmt = stmt.where(User.is_verified == True)
        elif audience == NotificationAudience.ADMINS:
            stmt = stmt.join(AdminProfile, User.id == AdminProfile.user_id)
        # Add students/professionals logic if needed based on roles, but for now we fallback to all
        
        result = await self.session.execute(stmt)
        return result.scalars().all()
