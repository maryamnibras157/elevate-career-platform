import uuid
from typing import Dict, Any, Optional
from datetime import datetime
from app.admin.core.logging import admin_logger

async def log_admin_event(action: str, user_id: str, status: str = "SUCCESS", details: Optional[Dict[str, Any]] = None):
    """
    Reusable hook for audit logging.
    Logs to the application logger and writes to the audit database table.
    """
    log_data = {
        "event_id": str(uuid.uuid4()),
        "timestamp": datetime.utcnow().isoformat(),
        "action": action,
        "user_id": user_id,
        "status": status,
        "details": details or {}
    }
    
    if status == "SUCCESS":
        admin_logger.info(f"Audit Event: {action} by {user_id}", extra=log_data)
    else:
        admin_logger.warning(f"Audit Event Failed: {action} by {user_id}", extra=log_data)

    # Save to db
    from app.database import async_session_maker
    from app.models.audit import AuditLog

    try:
        async with async_session_maker() as session:
            try:
                user_uuid = uuid.UUID(user_id) if user_id else None
            except Exception:
                user_uuid = None
                
            meta = details or {}
            meta["status"] = status
            
            audit = AuditLog(
                user_id=user_uuid,
                action=action,
                resource=meta.get("resource"),
                resource_id=meta.get("resource_id"),
                metadata_=meta,
                ip_address=meta.get("ip_address")
            )
            session.add(audit)
            await session.commit()
    except Exception as e:
        admin_logger.error(f"Failed to write audit log to DB: {e}")
