// This lesson is deliberately unrelated to TripFit's travel experience.
export const mathFlow = {
  brand: "RAY / MATH",
  title: "Math Card Demo",
  description: "같은 카드 디자인을 여행 앱이 아닌 수학 학습 화면에도 적용하는 재사용 예제입니다.",
  start: "intro",
  steps: [
    {
      id: "intro", label: "시작", eyebrow: "01 / 시작",
      cards: [
        {
          type: "hero", color: "lime", label: "YOUR MATH MOMENT",
          title: "한 문제로 시작하는\n수학 카드",
          body: "정답을 선택하면 설명 카드가 다음 화면에 나타납니다.",
          shape: "cut", align: "right"
        },
        {
          type: "text", color: "pink", label: "TODAY'S TOPIC",
          title: "일차방정식",
          body: "선택에 따라 정답 또는 힌트 화면으로 이동해요.",
          shape: "tab", align: "right", pill: "기초 대수학"
        }
      ],
      actions: [{ label: "문제 풀기", next: "question" }]
    },
    {
      id: "question", label: "문제", eyebrow: "02 / 문제",
      cards: [
        {
          type: "hero", color: "sky", label: "QUESTION 01",
          title: "x + 3 = 7",
          body: "x의 값은 무엇일까요?",
          shape: "cut", align: "left"
        },
        {
          type: "choices", color: "cream", label: "CHOOSE ONE",
          title: "정답을 골라 보세요", shape: "tab", align: "left",
          flag: "선택해주세요",
          options: [
            { label: "① x = 4", next: "correct" },
            { label: "② x = 5", next: "hint" }
          ]
        }
      ]
    },
    {
      id: "correct", label: "정답", eyebrow: "03 / 정답",
      feedback: "정답입니다 · +1점",
      cards: [
        { type: "hero", color: "lime", label: "CORRECT", title: "정답이에요!", body: "양변에서 3을 빼면 x = 4입니다." },
        { type: "metric", color: "mint", label: "YOUR RESULT", title: "맞힌 문제", value: "1", unit: "/ 1" },
        { type: "text", color: "lilac", label: "WHY", title: "이항해서 확인", body: "x + 3 = 7 → x = 7 − 3 = 4." }
      ],
      actions: [{ label: "다시 풀기", next: "intro" }]
    },
    {
      id: "hint", label: "힌트", eyebrow: "03 / 힌트",
      feedback: "한 번 더 생각해 보세요",
      cards: [
        { type: "hero", color: "peach", label: "TRY AGAIN", title: "거의 다 왔어요", body: "양변에서 같은 수를 빼도 등식은 성립합니다." },
        { type: "text", color: "cream", label: "HINT", title: "왼쪽의 +3을 없애 보세요", body: "양쪽에서 3을 빼면 x만 남아요." }
      ],
      actions: [{ label: "다시 선택하기", next: "question" }]
    }
  ]
};
