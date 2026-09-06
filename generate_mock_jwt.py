import sys
from jose import jwt
from datetime import datetime, timedelta, timezone

def generate_token(role: str, sub: str = "local-tester"):
    payload = {
        "sub": sub,
        "roles": [role],
        "aud": "lcx-api",
        "exp": datetime.now(timezone.utc) + timedelta(hours=1)
    }
    # For local test, we use the HS256 secret matched in rbac.py
    token = jwt.encode(payload, "test_secret", algorithm="HS256")
    return token

if __name__ == "__main__":
    role = sys.argv[1] if len(sys.argv) > 1 else "resident"
    token = generate_token(role)
    print(f"\nRole: {role}\nToken:\n{token}\n")
    print(f"Use in curl:\n  -H 'Authorization: Bearer {token}'\n")
