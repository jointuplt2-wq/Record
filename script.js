'use strict';

const STORAGE_KEY = 'ai-coding-notes';

// PLANa.md의 Best Practices를 시드 데이터로 삽입
const SEED_NOTES = [
  {
    id: 'seed-1',
    title: '탐색과 계획의 선행 (Explore & Plan First)',
    content: '복잡한 작업일수록 바로 코딩을 지시하지 마세요. 먼저 시스템에 대한 탐색(Explore)을 지시하고, 코드를 작성하기 전 Plan Mode(Shift+Tab 2회)를 사용하여 구현 계획을 세우게 한 뒤 승인하는 과정을 거쳐야 합니다.',
    tool: 'claude',
    tag: '팁',
    date: '2026-05-07',
  },
  {
    id: 'seed-2',
    title: '명시적인 피드백 루프 제공 (Self-Verification)',
    content: '클로드 코드는 스스로 검증할 때 가장 강력합니다. 작업을 지시할 때 "이 코드를 작성하고, 테스트 코드를 돌려서 결과를 확인해 줘"와 같이 자체 검증 명령을 반드시 포함하세요. UI 변경 시에는 브라우저 확장이나 Playwright MCP 서버를 연결해 시각적 검증을 시키는 것이 좋습니다.',
    tool: 'claude',
    tag: '팁',
    date: '2026-05-07',
  },
  {
    id: 'seed-3',
    title: '컨텍스트 윈도우의 공격적 관리',
    content: '대화가 길어지면 컨텍스트가 꽉 차서 성능이 저하됩니다. 전체 저장소를 통째로 던져주기보다 @를 사용해 특정 파일만 참조하세요. 하나의 작업이 끝나면 /clear 명령어로 컨텍스트를 초기화하거나, /compact 명령어로 이전 대화를 압축하는 습관이 필수적입니다.',
    tool: 'claude',
    tag: '팁',
    date: '2026-05-07',
  },
  {
    id: 'seed-4',
    title: 'CLAUDE.md를 통한 프로젝트 통제',
    content: '프로젝트 루트 경로에 CLAUDE.md 파일을 만들고, 해당 프로젝트의 코딩 컨벤션, 아키텍처 규칙 등을 기록해 두세요. 클로드 코드가 이 파일을 프로젝트의 "두뇌"처럼 읽고 지침을 따르게 됩니다.',
    tool: 'claude',
    tag: '팁',
    date: '2026-05-07',
  },
  {
    id: 'seed-5',
    title: '미션 컨트롤을 통한 다중 작업 병렬 처리',
    content: '단일 작업에 얽매이지 마세요. 안티 그래비티는 여러 에이전트를 생성하여 백그라운드에서 동시에 작업을 수행할 수 있습니다. 프론트엔드 UI 수정, 백엔드 API 작성, DB 마이그레이션을 각각 다른 에이전트에게 할당하고 Mission Control 화면에서 진행 상황만 감독하세요.',
    tool: 'antigravity',
    tag: '팁',
    date: '2026-05-07',
  },
  {
    id: 'seed-6',
    title: '아티팩트(Artifacts) 기반의 비동기적 피드백',
    content: '에이전트가 작업을 진행하며 Implementation Plan, Task List 등의 아티팩트(마크다운 문서)를 생성합니다. 에이전트의 작업을 중단시키지 않고도, 아티팩트 파일에 리뷰를 남겨 자연스럽게 방향성을 수정(Course-correction)할 수 있습니다.',
    tool: 'antigravity',
    tag: '팁',
    date: '2026-05-07',
  },
  {
    id: 'seed-7',
    title: '내장 브라우저 서브에이전트 적극 활용',
    content: '안티 그래비티는 시각적 UI 테스트에 특화되어 있습니다. 웹앱을 개발할 때 서브에이전트를 호출하여 "브라우저를 열어 로그인 플로우가 잘 작동하는지 녹화해 줘"라고 지시하세요. 에이전트가 직접 클릭하고 타이핑하며 결과를 WebP 형태의 비디오 리포트로 제공합니다.',
    tool: 'antigravity',
    tag: '팁',
    date: '2026-05-07',
  },
  {
    id: 'seed-8',
    title: '안전성(Safety) 확인 및 권한 통제',
    content: '터미널 명령어를 대신 실행해 주는 강력한 기능이 있으므로, 위험한 명령어나 데이터베이스 삭제와 관련된 작업이 요청되었을 때 시스템이 "사용자의 승인"을 요구합니다. 에이전트가 제안한 실행 명령(CLI)이 의도에 맞는지 꼼꼼히 확인하고 승인(Approve)하는 절차를 소홀히 하지 마세요.',
    tool: 'antigravity',
    tag: '팁',
    date: '2026-05-07',
  },
];

