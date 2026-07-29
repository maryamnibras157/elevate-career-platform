from pydantic import BaseModel

class DashboardSummaryOut(BaseModel):
    total_users: int
    active_users: int
    total_careers: int
    published_careers: int
    total_resume_uploads: int
    total_interviews: int
    ai_mentor_sessions: int
    roadmaps_generated: int
