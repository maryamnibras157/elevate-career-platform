import io
import re
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Dict, Any
from uuid import UUID
import PyPDF2
from docx import Document
from loguru import logger

from app.models.resume import ResumeAnalysis
from app.models.career import Skill

class ResumeService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_latest_analysis(self, user_id: UUID) -> ResumeAnalysis:
        result = await self.session.execute(
            select(ResumeAnalysis)
            .filter(ResumeAnalysis.user_id == user_id)
            .order_by(ResumeAnalysis.created_at.desc())
            .limit(1)
        )
        return result.scalars().first()

    def _extract_text(self, content: bytes, filename: str) -> str:
        text = ""
        filename_lower = filename.lower()
        
        try:
            if filename_lower.endswith('.pdf'):
                reader = PyPDF2.PdfReader(io.BytesIO(content))
                for page in reader.pages:
                    text += page.extract_text() + "\n"
            elif filename_lower.endswith('.docx'):
                doc = Document(io.BytesIO(content))
                for para in doc.paragraphs:
                    text += para.text + "\n"
            else:
                text = content.decode('utf-8', errors='ignore')
        except Exception as e:
            logger.error(f"Error parsing resume: {e}")
            text = content.decode('utf-8', errors='ignore')
            
        return text

    async def analyze_resume(self, user_id: UUID, content: bytes, filename: str) -> ResumeAnalysis:
        # Extract text from file
        text = self._extract_text(content, filename)
        text_lower = text.lower()
        
        # 1. Fetch known skills from DB
        skills_result = await self.session.execute(select(Skill))
        db_skills = skills_result.scalars().all()
        
        # 2. Extract found skills
        found_skills = []
        for s in db_skills:
            # simple word boundary check
            pattern = r'\b' + re.escape(s.name.lower()) + r'\b'
            if re.search(pattern, text_lower):
                found_skills.append(s.name)

        # 3. Basic section detection
        has_education = bool(re.search(r'\b(education|university|college|bachelor|master|degree)\b', text_lower))
        has_experience = bool(re.search(r'\b(experience|work|employment|job|career)\b', text_lower))
        has_projects = bool(re.search(r'\b(projects|portfolio)\b', text_lower))
        
        # 4. Email / Phone extraction
        email_match = re.search(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', text)
        phone_match = re.search(r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)

        has_contact_info = bool(email_match or phone_match)

        # 5. Scoring Logic
        # Contact Info: 10 pts
        # Education: 20 pts
        # Experience: 30 pts
        # Projects: 10 pts
        # Skills: Up to 30 pts (3 pts per skill, max 10 skills)
        score = 0
        if has_contact_info: score += 10
        if has_education: score += 20
        if has_experience: score += 30
        if has_projects: score += 10
        
        skill_score = min(len(found_skills) * 3, 30)
        score += skill_score
        
        # Generative Feedback (Rule based)
        strengths = []
        weaknesses = []
        improvements = []
        
        if skill_score >= 20:
            strengths.append("Strong technical skill set detected.")
        else:
            weaknesses.append("Very few recognizable skills found.")
            improvements.append("Add a dedicated 'Skills' section with comma-separated keywords.")
            
        if has_experience:
            strengths.append("Professional experience section identified.")
        else:
            weaknesses.append("Missing professional experience.")
            improvements.append("Detail your work history or substantial internships.")
            
        if has_education:
            strengths.append("Education background identified.")
        else:
            weaknesses.append("No clear education section.")
            
        if not has_contact_info:
            improvements.append("Ensure your email and phone number are clearly listed at the top.")

        # Missing standard keywords (just an example of common tech keywords)
        standard_tech_keywords = ["git", "agile", "teamwork", "leadership"]
        missing_keywords = [k for k in standard_tech_keywords if k not in text_lower]

        analysis = ResumeAnalysis(
            user_id=user_id,
            skills=found_skills,
            education=[{"found": True}] if has_education else [],
            experience=[{"found": True}] if has_experience else [],
            projects=[{"found": True}] if has_projects else [],
            resume_score=float(score),
            ats_score=float(score - 5) if score > 5 else float(score), # simplistic ats deduction for formatting risks
            strengths=strengths,
            weaknesses=weaknesses,
            missing_keywords=missing_keywords,
            suggested_improvements=improvements
        )
        
        self.session.add(analysis)
        await self.session.commit()
        await self.session.refresh(analysis)
        return analysis
