from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from app.database import get_async_session
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.recommendation import CareerRecommendationResponse
from app.schemas.common import APIResponse
from app.services.recommendation_service import RecommendationService

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

@router.get("", response_model=APIResponse[List[CareerRecommendationResponse]], summary="Get my recommendations")
async def get_recommendations(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    service = RecommendationService(session)
    recs = await service.get_recommendations(current_user.id)
    return APIResponse(success=True, message="Recommendations retrieved", data=[CareerRecommendationResponse.model_validate(r) for r in recs])

@router.post("/generate", response_model=APIResponse[List[CareerRecommendationResponse]], summary="Generate new recommendations")
async def generate_recommendations(
    profile_data: dict, # In real scenario, a Pydantic schema
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    service = RecommendationService(session)
    recs = await service.generate_recommendations(current_user.id, profile_data)
    return APIResponse(success=True, message="Recommendations generated", data=[CareerRecommendationResponse.model_validate(r) for r in recs])
