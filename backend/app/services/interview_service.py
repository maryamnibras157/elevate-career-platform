from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from uuid import UUID
from datetime import datetime, timezone
from typing import List, Dict, Any

from app.models.interview import InterviewSession, InterviewQuestion, InterviewAnswer
from app.models.career import Career
from app.schemas.interview import InterviewSessionCreate, InterviewAnswerCreate
from app.services.ai.factory import get_ai_provider
from app.services.ai.context_builder import build_user_context

class InterviewService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.ai_provider = get_ai_provider()

    async def create_session(self, user_id: UUID, data: InterviewSessionCreate) -> InterviewSession:
        # Validate career if provided
        career_title = "General Tech"
        if data.career_id:
            result = await self.db.execute(select(Career).where(Career.id == data.career_id))
            career = result.scalars().first()
            if career:
                career_title = career.title
            else:
                data.career_id = None # Fallback if invalid
                
        session = InterviewSession(
            user_id=user_id,
            career_id=data.career_id,
            interview_type=data.interview_type,
            difficulty=data.difficulty,
            total_questions=data.num_questions
        )
        self.db.add(session)
        await self.db.flush() # To get session.id
        
        # Build context
        user_context = await build_user_context(self.db, str(user_id))
        
        # Generate questions
        try:
            questions_data = await self.ai_provider.generate_interview_questions(
                career_title=career_title,
                interview_type=data.interview_type,
                difficulty=data.difficulty,
                num_questions=data.num_questions,
                context=user_context
            )
        except Exception as e:
            await self.db.rollback()
            raise HTTPException(status_code=500, detail="Failed to generate interview questions")
            
        # Deduplicate using normalized text
        import re
        def normalize_text(text: str) -> str:
            return re.sub(r'\s+', ' ', text.strip().lower())

        seen_texts = set()
        unique_questions_data = []

        for q_data in questions_data:
            raw_text = q_data.get("question_text", "")
            if not raw_text:
                continue
            norm_text = normalize_text(raw_text)
            if norm_text not in seen_texts:
                seen_texts.add(norm_text)
                unique_questions_data.append(q_data)

        # If deduplication dropped some, pad with local fallback
        if len(unique_questions_data) < data.num_questions:
            from app.services.ai.local_provider import LocalProvider
            local_provider = LocalProvider()
            fallback_questions = await local_provider.generate_interview_questions(
                career_title=career_title,
                interview_type=data.interview_type,
                difficulty=data.difficulty,
                num_questions=data.num_questions * 2,  # Generate extra to ensure uniqueness
                context=""
            )
            for fq in fallback_questions:
                if len(unique_questions_data) >= data.num_questions:
                    break
                raw_text = fq.get("question_text", "")
                norm_text = normalize_text(raw_text)
                if norm_text not in seen_texts:
                    seen_texts.add(norm_text)
                    unique_questions_data.append(fq)
            
        for idx, q_data in enumerate(unique_questions_data[:data.num_questions]):
            question = InterviewQuestion(
                session_id=session.id,
                question_text=q_data.get("question_text", "Could you elaborate on your experience?"),
                question_type=q_data.get("question_type", "General"),
                category=q_data.get("category", "General"),
                difficulty=q_data.get("difficulty", data.difficulty),
                expected_topics=q_data.get("expected_topics", []),
                order=idx
            )
            self.db.add(question)
            
        await self.db.commit()
        await self.db.refresh(session)
        return await self.get_session(session.id, user_id)

    async def get_sessions(self, user_id: UUID) -> List[InterviewSession]:
        result = await self.db.execute(
            select(InterviewSession)
            .options(selectinload(InterviewSession.career))
            .where(InterviewSession.user_id == user_id)
            .order_by(desc(InterviewSession.created_at))
        )
        return result.scalars().all()

    async def get_session(self, session_id: UUID, user_id: UUID) -> InterviewSession:
        result = await self.db.execute(
            select(InterviewSession)
            .options(
                selectinload(InterviewSession.career),
                selectinload(InterviewSession.questions).selectinload(InterviewQuestion.answer)
            )
            .where(InterviewSession.id == session_id, InterviewSession.user_id == user_id)
        )
        session = result.scalars().first()
        if not session:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview session not found")
        # Sort questions by order
        session.questions = sorted(session.questions, key=lambda q: q.order)
        return session

    async def delete_session(self, session_id: UUID, user_id: UUID) -> None:
        session = await self.get_session(session_id, user_id)
        await self.db.delete(session)
        await self.db.commit()

    async def submit_answer(self, session_id: UUID, question_id: UUID, user_id: UUID, data: InterviewAnswerCreate) -> InterviewAnswer:
        session = await self.get_session(session_id, user_id)
        
        if session.status != "in_progress":
            raise HTTPException(status_code=400, detail="Cannot answer questions in a completed session")
            
        question = next((q for q in session.questions if q.id == question_id), None)
        if not question:
            raise HTTPException(status_code=404, detail="Question not found in this session")
            
        if question.answer:
            raise HTTPException(status_code=400, detail="Question already answered")
            
        # Evaluate answer
        try:
            evaluation = await self.ai_provider.evaluate_interview_answer(
                question=question.question_text,
                answer=data.answer_text,
                expected_topics=question.expected_topics or [],
                interview_type=session.interview_type
            )
        except Exception:
            # Fallback evaluation if AI fails temporarily
            evaluation = {
                "score": 50,
                "feedback": "Evaluation temporarily unavailable.",
                "strengths": [],
                "improvements": ["Please review core topics manually."],
                "suggested_answer": ""
            }
            
        answer = InterviewAnswer(
            question_id=question.id,
            user_id=user_id,
            answer_text=data.answer_text,
            score=evaluation.get("score"),
            feedback=evaluation.get("feedback"),
            strengths=evaluation.get("strengths"),
            improvements=evaluation.get("improvements"),
            suggested_answer=evaluation.get("suggested_answer"),
            evaluated_at=datetime.now(timezone.utc)
        )
        
        self.db.add(answer)
        await self.db.commit()
        await self.db.refresh(answer)
        return answer

    async def complete_session(self, session_id: UUID, user_id: UUID) -> InterviewSession:
        session = await self.get_session(session_id, user_id)
        
        if session.status == "completed":
            return session
            
        answers = [q.answer for q in session.questions if q.answer]
        answered_count = len(answers)
        
        if answered_count == 0:
            session.overall_score = 0
            session.status = "abandoned"
        else:
            total_score = sum((a.score or 0 for a in answers))
            session.overall_score = total_score // answered_count
            session.status = "completed"
            
            # Simple heuristic for recommendations/strengths based on answers
            all_strengths = []
            all_weaknesses = []
            for a in answers:
                if a.strengths: all_strengths.extend(a.strengths)
                if a.improvements: all_weaknesses.extend(a.improvements)
                
            session.strengths = list(set(all_strengths))[:5]
            session.weaknesses = list(set(all_weaknesses))[:5]
            session.recommendations = ["Review incorrect questions", "Practice the STAR method"]
            
        session.completed_at = datetime.now(timezone.utc)
        await self.db.commit()
        await self.db.refresh(session)
        return session

    async def get_summary(self, user_id: UUID) -> Dict[str, Any]:
        sessions = await self.get_sessions(user_id)
        completed = [s for s in sessions if s.status == "completed"]
        
        if not completed:
            return {
                "total_interviews": 0,
                "average_score": 0,
                "best_score": 0,
                "technical_score": 0,
                "behavioral_score": 0,
                "readiness_label": "Needs Preparation"
            }
            
        scores = [s.overall_score or 0 for s in completed]
        avg_score = sum(scores) / len(scores)
        best_score = max(scores)
        
        tech_sessions = [s for s in completed if s.interview_type in ["Technical", "Mixed"]]
        beh_sessions = [s for s in completed if s.interview_type in ["Behavioral", "Mixed"]]
        
        tech_score = sum((s.overall_score or 0 for s in tech_sessions)) / max(len(tech_sessions), 1)
        beh_score = sum((s.overall_score or 0 for s in beh_sessions)) / max(len(beh_sessions), 1)
        
        if avg_score >= 85: label = "Strong Candidate"
        elif avg_score >= 70: label = "Interview Ready"
        elif avg_score >= 50: label = "Developing"
        else: label = "Needs Preparation"
        
        return {
            "total_interviews": len(completed),
            "average_score": round(avg_score, 1),
            "best_score": best_score,
            "technical_score": round(tech_score, 1),
            "behavioral_score": round(beh_score, 1),
            "readiness_label": label
        }
