from app.admin.core.logging import admin_logger
from app.admin.repositories.base import BaseAdminRepository
from typing import Generic, TypeVar

RepositoryType = TypeVar("RepositoryType", bound=BaseAdminRepository)

class BaseAdminService(Generic[RepositoryType]):
    def __init__(self, repository: RepositoryType):
        self.repository = repository
        self.logger = admin_logger
