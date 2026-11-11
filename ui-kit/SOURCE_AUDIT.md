# 원본 → 재사용 키트 이식 감사표

## 범위

이전 수업 예시는 일부 공통 부품만 사용했습니다. 원본 전체 이식 완료 상태가 아니었습니다. 이번에는 메인 웹과 결제 웹의 재사용 가능한 시각 표현을 **35개 시연 단위**로 묶었습니다. 35는 원본 함수나 파일의 총개수가 아닙니다. 일부는 원본 경로를 그대로 추출했고, 일부는 데이터 독립 API로 일반화했으며, 접근성과 정리 동작을 확장했습니다.

검토 원본: `web/index.html`, `web/details.css`, `web/pay/app.js`, `web/pay/styles.css`, `logo.svg`, `favicon.svg`, `og.png`. 기준 원본 커밋: `cb7c7bdb9808f19e463290d566c4a1551cf62b97`. 정확한 파일 해시, CSS keyframe 위치, 직접 `.animate()` 호출 위치는 `source-inventory.json`에 자동 기록합니다. A/E 래퍼로 실행되는 모든 효과가 직접 호출 집계와 일치하는 것은 아닙니다.

## 시연별 추적

| ID | 표현 | 원본 근거 | 처리 |
|---|---|---|---|
| rise | 카드 등장·분담 블록 | index.html:532,1139,1812 | API 이식 |
| springs | snap/pop/soft | index.html:516–532 | snap·soft 유지, pop 감쇠 15→24로 조정 |
| typing | 입력 중 점·대화 등장 | index.html:164–169,1121 | API·예시 조합 |
| spinner | 계산 중 회전 | index.html:70–71 | API 이식 |
| island | 펼쳐지는 상태 알림 | index.html:626–645 | 아이콘·부제·상태 API |
| odometer | 자리별 숫자 롤링 | index.html:594–611 | 접근성 보강 |
| headline | 글자별 제목 등장 | index.html:615–623 | 접근성 보강 |
| count | 큰 수 → 결과 개수 | index.html:1269–1275 | 프리셋 조합 |
| chip | 구절에서 날아오는 칩 | index.html:1240–1253 | 위치 독립 API |
| list | 추가·삭제·재배치 | index.html:790–865 | keyed FLIP 일반화 |
| exit | 기울어지며 퇴장 | index.html:859–863 | 프리셋 |
| glow | 새 카드·시각 강조 | index.html:852,856 | 프리셋 |
| flicker | 후보 연결선 탐색 | index.html:736–746 | 스코프 기반 예시 |
| path | 경로 그리기·이동점 | index.html:747–786 | 임의 SVG 경로 API |
| pulse | 핀 파동·예약 박동 | index.html:205–206,1863 | 프리셋 |
| ring | 원형 글자 회전 | index.html:prod .ring | 원본 스타일을 부품화 |
| venn | 두 원의 합의·체크 | index.html:1757–1760,1796–1804 | 원본 에셋·모션 조합 |
| logo | 원본 로고 등장 | details.css:brand-enter | SVG 추출·모션 조합 |
| shake | 문제 상황 흔들림 | index.html:1861; pay/app.js:302 | 프리셋 |
| stamp | 승인·중단 도장 | pay/styles.css:221–225,291–294 | 프리셋, STOP 시연 |
| hold | 길게 눌러 확인 | pay/app.js:101–121 | 취소·키보드 처리 보강 |
| fill | 진행률·판단 막대 | index.html:ci; pay/styles.css:285 | 공통 width 애니메이션 |
| blur | 이야기·보조문구 | index.html:1958,2016 | 프리셋 |
| sheet | 상세·중첩 시트 | index.html:887–932 | 포커스·드래그·스택 보강 |
| page | 앞·뒤 화면 이동 | index.html:1993–2016 | 공통 CardFlow |
| logs | 로그 등장·패널 | index.html:647–665,2089–2101 | 공통 모션·예시 조합 |
| cards | 맞물림·알약·라벨 | index.html:115–152 | CSS 부품 |
| switch | 토글·선택 상태 | index.html:hid .sw; .slot | ARIA 상태 보강 |
| avatars | 겹친 아바타 | index.html:.av, .av-stack | CSS 부품 |
| icons | 메인15+결제8 | index.html:IC; pay/app.js:icon | 원본 SVG 경로 추출 |
| status | 통신·Wi-Fi·배터리3 | index.html:sb svg | 원본 SVG 추출 |
| qr | QR·마지막 장 | index.html:1917–1942 | 외부 CDN 의존 제거 |
| keyboard | 폼·안전 영역 | index.html:openTry viewport | visualViewport·Tabbable |
| hatch | 고정·경고·비활성 | index.html:.stop.lock, .stop.crowd | CSS 상태 |
| tokens | 색상·서체 | index.html:17–29 | 누락 색 토큰 보강 |

표의 경로는 `web/` 기준입니다. 실제 갤러리 정의와 API 이름은 `catalog.js`가 기준입니다.

## 에셋

메인 SVG15 + 결제 SVG8 + 상태표시 SVG3 = **26개**를 원본 경로 그대로 추출했습니다. `logoMark`, `logo.svg`, `favicon.svg`는 별도의 opt-in 참조 자산입니다. 새 프로그램에 원본 브랜드를 자동 강제하지 않습니다.

도로/공원 벡터 좌표는 샘플임을 명시한 별도 데이터로 보존합니다. 지도 API나 실관광 데이터 제공 기능이 아닙니다. `butter`, `leaf`, `red`, `violet` 등 원본 색상도 추가합니다. Pretendard·Inter Tight 지정은 유지하되 폰트 바이너리는 포함하지 않습니다.

## 의도적으로 넣지 않은 것

| 항목 | 이유 |
|---|---|
| 여행 최적화, 상품 조회, 실결제 엔진, 사용자 정보 | 공통 UI가 아닌 업무 로직. 원본 폴더에 유지. |
| 고정된 여행 일정과 전체 대화 시나리오 | 새 예시는 독립 콘텐츠로 생성. 짧은 시연 예문만 사용. |
| OG 이미지, 제출 스크린샷, 녹화 영상 | 홍보·증빙 파일이며 런타임 부품이 아님. 원본 위치에 보존. |
| 폰트 바이너리 | 키트에 복제하지 않음. CSS 링크와 시스템 대체 글꼴 사용. |
| vooy의 별도 메신저 서비스 화면 | 이번 메인·결제 UI 감사 범위 밖. 원본 폴더 보존. |

따라서 저장소의 모든 파일·기능을 복제했다거나 모든 표현을 픽셀 단위로 동일하게 재현했다고 주장하지 않습니다. 검토·이식·제외 범위를 위처럼 명시합니다.

## 검증과 권리

기존 수업 회귀 테스트와 새 갤러리 테스트를 함께 실행합니다. 35개 시연을 열고 재생·닫은 뒤 MotionScope가 남지 않는지, 중첩 시트의 배경과 포커스가 복원되는지 검사합니다. 테스트 숫자는 CI JSON 리포트를 기준으로 하며 iPhone 실기기·VoiceOver 인증을 의미하지 않습니다.

외부 코드의 실제 이식과 설계 참고는 `THIRD_PARTY_NOTICES.md`에 구분합니다. 원본 TripFit의 기존 출처와 권리는 유지하며, 외부 MIT 라이선스로 원본 전체를 재라이선스하지 않습니다.
