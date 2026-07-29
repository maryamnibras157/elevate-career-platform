from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List
from uuid import UUID

from app.models.recommendation import SkillGap
from app.models.career import Career
from app.models.resume import ResumeAnalysis


class SkillGapService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_skill_gaps(self, user_id: UUID) -> List[SkillGap]:
        result = await self.session.execute(
            select(SkillGap)
            .options(
                selectinload(SkillGap.career),
                selectinload(SkillGap.career).selectinload(Career.skills)
            )
            .filter(SkillGap.user_id == user_id)
            .order_by(SkillGap.created_at.desc())
        )

        return result.scalars().unique().all()

    async def generate_skill_gap(self, user_id: UUID, career_id: UUID) -> SkillGap:
        # Get latest resume
        resume_res = await self.session.execute(
            select(ResumeAnalysis)
            .filter(ResumeAnalysis.user_id == user_id)
            .order_by(ResumeAnalysis.created_at.desc())
            .limit(1)
        )

        latest_resume = resume_res.scalars().first()

        user_skills = set()
        if latest_resume and latest_resume.skills:
            user_skills = {s.lower() for s in latest_resume.skills}

        # Load career WITH skills
        career_res = await self.session.execute(
            select(Career)
            .options(selectinload(Career.skills))
            .filter(Career.id == career_id)
        )

        career = career_res.scalars().first()

        if not career:
            raise ValueError("Career not found")

        career_skills = (
            {s.name.lower() for s in career.skills}
            if career.skills
            else set()
        )

        missing = list(career_skills.difference(user_skills))

        gap_pct = (
            (len(missing) / len(career_skills)) * 100
            if career_skills
            else 0.0
        )

        difficulty = "Low"

        if gap_pct > 70:
            difficulty = "High"
        elif gap_pct > 30:
            difficulty = "Medium"

        time_est = f"{len(missing) * 2} weeks" if missing else "Ready"

        # Remove previous result
        await self.session.execute(
            SkillGap.__table__.delete().where(
                SkillGap.user_id == user_id,
                SkillGap.career_id == career_id,
            )
        )

        gap = SkillGap(
            user_id=user_id,
            career_id=career_id,
            gap_percentage=round(gap_pct, 1),
            missing_technologies=[s.title() for s in missing],
            priority_skills=[s.title() for s in missing[:3]],
            learning_difficulty=difficulty,
            estimated_learning_time=time_est,
        )

        self.session.add(gap)

        await self.session.commit()

        # Reload WITH relationships
        result = await self.session.execute(
            select(SkillGap)
            .options(
                selectinload(SkillGap.career),
                selectinload(SkillGap.career).selectinload(Career.skills)
            )
            .filter(SkillGap.id == gap.id)
        )

        return result.scalars().first()