"""설정(Settings): .env 파일의 환경변수를 읽어 타입 검증하며 보관한다.

비밀번호·토큰 비밀키 같은 민감 정보를 코드에 직접 적지 않기 위해 .env에서만 읽는다.
"""

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# .env 위치를 backend/.env로 고정(절대경로).
# 이렇게 하면 어느 폴더에서 서버를 켜든 항상 같은 .env를 읽는다.
ENV_FILE = Path(__file__).resolve().parents[1] / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=ENV_FILE, env_file_encoding="utf-8", extra="ignore"
    )

    # DB 연결 주소 — 필수. .env에 없으면 시작 시 에러로 알려준다(조용한 폴백 방지).
    database_url: str
    # CORS 허용 출처(콤마 구분). 화면(프론트)에서 오는 요청만 허용
    cors_origins: str = "http://localhost:3000"

    # 로그인 토큰(JWT) 설정 — 비밀키는 필수(.env에서만)
    jwt_secret_key: str
    access_token_expire_minutes: int = 480  # 8시간


settings = Settings()