// ===== Storage =====
function loadNotes() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
  } catch {
    return null;
  }
}

function saveNotes(notes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function initNotes() {
  const stored = loadNotes();
  if (stored) return stored;
  saveNotes(SEED_NOTES);
  return SEED_NOTES;
}

// ===== Render =====
let currentFilter = 'all';
let notes = initNotes();

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

function createCard(note) {
  const card = document.createElement('article');
  card.className = `note-card tool-${note.tool}`;
  card.dataset.id = note.id;

  const toolMap = {
    claude:      { label: '🟣 Claude Code', badge: 'badge-claude' },
    antigravity: { label: '🔵 Antigravity',  badge: 'badge-antigravity' },
    gemini:      { label: '🟢 Gemini CLI',   badge: 'badge-gemini' },
  };
  const { label: toolLabel, badge: badgeClass } = toolMap[note.tool] || toolMap.claude;

  card.innerHTML = `
    <div class="card-header">
      <h3 class="card-title">${escapeHtml(note.title)}</h3>
      <button class="btn-delete" data-id="${note.id}" title="삭제">✕</button>
    </div>
    <div class="card-meta">
      <span class="badge ${badgeClass}">${toolLabel}</span>
      <span class="tag tag-${note.tag}">${tagEmoji(note.tag)}${note.tag}</span>
    </div>
    <p class="expand-hint">👆 클릭하여 내용 보기</p>
    <p class="card-content">${escapeHtml(note.content)}</p>
    <time class="card-date">${formatDate(note.date)}</time>
  `;

  // 카드 클릭 → 본문 토글 (삭제 버튼 클릭 제외)
  card.addEventListener('click', (e) => {
    if (e.target.closest('.btn-delete')) return;
    card.classList.toggle('expanded');
  });

  // 삭제 버튼
  card.querySelector('.btn-delete').addEventListener('click', (e) => {
    e.stopPropagation();
    deleteNote(note.id);
  });

  return card;
}

function renderNotes() {
  const list = document.getElementById('noteList');
  const empty = document.getElementById('emptyState');

  const filtered = currentFilter === 'all'
    ? notes
    : notes.filter(n => n.tool === currentFilter);

  list.innerHTML = '';

  if (filtered.length === 0) {
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  filtered.forEach(note => list.appendChild(createCard(note)));
}

// ===== CRUD =====
function addNote(title, content, tool, tag) {
  const note = {
    id: `note-${Date.now()}`,
    title,
    content,
    tool,
    tag,
    date: new Date().toISOString().slice(0, 10),
  };
  notes.unshift(note);
  saveNotes(notes);
  renderNotes();
}

function deleteNote(id) {
  if (!confirm('이 기록을 삭제하시겠습니까?')) return;
  notes = notes.filter(n => n.id !== id);
  saveNotes(notes);
  renderNotes();
}

// ===== Tag Emoji =====
function tagEmoji(tag) {
  const map = { '팁': '💡 ', '트러블슈팅': '🔧 ', '레퍼런스': '📎 ' };
  return map[tag] || '';
}

// ===== Escape =====
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ===== Event Listeners =====
document.getElementById('noteForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const title   = document.getElementById('noteTitle').value.trim();
  const content = document.getElementById('noteContent').value.trim();
  const tool    = document.getElementById('noteTool').value;
  const tag     = document.getElementById('noteTag').value;
  if (!title || !content) return;
  addNote(title, content, tool, tag);
  e.target.reset();
});

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentFilter = tab.dataset.filter;
    renderNotes();
  });
});

// ===== Init =====
renderNotes();
