import asyncio
import sys
from uuid import uuid4

from app.database import async_session_maker
from app.models.career import Career, Skill
from app.models.roadmap import Roadmap, RoadmapStep

async def seed_data():
    async with async_session_maker() as session:
        # Check if skills exist
        skills = [
            Skill(name="Python", category="Language"),
            Skill(name="FastAPI", category="Framework"),
            Skill(name="React", category="Framework"),
            Skill(name="Docker", category="Tool"),
            Skill(name="Kubernetes", category="Tool"),
            Skill(name="AWS", category="Cloud"),
            Skill(name="SQL", category="Database"),
            Skill(name="JavaScript", category="Language"),
            Skill(name="TypeScript", category="Language"),
            Skill(name="Machine Learning", category="Domain"),
            Skill(name="Data Analysis", category="Domain"),
            Skill(name="Project Management", category="Soft Skill")
        ]
        
        session.add_all(skills)
        await session.commit()
        
        # Reload skills to get IDs
        for skill in skills:
            await session.refresh(skill)
            
        skill_dict = {s.name: s for s in skills}

        # Careers
        c1 = Career(
            title="Software Engineer",
            description="Design, develop, and maintain software systems.",
            salary_estimate="$100,000 - $150,000",
            demand_level="High",
            growth_outlook="22% (Much faster than average)"
        )
        c1.skills = [skill_dict["Python"], skill_dict["JavaScript"], skill_dict["React"], skill_dict["SQL"], skill_dict["Docker"]]
        
        c2 = Career(
            title="Data Scientist",
            description="Analyze and interpret complex digital data.",
            salary_estimate="$110,000 - $160,000",
            demand_level="High",
            growth_outlook="36% (Much faster than average)"
        )
        c2.skills = [skill_dict["Python"], skill_dict["SQL"], skill_dict["Machine Learning"], skill_dict["Data Analysis"]]
        
        c3 = Career(
            title="DevOps Engineer",
            description="Bridge the gap between development and operations.",
            salary_estimate="$115,000 - $155,000",
            demand_level="High",
            growth_outlook="21% (Much faster than average)"
        )
        c3.skills = [skill_dict["Python"], skill_dict["Docker"], skill_dict["Kubernetes"], skill_dict["AWS"]]

        session.add_all([c1, c2, c3])
        await session.commit()
        
        print("Database seeded successfully with Careers and Skills.")

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(seed_data())
