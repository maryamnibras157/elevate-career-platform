from typing import Any, Dict

def success_response(data: Any, message: str = "Success") -> Dict[str, Any]:
    return {
        "success": True,
        "message": message,
        "data": data
    }

def error_response(message: str, code: str = "ERROR") -> Dict[str, Any]:
    return {
        "success": False,
        "message": message,
        "code": code
    }
