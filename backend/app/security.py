"""보안 유틸: 비밀번호 해시/검증 + 로그인 토큰(JWT) 생성/검증.

- 비밀번호는 pwdlib로 해시(평문 저장 금지)
- 로그인 성공 시 JWT(신분증) 발급, 보호된 요청에서 토큰을 검증해 현재 직원을 찾음
"""

from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pwdlib import PasswordHash
from pwdlib.hashers.bcrypt import BcryptHasher
from sqlmodel import Session

from .config import settings
from .database import get_session
from .models import Staff

# 비밀번호 해시기 — bcrypt 사용(우리가 설치한 pwdlib[bcrypt] 기준).
# (recommended()는 argon2를 기본으로 요구하므로 bcrypt를 명시적으로 지정)
password_hash = PasswordHash((BcryptHasher(),))

# 보호된 요청에서 Authorization: Bearer <token> 헤더에서 토큰을 꺼내는 도구
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

ALGORITHM = "HS256"


def hash_password(plain: str) -> str:
    """평문 비밀번호 → 저장용 해시."""
    return password_hash.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    """입력한 평문이 저장된 해시와 일치하는지."""
    return password_hash.verify(plain, hashed)


def create_access_token(sub: str) -> str:
    """직원 식별자(sub)를 담은 JWT 발급. 유효시간 포함."""
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    return jwt.encode(
        {"sub": sub, "exp": expire}, settings.jwt_secret_key, algorithm=ALGORITHM
    )


def authenticate_token(token: str | None, session: Session) -> Staff | None:
    """토큰 문자열 → 유효하면 직원(Staff), 아니면 None.

    예외를 던지지 않고 None을 반환하므로, HTTP(헤더)뿐 아니라
    WebSocket(쿼리 ?token=)처럼 직접 토큰을 받는 곳에서도 재사용한다.
    """
    if not token:
        return None
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[ALGORITHM])
        sub = payload.get("sub")
        if not sub:
            return None
        staff_id = int(sub)  # 토큰 sub에는 직원 고유번호(id)가 들어 있음
    except (jwt.PyJWTError, ValueError, TypeError):
        # 만료/위조/형식오류 등 어떤 경우든 인증 실패
        return None

    staff = session.get(Staff, staff_id)
    if staff is None or not staff.is_active:
        return None
    return staff


def authenticate_ws_token(token: str | None, session: Session) -> Staff | None:
    """WebSocket 연결용 토큰 검증(쿼리 ?token=). authenticate_token의 alias."""
    return authenticate_token(token, session)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_session),
) -> Staff:
    """토큰을 검증해 현재 로그인한 직원을 돌려준다(보호된 엔드포인트에서 사용).

    Story 1.4에서 라우트 보호에 본격 활용. 1.3에서는 /api/auth/me로 토큰 동작을 확인.
    """
    staff = authenticate_token(token, session)
    if staff is None:
        # 만료/위조/형식오류/없는 직원 등 → 일관되게 401
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="인증이 필요합니다",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return staff
