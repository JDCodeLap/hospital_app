"""환자 안전 검사 유틸 (Epic 3).

핵심: 처방하려는 약(drug_name)이 환자의 알레르기/금기(allergies)와 충돌하는지 판단한다.
- 직접 일치: 알레르기 이름이 약 이름에 그대로 들어가면 충돌(예: '조영제' 알레르기 + '조영제 CT')
- 계열(class) 매칭: 같은 약 집안이면 이름이 달라도 충돌(예: '페니실린' 알레르기 + '아목시실린')

※ 데모 수준의 단순 매칭이다. 실제 약물-약물 상호작용(DDI) 엔진이나 외부 약품 DB는 범위 밖.
   (EXPERIENCE.md Flow ③ "페니실린 계열 처방" 시나리오를 만족시키는 것이 목표)
"""

# 알레르기 항목 → 충돌하는 약 이름 키워드(계열).
# 직접 일치는 이 표에 없어도 항상 검사하므로, 여기엔 '이름이 달라도 같은 집안'인 경우만 적는다.
CONTRAINDICATION_MAP: dict[str, list[str]] = {
    "페니실린": ["페니실린", "아목시실린", "암피실린", "오구멘틴", "피페라실린"],
    "아스피린": ["아스피린", "아세틸살리실산"],
    "설파제": ["설파", "박트림", "설파메톡사졸"],
    "조영제": ["조영제"],
}


def check_contraindications(allergies: str, drug_name: str) -> list[str]:
    """환자 알레르기와 처방 약 이름을 비교해 '충돌한 알레르기 항목' 목록을 돌려준다.

    Args:
        allergies: 환자의 알레르기(콤마 구분 문자열, 예: "아스피린,조영제"). 빈 문자열/None 안전.
        drug_name: 처방하려는 약 이름.

    Returns:
        충돌한 알레르기 항목 리스트(중복 제거, 원래 표기 유지). 충돌 없으면 빈 리스트.
    """
    drug = (drug_name or "").strip().lower()
    if not drug:
        return []

    hits: list[str] = []
    for raw in (allergies or "").split(","):
        term = raw.strip()
        if not term:
            continue
        low = term.lower()
        # 1) 직접 부분일치: 알레르기 이름이 약 이름 안에 그대로 들어감
        conflict = low in drug
        # 2) 계열 매칭: 같은 약 집안의 다른 이름인지 확인
        #    조회 키도 소문자(low)로 통일 → 직접일치와 같은 기준(라틴문자 표기도 일관 처리)
        if not conflict:
            for keyword in CONTRAINDICATION_MAP.get(low, []):
                if keyword.lower() in drug:
                    conflict = True
                    break
        if conflict and term not in hits:
            hits.append(term)
    return hits
