from pydantic import BaseModel, ConfigDict
from app.models.user import User
from app.admin.constants.enums import AdminRole, Permission

class AdminContext(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    user: User
    role: AdminRole
    permissions: list[Permission]

    @property
    def admin_id(self) -> str:
        return str(self.user.id)
