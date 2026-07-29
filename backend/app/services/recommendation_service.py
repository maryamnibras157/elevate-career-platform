from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List
from uuid import UUID

from app.models.recommendation import CareerRecommendation
from app.models.career import Career
from app.models.resume import ResumeAnalysis


class RecommendationService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_recommendations(self, user_id: UUID) -> List[CareerRecommendation]:
        result = await self.session.execute(
            select(CareerRecommendation)
            .options(
                selectinload(CareerRecommendation.career)
                .selectinload(Career.skills)
            )
            .filter(CareerRecommendation.user_id == user_id)
            .order_by(CareerRecommendation.match_percentage.desc())
        )
        return result.scalars().all()

    async def generate_recommendations(self, user_id: UUID, profile_data: dict) -> List[CareerRecommendation]:
        # Fetch user's latest resume analysis
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

        # Fetch all careers with their required skills
        careers_result = await self.session.execute(
            select(Career).options(
                selectinload(Career.skills)
            )
        )
        careers = careers_result.scalars().all()

        # Remove old recommendations
        await self.session.execute(
            CareerRecommendation.__table__.delete().where(
                CareerRecommendation.user_id == user_id
            )
        )

        recommendations = []

        for career in careers:
            career_skills = (
                {s.name.lower() for s in career.skills}
                if career.skills else set()
            )

            if not career_skills:
                continue

            matched_skills = user_skills.intersection(career_skills)
            missing_skills = career_skills.difference(user_skills)

            match_pct = (len(matched_skills) / len(career_skills)) * 100

            confidence_score = 0.8
            if latest_resume and latest_resume.resume_score:
                confidence_score = min(
                    0.95,
                    0.5 + (latest_resume.resume_score / 200)
                )

            why_matches = (
                f"You have {len(matched_skills)} out of "
                f"{len(career_skills)} key skills needed for this role."
            )

            if match_pct > 80:
                why_matches = (
                    "Strong match! Your skill profile aligns almost perfectly "
                    "with industry requirements."
                )
            elif match_pct < 30:
                why_matches = (
                    "Significant upskilling required to transition into this role."
                )

            rec = CareerRecommendation(
                user_id=user_id,
                career_id=career.id,
                match_percentage=round(match_pct, 1),
                confidence_score=round(confidence_score, 2),
                why_matches=why_matches,
                missing_skills=[s.title() for s in missing_skills],
                learning_roadmap_summary=(
                    f"Focus on mastering "
                    f"{', '.join([s.title() for s in missing_skills][:3])}."
                    if missing_skills
                    else "Ready for interviews!"
                )
            )

            recommendations.append(rec)

        # Keep only the top 10 recommendations
        recommendations.sort(
            key=lambda x: x.match_percentage,
            reverse=True
        )
        top_recs = recommendations[:10]

        self.session.add_all(top_recs)
        await self.session.commit()

        # Reload recommendations with career and career.skills eagerly loaded
        result = await self.session.execute(
            select(CareerRecommendation)
            .options(
                selectinload(CareerRecommendation.career)
                .selectinload(Career.skills)
            )
            .filter(
                CareerRecommendation.id.in_(
                    [r.id for r in top_recs]
                )
            )
            .order_by(CareerRecommendation.match_percentage.desc())
        )

        return result.scalars().all()