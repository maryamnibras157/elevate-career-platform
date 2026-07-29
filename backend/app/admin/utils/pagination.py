from typing import TypeVar, Generic, List
from pydantic import BaseModel

T = TypeVar("T")

class PaginatedResponse(BaseModel, Generic[T]):
    model_config = {"arbitrary_types_allowed": True}
    
    items: List[T]
    total: int
    page: int
    size: int
    pages: int

def paginate(items: List[T], total: int, page: int, size: int) -> PaginatedResponse[T]:
    pages = (total + size - 1) // size if size > 0 else 0
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        size=size,
        pages=pages
    )
