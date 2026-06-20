"""실시간(WebSocket) 연결 관리.

역할: "환자별 방"을 만들어, 그 환자 화면을 보고 있는 클라이언트(WebSocket)들을 모아둔다.
누군가 그 환자 정보를 바꾸면 같은 방의 모든 클라이언트에게 "다시 불러와" 신호를 쏜다(broadcast).
- WS로 환자 데이터 자체를 보내지 않는다 → 신호만 보내고, 데이터는 보호된 GET /api/patients/{id}에서.
- Story 2.4(FR3/NFR4). 이후 Epic 3·4의 실제 쓰기도 broadcast()를 호출해 재사용.
"""

from fastapi import WebSocket


class ConnectionManager:
    """환자 id별로 구독 중인 WebSocket들을 관리한다."""

    def __init__(self) -> None:
        # { 환자id: {그 환자를 보고 있는 WebSocket들} }
        self.rooms: dict[int, set[WebSocket]] = {}

    async def connect(self, patient_id: int, ws: WebSocket) -> None:
        """연결 수락 후 해당 환자 방에 등록."""
        await ws.accept()
        self.rooms.setdefault(patient_id, set()).add(ws)

    def disconnect(self, patient_id: int, ws: WebSocket) -> None:
        """방에서 제거. 방이 비면 정리(메모리 누수 방지)."""
        room = self.rooms.get(patient_id)
        if room:
            room.discard(ws)
            if not room:
                self.rooms.pop(patient_id, None)

    async def broadcast(self, patient_id: int, message: dict) -> None:
        """그 환자 방의 모든 구독자에게 JSON 신호를 보낸다(죽은 연결은 정리)."""
        for ws in list(self.rooms.get(patient_id, set())):
            try:
                await ws.send_json(message)
            except Exception:
                # 이미 끊긴 연결 등 → 조용히 방에서 제거
                self.disconnect(patient_id, ws)


# 앱 전체에서 공유하는 단일 관리자
manager = ConnectionManager()
