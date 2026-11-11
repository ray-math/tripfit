/** Replace this content without changing the UI kit. All progress values are demo data. */
export const lesson = {
  brand: 'Ray class', topic: '이차함수', subtitle: '꼭짓점에서 시작하는 그래프',
  title: '개념과 문제,\n둘 다 균형 있게',
  formula: 'y = (x − 2)² − 1', vertex: [2, -1],
  profiles: [
    { label: '개념부터 차근차근', concept: 100, practice: 75, left: [100,100,100], right: [80,65,80] },
    { label: '균형 있게', concept: 79, practice: 83, left: [100,80,58], right: [90,75,84] },
    { label: '문제로 더 깊이', concept: 59, practice: 89, left: [80,58,39], right: [100,85,82] }
  ],
  conceptLabels: ['꼭짓점', '대칭축', '최솟값'], practiceLabels: ['그래프 읽기', '평행이동', '식 만들기'],
  question: '이 그래프의 꼭짓점은\n어디일까요?',
  options: ['(−2, −1)', '(2, −1)', '(2, 1)', '(−2, 1)'], answer: 1,
  explanation: 'y = (x − p)² + q의 꼭짓점은 (p, q)예요.\n괄호 안의 −2를 그대로 쓰는 것이 아니라, x − 2 = 0이 되는 x = 2를 읽어요.',
  steps: [
    { title:'꼭짓점 찾기', subtitle:'개념 카드 · 읽고 이해하기', tone:'cream', symbol:'book', value:'04', unit:'분', action:'concept' },
    { title:'그래프 움직이기', subtitle:'탐구 카드 · 직접 조작하기', tone:'mint', symbol:'graph', value:'03', unit:'분', action:'graph' },
    { title:'문제로 확인하기', subtitle:'문제 카드 · 선택하고 피드백 받기', tone:'peach', symbol:'pen', value:'05', unit:'분', action:'quiz' }
  ]
};
