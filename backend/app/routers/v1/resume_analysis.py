from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from app.database import get_async_session
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.resume import ResumeAnalysisResponse
from app.schemas.common import APIResponse
from app.services.resume_service import ResumeService

router = APIRouter(prefix="/resume-analysis", tags=["Resume Analysis"])

@router.get("/latest", response_model=APIResponse[ResumeAnalysisResponse], summary="Get latest resume analysis")
async def get_latest_analysis(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    service = ResumeService(session)
    analysis = await service.get_latest_analysis(current_user.id)
    if not analysis:
        return APIResponse(success=True, message="No analysis found", data=None)
    return APIResponse(success=True, message="Analysis retrieved", data=ResumeAnalysisResponse.model_validate(analysis))

@router.post("/upload", response_model=APIResponse[ResumeAnalysisResponse], summary="Upload and analyze resume")
async def analyze_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    content = await file.read()
    
    service = ResumeService(session)
    analysis = await service.analyze_resume(current_user.id, content, file.filename or "unknown.txt")
    return APIResponse(success=True, message="Resume analyzed", data=ResumeAnalysisResponse.model_validate(analysis))
