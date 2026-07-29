from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from uuid import UUID
from typing import Optional
from app.models.resume import ResumeAnalysis
from app.models.user import User
from app.admin.utils.pagination import PaginatedResponse, paginate
from app.admin.schemas.resume_stats.resume_stats import AdminResumeStatsFilterParams

class AdminResumeStatsRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_total_uploads(self) -> int:
        return (await self.session.execute(select(func.count()).select_from(ResumeAnalysis))).scalar() or 0

    async def get_average_scores(self) -> tuple[float, float]:
        stmt = select(
            func.avg(ResumeAnalysis.resume_score),
            func.avg(ResumeAnalysis.ats_score)
        )
        result = await self.session.execute(stmt)
        avg_res, avg_ats = result.first()
        return (avg_res or 0.0, avg_ats or 0.0)

    async def get_score_distribution(self) -> tuple[list[dict], list[dict]]:
        stmt_res = select(
            func.floor(ResumeAnalysis.resume_score / 10).label('bucket'),
            func.count().label('count')
        ).where(ResumeAnalysis.resume_score.isnot(None)).group_by('bucket').order_by('bucket')
        res_res = await self.session.execute(stmt_res)
        resume_dist = [{"range": f"{int(row.bucket)*10}-{int(row.bucket)*10+9}", "count": row.count} for row in res_res.all()]

        stmt_ats = select(
            func.floor(ResumeAnalysis.ats_score / 10).label('bucket'),
            func.count().label('count')
        ).where(ResumeAnalysis.ats_score.isnot(None)).group_by('bucket').order_by('bucket')
        ats_res = await self.session.execute(stmt_ats)
        ats_dist = [{"range": f"{int(row.bucket)*10}-{int(row.bucket)*10+9}", "count": row.count} for row in ats_res.all()]

        return resume_dist, ats_dist

    async def get_skill_gap_frequency(self) -> list[dict]:
        from app.models.recommendation import SkillGap
        stmt = select(SkillGap.missing_technologies)
        result = await self.session.execute(stmt)
        freq = {}
        for row in result.all():
            skills = row[0]
            if skills:
                for skill in skills:
                    freq[skill] = freq.get(skill, 0) + 1
        sorted_freq = sorted(freq.items(), key=lambda x: x[1], reverse=True)[:10]
        return [{"skill": k, "count": v} for k, v in sorted_freq]

    async def get_recommendation_categories(self) -> list[dict]:
        from app.models.recommendation import CareerRecommendation
        from app.models.career import Career
        stmt = select(Career.title, func.count(CareerRecommendation.id)).join(Career, CareerRecommendation.career_id == Career.id).group_by(Career.title).order_by(func.count(CareerRecommendation.id).desc()).limit(10)
        result = await self.session.execute(stmt)
        return [{"category": row[0], "count": row[1]} for row in result.all()]

    async def get_all_paginated(
        self, page: int, size: int, filters: AdminResumeStatsFilterParams
    ) -> PaginatedResponse[dict]:
        stmt = select(ResumeAnalysis, User).join(User, ResumeAnalysis.user_id == User.id)
        
        if filters.search:
            stmt = stmt.where(or_(
                User.full_name.ilike(f"%{filters.search}%"),
                User.email.ilike(f"%{filters.search}%")
            ))
        if filters.min_resume_score is not None:
            stmt = stmt.where(ResumeAnalysis.resume_score >= filters.min_resume_score)
        if filters.min_ats_score is not None:
            stmt = stmt.where(ResumeAnalysis.ats_score >= filters.min_ats_score)
            
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = (await self.session.execute(count_stmt)).scalar() or 0
        
        stmt = stmt.limit(size).offset((page - 1) * size).order_by(ResumeAnalysis.created_at.desc())
        results = (await self.session.execute(stmt)).all()
        
        items = []
        for analysis, user in results:
            item_dict = {
                "id": analysis.id,
                "user_id": analysis.user_id,
                "user_email": user.email,
                "user_name": user.full_name,
                "skills": analysis.skills,
                "education": analysis.education,
                "projects": analysis.projects,
                "experience": analysis.experience,
                "certifications": analysis.certifications,
                "resume_score": analysis.resume_score,
                "ats_score": analysis.ats_score,
                "strengths": analysis.strengths,
                "weaknesses": analysis.weaknesses,
                "missing_keywords": analysis.missing_keywords,
                "suggested_improvements": analysis.suggested_improvements,
                "created_at": analysis.created_at
            }
            items.append(item_dict)
            
        return paginate(items=items, total=total, page=page, size=size)

    async def get_by_id(self, analysis_id: UUID) -> Optional[dict]:
        stmt = select(ResumeAnalysis, User).join(User, ResumeAnalysis.user_id == User.id).where(ResumeAnalysis.id == analysis_id)
        result = (await self.session.execute(stmt)).first()
        if not result:
            return None
            
        analysis, user = result
        
        # Fetch related recommendations for this user
        from app.models.recommendation import CareerRecommendation
        from app.models.career import Career
        rec_stmt = select(CareerRecommendation, Career).join(Career, CareerRecommendation.career_id == Career.id).where(CareerRecommendation.user_id == user.id).order_by(CareerRecommendation.created_at.desc()).limit(5)
        rec_res = await self.session.execute(rec_stmt)
        recommendations = []
        for rec, career in rec_res.all():
            recommendations.append({
                "career_title": career.title,
                "match_percentage": rec.match_percentage,
                "confidence_score": rec.confidence_score,
                "why_matches": rec.why_matches
            })
            
        # Fetch related roadmaps for this user
        from app.models.roadmap import Roadmap
        rm_stmt = select(Roadmap, Career).join(Career, Roadmap.career_id == Career.id).where(Roadmap.user_id == user.id).order_by(Roadmap.created_at.desc()).limit(5)
        rm_res = await self.session.execute(rm_stmt)
        roadmaps = []
        for rm, career in rm_res.all():
            roadmaps.append({
                "title": rm.title,
                "career_title": career.title,
                "current_level": rm.current_level
            })
        
        return {
            "id": analysis.id,
            "user_id": analysis.user_id,
            "user_email": user.email,
            "user_name": user.full_name,
            "skills": analysis.skills,
            "education": analysis.education,
            "projects": analysis.projects,
            "experience": analysis.experience,
            "certifications": analysis.certifications,
            "resume_score": analysis.resume_score,
            "ats_score": analysis.ats_score,
            "strengths": analysis.strengths,
            "weaknesses": analysis.weaknesses,
            "missing_keywords": analysis.missing_keywords,
            "suggested_improvements": analysis.suggested_improvements,
            "created_at": analysis.created_at,
            "recommendations": recommendations,
            "roadmaps": roadmaps
        }

    async def delete(self, analysis_id: UUID) -> bool:
        stmt = select(ResumeAnalysis).where(ResumeAnalysis.id == analysis_id)
        analysis = (await self.session.execute(stmt)).scalar_one_or_none()
        if analysis:
            await self.session.delete(analysis)
            await self.session.commit()
            return True
        return False
