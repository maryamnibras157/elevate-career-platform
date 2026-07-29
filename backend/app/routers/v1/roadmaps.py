from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from app.database import get_async_session
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.roadmap import RoadmapResponse, RoadmapStepResponse, RoadmapStepUpdate
from app.schemas.common import APIResponse
from app.services.roadmap_service import RoadmapService
from fastapi import APIRouter, Depends, HTTPException

router = APIRouter(prefix="/roadmaps", tags=["Roadmaps"])

@router.get("", response_model=APIResponse[List[RoadmapResponse]], summary="Get my roadmaps")
async def get_roadmaps(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    service = RoadmapService(session)
    roadmaps = await service.get_roadmaps(current_user.id)
    return APIResponse(success=True, message="Roadmaps retrieved", data=[RoadmapResponse.model_validate(r) for r in roadmaps])

@router.post("/generate/{career_id}", response_model=APIResponse[RoadmapResponse], summary="Generate a roadmap")
async def generate_roadmap(
    career_id: UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    service = RoadmapService(session)
    roadmap = await service.generate_roadmap(current_user.id, career_id)
    return APIResponse(success=True, message="Roadmap generated", data=RoadmapResponse.model_validate(roadmap))

@router.patch(
    "/steps/{step_id}",
    response_model=APIResponse[RoadmapStepResponse],
    summary="Update roadmap step"
)
async def update_roadmap_step(
    step_id: UUID,
    data: RoadmapStepUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    service = RoadmapService(session)

    step = await service.update_step(
        current_user.id,
        step_id,
        data.is_completed
    )

    if step is None:
        raise HTTPException(
            status_code=404,
            detail="Roadmap step not found"
        )

    return APIResponse(
        success=True,
        message="Step updated",
        data=RoadmapStepResponse.model_validate(step)
    )