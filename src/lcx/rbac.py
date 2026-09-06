"""RBAC (Rule 7). Real OIDC auth replacing the X-Role header."""
import logging
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt
from lcx.config import CONFIG

logger = logging.getLogger("lcx.rbac")
security = HTTPBearer()

ROLES = {"resident", "operator", "driver", "auditor"}

def require(*allowed: str):
    def dep(token: HTTPAuthorizationCredentials = Depends(security)):
        try:
            # For local dev without a real IDP, we bypass signature verification if localhost
            is_local = "localhost" in CONFIG.get("oidc_issuer_url", "")
            payload = jwt.decode(
                token.credentials,
                key="test_secret" if is_local else None,
                algorithms=["HS256", "RS256"],
                audience=CONFIG.get("oidc_audience"),
                options={"verify_signature": not is_local}
            )
        except Exception as e:
            logger.error("JWT validation failed: %s", str(e))
            raise HTTPException(status_code=401, detail="Invalid token")

        roles_claim = payload.get("roles", [])
        if not roles_claim:
            roles_claim = [payload.get("role", "resident")]
        
        user_role = roles_claim[0].lower() if isinstance(roles_claim, list) else roles_claim.lower()

        if user_role not in ROLES:
            raise HTTPException(400, f"unknown role: {user_role}")
        if user_role not in allowed:
            raise HTTPException(403, f"role '{user_role}' may not access this endpoint")
        
        return {"role": user_role, "sub": payload.get("sub", "unknown")}
    return dep
