"""데이터베이스 연결.

- engine: PostgreSQL 창고로 통하는 "연결 통로"
- init_db(): 모델에 정의된 테이블을 (없으면) 만든다
- get_session(): 요청마다 짧게 쓰고 닫는 작업용 세션을 제공
"""

from collections.abc import Generator

from sqlmodel import Session, SQLModel, create_engine

from .config import settings

# pool_pre_ping: 꺼냈던 연결이 살아있는지 먼저 확인 → DB가 잠깐 쉬었다 깨어나도 첫 요청 실패 방지
engine = create_engine(settings.database_url, echo=False, pool_pre_ping=True)


def init_db() -> None:
    """모델로 정의된 테이블을 생성한다(이미 있으면 그대로 둠)."""
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """요청 1건 동안 쓰는 DB 세션. 끝나면 자동으로 닫힌다(연결 누수 방지)."""
    with Session(engine) as session:
        yield session
