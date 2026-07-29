from datetime import datetime, timedelta

def get_date_range(days: int) -> tuple[datetime, datetime]:
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    return start_date, end_date
