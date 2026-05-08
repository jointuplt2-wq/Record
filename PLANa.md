# AI 코딩 어시스턴트 활용 가이드 및 계획안 (Claude Code & Antigravity)

본 문서는 10년 차 정보 수집가의 관점에서 작성된, 최근 가장 주목받는 에이전트형 AI 코딩 어시스턴트인 **'클로드 코드(Claude Code)'**와 **'안티 그래비티(Google Antigravity)'**의 효과적인 활용을 위한 핵심 지침과 참고 자료를 기록한 것입니다.

## 1. 클로드 코드 (Claude Code) 활용 가이드

Anthropic에서 개발한 클로드 코드는 CLI(명령줄 인터페이스) 환경에서 동작하며, 개발자의 터미널에 상주하면서 코드베이스를 직접 탐색하고 수정하는 '민첩한 협업자'입니다.

### 💡 주요 염두 사항 (Best Practices)
1. **탐색과 계획의 선행 (Explore & Plan First)**
   - 복잡한 작업일수록 바로 코딩을 지시하지 마세요. 먼저 시스템에 대한 탐색(Explore)을 지시하고, 코드를 작성하기 전 **Plan Mode(`Shift+Tab` 2회)**를 사용하여 구현 계획을 세우게 한 뒤 승인하는 과정을 거쳐야 합니다.
2. **명시적인 피드백 루프 제공 (Self-Verification)**
   - 클로드 코드는 스스로 검증할 때 가장 강력합니다. 작업을 지시할 때 "이 코드를 작성하고, 테스트 코드를 돌려서 결과를 확인해 줘"와 같이 자체 검증 명령을 반드시 포함하세요. UI 변경 시에는 브라우저 확장이나 Playwright MCP 서버를 연결해 시각적 검증을 시키는 것이 좋습니다.
3. **컨텍스트 윈도우(Context Window)의 공격적 관리**
   - 대화가 길어지면 컨텍스트가 꽉 차서 성능이 저하됩니다. 전체 저장소를 통째로 던져주기보다 `@`를 사용해 특정 파일만 참조하세요.
   - 하나의 작업이 끝나면 `/clear` 명령어로 컨텍스트를 초기화하거나, `/compact` 명령어로 이전 대화를 압축하는 습관이 필수적입니다.
4. **`CLAUDE.md`를 통한 프로젝트 통제**
   - 프로젝트 루트 경로에 `CLAUDE.md` 파일을 만들고, 해당 프로젝트의 코딩 컨벤션, 아키텍처 규칙 등을 기록해 두세요. 클로드 코드가 이 파일을 프로젝트의 '두뇌'처럼 읽고 지침을 따르게 됩니다.

