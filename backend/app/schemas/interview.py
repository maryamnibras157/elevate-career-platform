from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.career import CareerResponse


# -----------------------------
# Requests
# -----------------------------

class InterviewSessionCreate(BaseModel):
    career_id: Optional[UUID] = None
    interview_type: str = Field(
        ...,
        description="Behavioral, Technical, Mixed",
    )
    difficulty: str = Field(
        ...,
        description="Beginner, Intermediate, Advanced",
    )
    num_questions: int = Field(default=5, ge=1, le=10)


class InterviewAnswerCreate(BaseModel):
    question_id: UUID
    answer_text: str = Field(..., min_length=1, max_length=5000)


# -----------------------------
# Responses
# -----------------------------

class InterviewAnswerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    question_id: UUID
    answer_text: str
    score: Optional[int] = None
    feedback: Optional[str] = None
    strengths: Optional[List[str]] = None
    improvements: Optional[List[str]] = None
    suggested_answer: Optional[str] = None
    evaluated_at: Optional[datetime] = None


class InterviewQuestionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    session_id: UUID
    question_text: str
    question_type: str
    category: Optional[str] = None
    difficulty: Optional[str] = None
    order: int
    answer: Optional[InterviewAnswerResponse] = None


class InterviewSessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    career_id: Optional[UUID] = None
    career: Optional[CareerResponse] = None
    interview_type: str
    difficulty: str
    status: str
    total_questions: int
    overall_score: Optional[int] = None
    strengths: Optional[List[str]] = None
    weaknesses: Optional[List[str]] = None
    recommendations: Optional[List[str]] = None
    started_at: datetime
    completed_at: Optional[datetime] = None


class InterviewSessionDetailResponse(InterviewSessionResponse):
    questions: List[InterviewQuestionResponse] = Field(default_factory=list)


class InterviewSummaryResponse(BaseModel):
    total_interviews: int
    average_score: float
    best_score: int
    technical_score: float
    behavioral_score: float
    readiness_label: str