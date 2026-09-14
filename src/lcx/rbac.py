"""RBAC (Rule 7). Real JWT auth via lcx.auth."""
import logging
from fastapi import Depends, HTTPException
from lcx.auth import get_current_user

logger = logging.getLogger("lcx.rbac")

def require(*allowed: str):
    def dep(user: dict = Depends(get_current_user)):
        user_role = user.get("role", "").lower()
        if user_role not in allowed:
            raise HTTPException(403, f"role '{user_role}' may not access this endpoint")
        return user
    return dep
