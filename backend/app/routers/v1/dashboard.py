from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.sql import func
from sqlalchemy.orm import selectinload
from typing import Dict, Any
from uuid import UUID

from app.database import get_async_session
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.common import APIResponse

from app.models.resume import ResumeAnalysis
from app.models.recommendation import CareerRecommendation, SkillGap
from app.models.roadmap import Roadmap, RoadmapStep
from app.models.career import Career

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=APIResponse[Dict[str, Any]], summary="Get AI dashboard summary")
async def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    user_id = current_user.id
    
    # 1. Latest Recommendation
    rec_res = await session.execute(
        select(CareerRecommendation).join(Career)
        .options(selectinload(CareerRecommendation.career))
        .filter(CareerRecommendation.user_id == user_id)
        .order_by(CareerRecommendation.match_percentage.desc())
        .limit(1)
    )
    latest_rec = rec_res.scalars().first()
    
    # 2. Latest Resume Score
    res_res = await session.execute(
        select(ResumeAnalysis)
        .filter(ResumeAnalysis.user_id == user_id)
        .order_by(ResumeAnalysis.created_at.desc())
        .limit(1)
    )
    latest_resume = res_res.scalars().first()
    
    # 3. Roadmap Progress
    roadmap_res = await session.execute(
        select(Roadmap)
        .options(selectinload(Roadmap.steps))
        .filter(Roadmap.user_id == user_id)
        .order_by(Roadmap.created_at.desc())
        .limit(1)
    )
    roadmap = roadmap_res.scalars().first()
    
    roadmap_progress = 0
    if roadmap and roadmap.steps:
        completed = sum(1 for s in roadmap.steps if s.is_completed)
        roadmap_progress = int((completed / len(roadmap.steps)) * 100)
        
    # 4. Average Skill Gap
    gap_res = await session.execute(
        select(func.avg(SkillGap.gap_percentage))
        .filter(SkillGap.user_id == user_id)
    )
    avg_gap = gap_res.scalar()
    
    data = {
        "latest_recommendation": {
            "title": latest_rec.career.title if latest_rec and latest_rec.career else "None",
            "match": latest_rec.match_percentage if latest_rec else 0
        },
        "resume_score": latest_resume.resume_score if latest_resume else 0,
        "roadmap_progress": roadmap_progress,
        "skill_gap": round(avg_gap, 1) if avg_gap else 0,
        "recent_ai_activity": [
            "Analyzed updated resume" if latest_resume else "Please upload a resume",
            f"Generated roadmap for {roadmap.career.title}" if roadmap and roadmap.career else "No roadmap generated yet"
        ]
    }
    return APIResponse(success=True, message="Dashboard summary retrieved", data=data)
