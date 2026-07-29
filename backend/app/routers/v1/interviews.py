from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_async_session
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.common import APIResponse
from app.schemas.interview import (
    InterviewAnswerCreate,
    InterviewAnswerResponse,
    InterviewSessionCreate,
    InterviewSessionDetailResponse,
    InterviewSessionResponse,
    InterviewSummaryResponse,
)
from app.services.interview_service import InterviewService

router = APIRouter(prefix="/interviews", tags=["Interview Prep"])


@router.post(
    "/sessions",
    response_model=APIResponse[InterviewSessionResponse],
    status_code=status.HTTP_201_CREATED,
)
async def create_session(
    data: InterviewSessionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
):
    service = InterviewService(db)
    interview_session = await service.create_session(current_user.id, data)

    return APIResponse(
        success=True,
        message="Interview session generated",
        data=interview_session,
    )


@router.get(
    "/sessions",
    response_model=APIResponse[List[InterviewSessionResponse]],
)
async def get_sessions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
):
    service = InterviewService(db)
    sessions = await service.get_sessions(current_user.id)

    return APIResponse(
        success=True,
        message="Interview sessions retrieved",
        data=sessions,
    )


@router.get(
    "/summary",
    response_model=APIResponse[InterviewSummaryResponse],
)
async def get_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
):
    service = InterviewService(db)
    summary = await service.get_summary(current_user.id)

    return APIResponse(
        success=True,
        message="Interview summary retrieved",
        data=summary,
    )


@router.get(
    "/sessions/{session_id}",
    response_model=APIResponse[InterviewSessionDetailResponse],
)
async def get_session(
    session_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
):
    service = InterviewService(db)
    interview_session = await service.get_session(
        session_id=session_id,
        user_id=current_user.id,
    )

    return APIResponse(
        success=True,
        message="Interview session retrieved",
        data=interview_session,
    )


@router.delete(
    "/sessions/{session_id}",
    response_model=APIResponse[None],
)
async def delete_session(
    session_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
):
    service = InterviewService(db)
    await service.delete_session(
        session_id=session_id,
        user_id=current_user.id,
    )

    return APIResponse(
        success=True,
        message="Interview session deleted",
        data=None,
    )


@router.post(
    "/sessions/{session_id}/answers",
    response_model=APIResponse[InterviewAnswerResponse],
)
async def submit_answer(
    session_id: UUID,
    data: InterviewAnswerCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
):
    service = InterviewService(db)

    answer = await service.submit_answer(
        session_id=session_id,
        question_id=data.question_id,
        user_id=current_user.id,
        data=data,
    )

    return APIResponse(
        success=True,
        message="Answer evaluated",
        data=answer,
    )


@router.post(
    "/sessions/{session_id}/complete",
    response_model=APIResponse[InterviewSessionResponse],
)
async def complete_session(
    session_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
):
    service = InterviewService(db)
    interview_session = await service.complete_session(
        session_id=session_id,
        user_id=current_user.id,
    )

    return APIResponse(
        success=True,
        message="Interview session completed",
        data=interview_session,
    )