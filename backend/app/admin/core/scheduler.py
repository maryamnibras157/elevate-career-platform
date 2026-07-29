import asyncio
from datetime import datetime
from loguru import logger
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import async_session_maker
from app.models.notification import Notification, NotificationStatus, NotificationRecipient
from app.admin.repositories.notification import AdminNotificationRepository

# Re-import the bg publish function so we don't duplicate email code
from app.admin.services.notification import _publish_notification_bg

async def _check_scheduled_notifications():
    """
    Periodically checks the database for SCHEDULED notifications 
    whose scheduled_at time has passed.
    """
    try:
        async with async_session_maker() as session:
            stmt = select(Notification.id).where(
                Notification.status == NotificationStatus.SCHEDULED,
                Notification.scheduled_at <= datetime.utcnow()
            )
            result = await session.execute(stmt)
            due_ids = result.scalars().all()

        for notif_id in due_ids:
            try:
                # _publish_notification_bg handles its own transaction and locking
                await _publish_notification_bg(notif_id)
            except Exception as job_e:
                logger.error(f"Failed processing notification {notif_id}: {job_e}")
                
    except Exception as e:
        logger.error(f"Error in notification scheduler loop: {e}")

from app.models.report import ReportSchedule, ReportScheduleFrequency, ReportHistory, ReportConfig
from app.admin.services.report import AdminReportService

from datetime import timedelta

async def _check_scheduled_reports():
    """
    Periodically checks the database for ACTIVE report schedules 
    whose next_run_at time has passed.
    """
    try:
        async with async_session_maker() as session:
            stmt = select(ReportSchedule.id).where(
                ReportSchedule.is_active == True,
                ReportSchedule.next_run_at <= datetime.utcnow()
            )
            result = await session.execute(stmt)
            due_schedule_ids = result.scalars().all()

        for schedule_id in due_schedule_ids:
            try:
                async with async_session_maker() as job_session:
                    stmt = select(ReportSchedule).where(
                        ReportSchedule.id == schedule_id,
                        ReportSchedule.is_active == True,
                        ReportSchedule.next_run_at <= datetime.utcnow()
                    ).with_for_update(skip_locked=True)
                    result = await job_session.execute(stmt)
                    schedule = result.scalars().first()
                    
                    if not schedule:
                        continue # Locked by another worker or already processed
                        
                    logger.info(f"Generating scheduled report config: {schedule.report_config_id}")
                    report_service = AdminReportService(job_session)
                    
                    try:
                        await report_service.run_and_log_report(schedule.report_config_id, admin_id=None)
                    except Exception as e:
                        logger.error(f"Failed to generate scheduled report {schedule.report_config_id}: {e}")
                    
                    # Bump schedule even if generation failed to prevent infinite retry loop
                    if schedule.frequency == ReportScheduleFrequency.DAILY:
                        schedule.next_run_at = datetime.utcnow() + timedelta(days=1)
                    elif schedule.frequency == ReportScheduleFrequency.WEEKLY:
                        schedule.next_run_at = datetime.utcnow() + timedelta(weeks=1)
                    elif schedule.frequency == ReportScheduleFrequency.MONTHLY:
                        schedule.next_run_at = datetime.utcnow() + timedelta(days=30)
                        
                    await job_session.commit()
            except Exception as e:
                logger.error(f"Failed to process scheduled report {schedule_id}: {e}")
            
    except Exception as e:
        logger.error(f"Error in report scheduler loop: {e}")

async def notification_scheduler_loop():
    """
    Infinite loop that runs while the FastAPI application is alive.
    Sleeps for 60 seconds between checks.
    """
    logger.info("Starting database-driven admin tasks scheduler...")
    while True:
        await _check_scheduled_notifications()
        await _check_scheduled_reports()
        await asyncio.sleep(60)

def start_notification_scheduler():
    """
    Fires the background task without awaiting it so it runs independently.
    """
    asyncio.create_task(notification_scheduler_loop())
