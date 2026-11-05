import hmac
import base64
import json
import time
from typing import Optional, Dict, Any
from fastapi import HTTPException, Security, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from backend.config import SECRET_KEY
from backend.database import get_db

security_bearer = HTTPBearer(auto_error=False)

def create_access_token(data: Dict[str, Any], expires_in: int = 86400 * 30) -> str:
    """Creates a cryptographically signed URL-safe session token without external jwt dependency."""
    payload = data.copy()
    payload["exp"] = int(time.time()) + expires_in
    json_bytes = json.dumps(payload, separators=(',', ':')).encode('utf-8')
    encoded_payload = base64.urlsafe_b64encode(json_bytes).decode('utf-8').rstrip('=')
    
    signature = hmac.new(
        SECRET_KEY.encode('utf-8'),
        encoded_payload.encode('utf-8'),
        digestmod='sha256'
    ).digest()
    encoded_signature = base64.urlsafe_b64encode(signature).decode('utf-8').rstrip('=')
    
    return f"{encoded_payload}.{encoded_signature}"

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        parts = token.split('.')
        if len(parts) != 2:
            return None
        encoded_payload, encoded_sig = parts
        
        # Verify signature
        expected_sig = hmac.new(
            SECRET_KEY.encode('utf-8'),
            encoded_payload.encode('utf-8'),
            digestmod='sha256'
        ).digest()
        actual_sig = base64.urlsafe_b64decode(encoded_sig + '=' * (-len(encoded_sig) % 4))
        
        if not hmac.compare_digest(expected_sig, actual_sig):
            return None
            
        payload_bytes = base64.urlsafe_b64decode(encoded_payload + '=' * (-len(encoded_payload) % 4))
        payload = json.loads(payload_bytes.decode('utf-8'))
        
        if payload.get("exp") and time.time() > payload["exp"]:
            return None # Expired
            
        return payload
    except Exception:
        return None

def sanitize_user(user_row: Dict[str, Any]) -> Dict[str, Any]:
    safe = dict(user_row)
    safe.pop("password_hash", None)
    safe.pop("salt", None)
    return safe

def get_current_user_optional(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)) -> Optional[Dict[str, Any]]:
    if not credentials:
        return None
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        return None
    user_id = payload["sub"]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        row = cursor.fetchone()
        if not row:
            return None
        return sanitize_user(dict(row))

def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)) -> Dict[str, Any]:
    user = get_current_user_optional(credentials)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in or register with your mobile number.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

def get_current_admin(user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    if user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative privileges required to access this resource."
        )
    return user

def get_current_expert_or_admin(user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    if user.get("role") not in ("expert", "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Agricultural Expert or Administrator privileges required."
        )
    return user
