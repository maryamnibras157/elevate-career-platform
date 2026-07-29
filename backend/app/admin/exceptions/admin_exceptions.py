from fastapi import HTTPException, status

class AdminException(HTTPException):
    def __init__(self, detail: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        super().__init__(status_code=status_code, detail=detail)

class PermissionDeniedException(AdminException):
    def __init__(self, detail: str = "Permission denied"):
        super().__init__(detail=detail, status_code=status.HTTP_403_FORBIDDEN)

class InvalidAdminOperationException(AdminException):
    def __init__(self, detail: str = "Invalid admin operation"):
        super().__init__(detail=detail, status_code=status.HTTP_400_BAD_REQUEST)

class ResourceLockedException(AdminException):
    def __init__(self, detail: str = "Resource is locked"):
        super().__init__(detail=detail, status_code=status.HTTP_409_CONFLICT)

class AdminValidationException(AdminException):
    def __init__(self, detail: str = "Validation failed"):
        super().__init__(detail=detail, status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)
