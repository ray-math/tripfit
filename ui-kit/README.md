# TripFit reusable UI kit

TripFit의 **디자인과 모션은 유지하면서, 내용과 화면 구성을 새로 조립**하는 실험적 키트입니다. 작업 브랜치는 `high`이며 `main`과 원본 `web/`는 변경하지 않습니다. 원본 여행 앱을 iframe으로 넣거나 그 페이지로 이동시키는 구현이 아닙니다.

## 두 가지 실제 실행 예시

- `examples/gallery.html` / `dist/gallery.html`: 모션·부품·에셋 **35개 시연 단위**. 검색, 종류별 필터, 다시 재생, 움직임 줄이기.
- `examples/regenerated.html` / `dist/lesson.html`: 같은 키트로 조립한 별도의 수학 수업. 설명, 그래프 조작, 문제 선택, 결과 화면.

모바일에서는 전체 브라우저 영역에 맞추고, 넓은 화면에서는 원본 비율의 아이폰 목업을 사용합니다. 링크의 갤러리 하단 버튼으로 수업 예시도 열 수 있습니다.

## 이번 확장

이전 버전은 수업 예시에 필요한 일부 부품만 가져왔습니다. 이번에는 예시에 없던 칩 비행, FLIP 목록 재배치와 퇴장, 경로 그리기와 이동점, 원형 텍스트, 합의 심벌, 중단 도장, 길게 누르기 등을 공통 모듈/갤러리 조합으로 추가했습니다.

원본 메인 SVG 아이콘 15개, 결제 SVG 아이콘 8개, 상태표시 SVG 3개를 합쳐 **26개**의 경로를 추출했습니다. 로고·파비콘과 샘플 지도 좌표도 별도 이름으로 보존합니다. 새 프로그램의 브랜드로 강제하지 않습니다.

**35는 갤러리 시연 단위의 개수이지, 원본 저장소 전체의 모든 기능을 복제했다는 수치가 아닙니다.** `SOURCE_AUDIT.md`에서 이식·추출·제외 범위를 구분합니다.

## 모듈

| 파일 | 역할 |
|---|---|
| `compose.js`, `flow.js` | 공통 셸, 자유로운 카드 조립, 단계 이동 |
| `tripfit-motion.js` | 스프링, 숫자 롤링, 글자별 등장, 상태 아일랜드 |
| `effects.js` | 취소·정리 가능한 모션 범위, FLIP 목록, 경로, 칩 비행, 길게 누르기 |
| `tripfit-sheet.js` | 임의 DOM 상세 화면, 중첩 시트, 포커스 관리, 드래그, 키보드 영역 |
| `assets.js`, `original-assets.js` | 원본 SVG와 오프라인 QR |
| `catalog.js` | 시연 목록, 공통 API, 원본 위치 |
| `vendor/` | 고정 버전의 Tabbable·raf-schd·QRCode.js와 전체 라이선스 |
| `theme.css`, `tripfit-details.css`, `presentation.css`, `gallery.css` | 원본 팔레트·맞물림·타이포·프레임과 추가 부품 |

브라우저 런타임은 바닐라 JavaScript입니다. React 같은 프레임워크는 필요하지 않지만, 더 이상 '외부 코드가 전혀 없는 키트'라고 표현하지 않습니다. 실제 도입한 외부 코드는 `THIRD_PARTY_NOTICES.md`와 해시 목록에 기록합니다.

## 실행과 검증

```sh
python3 -m http.server 8000
# http://localhost:8000/ui-kit/examples/gallery.html
# http://localhost:8000/ui-kit/examples/regenerated.html

# 원본/외부 의존성 갱신 시에만 실행. 배포본 실행에는 불필요.
python ui-kit/scripts/vendor_sources.py
python ui-kit/scripts/extract_assets.py
node --test ui-kit/tests/*.test.mjs
python ui-kit/build_preview.py
python ui-kit/tests/catalog.spec.py --browser chromium
python ui-kit/tests/catalog.spec.py --browser webkit
python ui-kit/tests/regenerated.spec.py --browser chromium
python ui-kit/tests/regenerated.spec.py --browser webkit
```

`dist`는 실제 모듈들을 자동 번들링한 결과물입니다. 별도로 복사해 유지하는 가짜 예시가 아니며 입력 소스와 출력 SHA-256을 남깁니다. 외부 폰트가 실패하면 시스템 폰트로 표시됩니다. 폰트 바이너리는 포함하지 않습니다.

## 문서와 출처

- [원본 이식 감사표](SOURCE_AUDIT.md)
- [새 앱을 조립하는 AI/개발 지침](AI_GUIDE.md)
- [외부 코드·참고 자료·라이선스](THIRD_PARTY_NOTICES.md)
- [기존 수업 재생성 구조](REGENERATED.md)

원본 TripFit은 `harheem/tripfit`입니다. 이 포크에서 추출·변형한 원본 부품에 별도의 새로운 라이선스를 부여하지 않습니다. 외부 의존성의 MIT 라이선스가 원본 프로젝트 전체로 확대되지 않습니다. 다른 제품으로 재배포할 때에는 원본 권한을 별도로 확인해야 합니다.

Chromium/WebKit과 여러 화면 크기를 자동 검사하지만, 실제 iPhone 실기기·VoiceOver 인증을 의미하지 않습니다. 예시의 점수·시간·결제 상태는 시연용이며 실제 학습 평가나 결제가 아닙니다.
