# 키트로 재생성한 새 예시

이 예시는 원본 TripFit 페이지를 iframe으로 넣거나 원본으로 이동시키지 않습니다. 다른 디자인을 새로 만든 DAYFORM도 사용하지 않습니다.

## 실제 연결

`examples/regenerated.html` → `examples/lesson-demo.js` → `compose.js` → 기존 `flow.js`, `tripfit-motion.js`, 확장한 `tripfit-sheet.js`.

스타일은 기존 `theme.css`, `tripfit-details.css`에 `presentation.css`를 적용합니다. 원본의 팔레트, 카드 간 4px 틈, 30px 모서리, 417×876 프레임, 라임 버튼과 큰 숫자 위계를 유지하는 계층입니다.

`CardFlow`의 내비게이션과 화면 전환은 그대로 사용합니다. `ComposedFlow`는 자유로운 카드 내부 구성을 위한 `render(app)`를 추가합니다. 여행 일정 계산 엔진과 `web/index.html`, `demo_data.js`는 의존성에 포함하지 않습니다.

## 새로 조립한 내용

수학 수업을 예시로 사용합니다. 메인 학습 화면, 문제 선택 화면, 풀이/결과 화면을 만들었습니다. 개념 카드는 설명형 상세 시트, 그래프 카드는 조작 가능한 상세 시트, 문제 카드는 별도 선택 화면을 엽니다. 모든 상세 화면을 같은 텍스트 틀에 강제로 맞추지 않습니다.

점수와 학습 시간은 UI 시연을 위한 예시 값이며 학생 성적이나 실제 진단이 아닙니다.

## 다른 콘텐츠를 만드는 방법

- 제목, 숫자, 항목, 문제 문구는 `examples/lesson-data.js`에서 바꿉니다.
- 카드별로 다른 배치와 동작은 `examples/lesson-demo.js`의 `render` 함수에서 조립합니다.
- 카드, 수치 표시, 진도 막대, 버튼, 행 카드, 두 열 배치, 상세 시트는 키트 모듈에서 가져옵니다. 새 예시마다 복사해 다시 구현하지 않습니다.

```js
import { ComposedFlow, card, node } from '../compose.js';
const flow = {
  title: '다른 프로그램',
  steps: [{ id: 'home', cards: [{
    type: 'text',
    render: app => card({
      tone: 'pink', title: '내 콘텐츠',
      onClick: () => app.sheet({
        title: '이 카드만의 상세 화면',
        content: card({tone: 'cream'}, node('p', {}, '필요한 배치를 자유롭게 넣습니다.'))
      })
    }, node('p', {}, '디자인과 모션은 공통 키트가 담당합니다.'))
  }]}]
};
new ComposedFlow(document.getElementById('app'), flow).mount();
```

## 실행과 재현

```sh
python3 -m http.server 8000
# /ui-kit/examples/regenerated.html
node --test ui-kit/tests/*.test.mjs
python3 ui-kit/build_preview.py
# ui-kit/dist/lesson.html: 실제 키트 소스를 번들링한 단일 파일
# ui-kit/dist/manifest.json: 입력 파일과 출력의 SHA-256
python3 ui-kit/tests/regenerated.spec.py --browser chromium
python3 ui-kit/tests/regenerated.spec.py --browser webkit
```

GitHub Actions는 기존 단위 테스트와 두 브라우저의 상호작용 검사를 실행한 후에만 `high`에 생성된 `dist` 파일을 커밋합니다. 변경된 콘텐츠로 같은 키트를 다시 인스턴스화하는 검사도 포함합니다. 모바일 크기 검사는 실제 아이폰 실기기 검사를 대신하지 않습니다.

`main`과 원본 `web/`는 변경하지 않습니다. 원본에서 추출된 부품의 출처와 이용조건은 기존 `ui-kit/README.md`의 안내를 그대로 따릅니다. 별도의 새 라이선스를 부여하지 않습니다.
