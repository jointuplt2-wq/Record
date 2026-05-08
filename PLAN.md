# AI 코딩 어시스턴트 기록 웹 앱 — 개발 계획서

**작성일:** 2026-05-07  
**작성자:** 10년 차 정보 수집가  
**프로젝트명:** AI Coding Assistant Notes App

---

## 1. 프로젝트 목적

Claude Code 및 Google Antigravity 사용 중 발견한 팁, 트러블슈팅 사례를 직관적으로 **기록·조회·삭제**할 수 있는 로컬 기반 웹 앱을 제작한다.

---

## 2. 기술 스택

| 항목 | 선택 | 이유 |
|------|------|------|
| 마크업 | HTML5 | 외부 의존 없이 즉시 실행 가능 |
| 스타일 | CSS3 (CSS Variables) | 다크 모드·글래스모피즘 구현 용이 |
| 로직 | Vanilla JavaScript (ES6+) | 프레임워크 없이 경량 유지 |
| 저장소 | localStorage | 서버 불필요, 브라우저에서 영구 보존 |
| 폰트 | Google Fonts — Inter | 가독성 우수한 모던 산세리프 |

---

## 3. 핵심 기능 (CRUD)

### 3-1. 기록 추가 (Create)
- 제목(Title) + 본문(Content) 입력 폼
- 소속 AI 툴 선택: `Claude Code` / `Antigravity`
- 태그(선택): `팁`, `트러블슈팅`, `레퍼런스`
- 저장 시 타임스탬프 자동 기록

### 3-2. 기록 조회 (Read)
- 탭 전환으로 `전체 / Claude Code / Antigravity` 필터링
- 카드 형태로 목록 렌더링 (제목, 날짜, 태그 표시)
- 카드 클릭 시 본문 확장(Accordion) 표시

### 3-3. 기록 삭제 (Delete)
- 카드 우측 상단 삭제 버튼 (confirm 다이얼로그 포함)
- 삭제 시 localStorage 즉시 반영

> 수정(Update) 기능은 v2에서 추가 예정

---

## 4. UI/UX 디자인 방향

- **테마:** 프리미엄 다크 모드 (배경 `#0d0d0d` 계열)
- **카드:** 글래스모피즘 (`backdrop-filter: blur`, 반투명 테두리)
- **애니메이션:** 카드 등장 fade-in, 탭 전환 슬라이드, 버튼 hover 미세 반응
- **반응형:** 모바일(1열) / 태블릿(2열) / 데스크톱(3열) 그리드

---

## 5. 파일 구조

```
record/
├── index.html      # 앱 진입점 및 마크업 구조
├── style.css       # 디자인 시스템 (색상 변수, 컴포넌트 스타일)
├── script.js       # 이벤트 핸들링, localStorage CRUD 로직
├── PLAN.md         # 본 계획서
└── PLANa.md        # 초안 (Claude Code & Antigravity 활용 가이드 포함)
```

---

## 6. 개발 단계 (Step-by-Step)

### Step 1 — 기반 구축
- [ ] `index.html`: 탭 네비게이션, 입력 폼, 카드 목록 영역 마크업
- [ ] `style.css`: CSS 변수(색상·간격·반경) 정의, 글래스모피즘 카드, 애니메이션 키프레임

### Step 2 — 기능 구현
- [ ] `script.js`: localStorage 읽기/쓰기/삭제 함수
- [ ] 탭 전환 필터링 이벤트
- [ ] 폼 제출 → 카드 동적 렌더링
- [ ] 삭제 버튼 → confirm → localStorage 갱신 → DOM 재렌더

### Step 3 — 초기 데이터 삽입
- [ ] `PLANa.md`의 Claude Code Best Practices 4개 항목을 시드(seed) 데이터로 자동 삽입
- [ ] Antigravity Best Practices 4개 항목도 동일하게 삽입

### Step 4 — 최적화 및 검증
- [ ] 반응형 레이아웃 점검 (모바일 375px 기준)
- [ ] 빈 상태(Empty State) UI 처리
- [ ] 브라우저 새로고침 후 데이터 유지 확인

---

## 7. Claude Code 활용 원칙 (본 프로젝트 적용)

| 원칙 | 적용 방법 |
|------|-----------|
| Explore & Plan First | 구현 전 이 PLAN.md 검토 후 작업 지시 |
| Self-Verification | 각 Step 완료 후 브라우저 열어 동작 확인 지시 |
| Context 관리 | Step 단위로 `/clear` 또는 `/compact` 실행 |
| CLAUDE.md 활용 | 코딩 컨벤션(함수명, 주석 규칙 등) 별도 기재 예정 |

---

## 8. 참고 자료

- [Claude Code 공식 문서](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview)
- [Builder.io — Claude Code 실무 팁](https://www.builder.io/blog/claude-code-tips)
- [Google Antigravity 공식 블로그](https://blog.google/technology/ai/)
