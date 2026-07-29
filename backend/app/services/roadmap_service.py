from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List
from uuid import UUID

from app.models.roadmap import Roadmap, RoadmapStep
from app.models.career import Career
from app.models.resume import ResumeAnalysis

class RoadmapService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_roadmaps(self, user_id: UUID) -> List[Roadmap]:
        result = await self.session.execute(
            select(Roadmap)
            .options(selectinload(Roadmap.steps))
            .filter(Roadmap.user_id == user_id)
            .order_by(Roadmap.created_at.desc())
        )
        return result.scalars().unique().all()

    async def generate_roadmap(self, user_id: UUID, career_id: UUID) -> Roadmap:
        # Fetch career and resume
        career_res = await self.session.execute(
            select(Career).options(selectinload(Career.skills)).filter(Career.id == career_id)
        )
        career = career_res.scalars().first()
        if not career:
            raise ValueError("Career not found")

        # Check if a roadmap already exists for this user and career
        existing = await self.session.execute(
        select(Roadmap)
        .options(selectinload(Roadmap.steps))
        .filter(
            Roadmap.user_id == user_id,
            Roadmap.career_id == career_id
            )
        )

        existing_roadmap = existing.scalars().first()

        if existing_roadmap:
            return existing_roadmap    
        
        

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
            
        career_skills = {s.name.lower() for s in career.skills} if career.skills else set()
        missing = list(career_skills.difference(user_skills))
        
        roadmap = Roadmap(
            user_id=user_id,
            career_id=career_id,
            title=f"{career.title} Mastery Roadmap",
            current_level="Beginner" if len(missing) > 3 else "Intermediate"
        )
        self.session.add(roadmap)
        await self.session.flush() # get ID
        
        # Generate Steps based on missing skills
        order = 1
        steps = []
        for skill in missing:
            # Beginner step
            steps.append(RoadmapStep(
                roadmap_id=roadmap.id,
                title=f"Learn Basics of {skill.title()}",
                description=f"Complete an introductory course on {skill.title()}.",
                level="Beginner",
                category="Course",
                estimated_duration="2 weeks",
                order=order
            ))
            order += 1
            
            # Intermediate step
            steps.append(RoadmapStep(
                roadmap_id=roadmap.id,
                title=f"Build a {skill.title()} Project",
                description=f"Apply your knowledge by building a practical project using {skill.title()}.",
                level="Intermediate",
                category="Project",
                estimated_duration="3 weeks",
                order=order
            ))
            order += 1
            
        if not missing:
            steps.append(RoadmapStep(
                roadmap_id=roadmap.id,
                title="Interview Preparation",
                description="You already have the core skills! Focus on interview prep and system design.",
                level="Advanced",
                category="Soft Skill",
                estimated_duration="2 weeks",
                order=1
            ))
            
        self.session.add_all(steps)
        await self.session.commit()
        await self.session.refresh(roadmap)
        
        # We need to reload roadmap with steps
        result = await self.session.execute(
            select(Roadmap)
            .options(selectinload(Roadmap.steps))
            .filter(Roadmap.id == roadmap.id)
        )
        return result.scalars().unique().first()

    async def update_step(self,user_id: UUID,step_id: UUID,is_completed: bool) -> RoadmapStep:

        result = await self.session.execute(
            select(RoadmapStep)
            .join(Roadmap)
            .filter(
            RoadmapStep.id == step_id,
            Roadmap.user_id == user_id
        )
        )

        step = result.scalars().first()

        if step is None:
            return None

        step.is_completed = is_completed

        await self.session.commit()
        await self.session.refresh(step)

        return step