### 🔗 참고 사이트 (References)
* **Anthropic 공식 문서:** [Claude Code Overview](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview)
* **Builder.io 블로그 (실무 팁):** [How to use Claude Code effectively](https://www.builder.io/blog/claude-code-tips)
* **Skilljar 분석:** [Maximizing productivity with Claude Code](https://www.skilljar.com)

---

## 2. 구글 안티 그래비티 (Google Antigravity) 활용 가이드

안티 그래비티는 Google DeepMind의 기술이 집약된 **Agent-First IDE(통합 개발 환경)**입니다. 단순한 채팅 도구를 넘어, 여러 AI 에이전트를 동시에 띄워놓고 프로젝트 전체를 오케스트레이션(지휘)하는 것에 특화되어 있습니다.

### 💡 주요 염두 사항 (Best Practices)
1. **매니저 화면(Mission Control)을 통한 다중 작업 병렬 처리**
   - 단일 작업에 얽매이지 마세요. 안티 그래비티는 여러 에이전트를 생성하여 백그라운드에서 동시에 작업을 수행할 수 있습니다. 프론트엔드 UI 수정, 백엔드 API 작성, DB 마이그레이션을 각각 다른 에이전트에게 할당하고 당신은 '미션 컨트롤' 화면에서 진행 상황만 감독하세요.
2. **아티팩트(Artifacts) 기반의 비동기적 피드백**
   - 에이전트가 작업을 진행하며 Implementation Plan(구현 계획), Task List(작업 목록) 등의 '아티팩트(마크다운 문서)'를 생성합니다. 에이전트의 작업을 중단시키지 않고도, 아티팩트 파일에 리뷰를 남겨 자연스럽게 방향성을 수정(Course-correction)할 수 있습니다.
3. **내장 브라우저 서브에이전트(Browser Subagent) 적극 활용**
   - 안티 그래비티는 시각적 UI 테스트에 특화되어 있습니다. 웹앱을 개발할 때 서브에이전트를 호출하여 "브라우저를 열어 로그인 플로우가 잘 작동하는지 녹화해 줘"라고 지시하세요. 에이전트가 직접 클릭하고 타이핑하며 결과를 WebP 형태의 비디오 리포트로 제공합니다.
4. **안전성(Safety) 확인 및 권한 통제**
   - 터미널 명령어를 대신 실행해 주는 강력한 기능이 있으므로, 위험한 명령어나 데이터베이스 삭제와 관련된 작업이 요청되었을 때 시스템이 "사용자의 승인"을 요구합니다. 에이전트가 제안한 실행 명령(CLI)이 의도에 맞는지 꼼꼼히 확인하고 승인(Approve)하는 절차를 소홀히 하지 마세요.

### 🔗 참고 사이트 (References)
* **Google 공식 블로그:** [Introducing Antigravity: The Agent-First IDE](https://blog.google/technology/ai/)
* **Scalable Path 기술 리뷰:** [DeepMind's Antigravity: Architecture and Use Cases](https://www.scalablepath.com)
* **Medium 심층 분석:** [Why Antigravity is fundamentally different from VS Code](https://medium.com/)

---

## 📝 총평 및 향후 적용 계획
- **클로드 코드**는 터미널 기반의 민첩한 단일 작업 및 코드베이스 탐색에 적극 활용한다.
- **안티 그래비티**는 대규모 프로젝트의 아키텍처 설계, 다중 에이전트 오케스트레이션 및 시각적 UI 검증이 필요한 작업에 주로 배치한다.
- 위 지침을 바탕으로 현재 진행 중인 프로젝트에 즉각적인 도입 및 테스트를 진행한다.

---

# 🚀 클로드 코드 & 안티 그래비티 기록 웹 앱 개발 계획 (App Development Plan)

## 1. 개요
현재 작성된 AI 코딩 어시스턴트 활용 가이드를 바탕으로, 앞으로 새롭게 알게 되는 팁이나 트러블슈팅 사례를 직관적으로 기록하고 관리할 수 있는 **웹 애플리케이션**을 개발합니다.

## 2. 주요 기능 및 디자인
*   **기술 스택:** 순수 웹 표준 기술 (Vanilla HTML, CSS, JavaScript)
*   **UI/UX 디자인:** 
    *   최신 웹 트렌드를 반영한 **프리미엄 다크 모드 (Dark Mode)**
    *   글래스모피즘(Glassmorphism) 및 부드러운 전환(마이크로 애니메이션) 적용
    *   가독성이 뛰어난 모던 타이포그래피 (예: Inter 폰트)
*   **핵심 기능 (CRUD):**
    *   두 가지 AI 툴(클로드 코드 / 안티 그래비티) 탭 전환 및 필터링 기능
    *   간편한 메모 추가 폼 (제목 및 내용 입력)
    *   작성한 기록 조회 및 삭제 기능
*   **데이터 관리:** 브라우저의 **로컬 스토리지(Local Storage)**를 활용하여 서버 없이 데이터를 영구적으로 보존

## 3. 진행 단계 (Step-by-Step)
1.  **기반 구축 (HTML/CSS):** 다크 모드에 어울리는 `index.html` 구조 작성 및 `style.css` 디자인 시스템(색상 변수, 애니메이션 등) 세팅
2.  **기능 구현 (JS):** `script.js`를 통해 탭 전환 이벤트, 로컬 스토리지 데이터 읽기/쓰기/삭제 기능 연동
3.  **최적화 및 피드백:** 레이아웃 미세 조정, 반응형 처리 및 사용자 시각 테스트 완료 후 마무리
