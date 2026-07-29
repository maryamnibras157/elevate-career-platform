from typing import List
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.recommendation import CareerRecommendation
from app.models.resume import ResumeAnalysis
from app.models.roadmap import Roadmap
from app.models.user import User


async def build_user_context(
    db: AsyncSession,
    user_id: UUID | str,
) -> str:
    """
    Build personalized career context for the authenticated user.

    Relationships are eagerly loaded to avoid async lazy-loading and
    MissingGreenlet errors.
    """

    resolved_user_id = UUID(str(user_id))

    # Fetch user.
    user_result = await db.execute(
        select(User).where(User.id == resolved_user_id)
    )
    user = user_result.scalars().first()

    if not user:
        return "User data is unavailable."

    # Fetch latest resume analysis.
    resume_result = await db.execute(
        select(ResumeAnalysis)
        .where(ResumeAnalysis.user_id == resolved_user_id)
        .order_by(ResumeAnalysis.created_at.desc())
        .limit(1)
    )
    latest_resume = resume_result.scalars().first()

    # Fetch highest career recommendation and eagerly load its career.
    recommendation_result = await db.execute(
        select(CareerRecommendation)
        .options(selectinload(CareerRecommendation.career))
        .where(CareerRecommendation.user_id == resolved_user_id)
        .order_by(CareerRecommendation.match_percentage.desc())
        .limit(1)
    )
    top_recommendation = recommendation_result.scalars().first()

    # Fetch latest roadmap and eagerly load its steps.
    roadmap_result = await db.execute(
        select(Roadmap)
        .options(selectinload(Roadmap.steps))
        .where(Roadmap.user_id == resolved_user_id)
        .order_by(Roadmap.created_at.desc())
        .limit(1)
    )
    latest_roadmap = roadmap_result.scalars().first()

    context_lines: List[str] = [
        f"User Name: {user.full_name or 'Not provided'}"
    ]

    # Resume context.
    if latest_resume:
        if latest_resume.resume_score is not None:
            context_lines.append(
                f"Latest Resume Score: {latest_resume.resume_score}/100"
            )

        if latest_resume.ats_score is not None:
            context_lines.append(
                f"ATS Score: {latest_resume.ats_score}/100"
            )

        if latest_resume.skills:
            normalized_skills = []

            for skill in latest_resume.skills:
                if isinstance(skill, str):
                    skill_name = skill.strip()
                elif isinstance(skill, dict):
                    skill_name = str(
                        skill.get("skill")
                        or skill.get("name")
                        or skill.get("title")
                        or ""
                    ).strip()
                else:
                    skill_name = str(skill).strip()

                if skill_name:
                    normalized_skills.append(skill_name)

            if normalized_skills:
                context_lines.append(
                    f"Detected Skills: {', '.join(normalized_skills)}"
                )
    else:
        context_lines.append("No resume analysis is currently available.")

    # Recommendation context.
    if top_recommendation and top_recommendation.career:
        context_lines.append(
            "Top Recommended Career: "
            f"{top_recommendation.career.title} "
            f"(Match: {top_recommendation.match_percentage}%)"
        )

        if top_recommendation.missing_skills:
            context_lines.append(
                "Missing Skills for Top Career: "
                f"{', '.join(top_recommendation.missing_skills)}"
            )
    else:
        context_lines.append(
            "No career recommendations are currently available."
        )

    # Roadmap context.
    if latest_roadmap:
        steps = list(latest_roadmap.steps or [])
        total_steps = len(steps)
        completed_steps = sum(
            1 for step in steps if step.is_completed
        )

        progress_percentage = (
            round((completed_steps / total_steps) * 100)
            if total_steps > 0
            else 0
        )

        context_lines.append(
            f"Latest Roadmap: {latest_roadmap.title}"
        )
        context_lines.append(
            "Roadmap Progress: "
            f"{progress_percentage}% "
            f"({completed_steps}/{total_steps} steps completed)"
        )

        incomplete_steps = [
            step.title
            for step in steps
            if not step.is_completed
        ]

        if incomplete_steps:
            context_lines.append(
                "Recommended Next Roadmap Steps: "
                f"{', '.join(incomplete_steps[:3])}"
            )
    else:
        context_lines.append("No career roadmap is currently available.")

    return "\n".join(context_lines)