'use strict';

// ===== Constants =====
const STORAGE_KEY = 'ai-coding-notes';

// ===== Seed Data =====
const SEED_NOTES = [
  { id:'seed-1', title:'탐색과 계획의 선행 (Explore & Plan First)', content:'복잡한 작업일수록 바로 코딩을 지시하지 마세요. 먼저 시스템에 대한 탐색(Explore)을 지시하고, 코드를 작성하기 전 Plan Mode(Shift+Tab 2회)를 사용하여 구현 계획을 세우게 한 뒤 승인하는 과정을 거쳐야 합니다.', tool:'claude', tag:'팁', date:'2026-05-07' },
  { id:'seed-2', title:'명시적인 피드백 루프 제공 (Self-Verification)', content:'클로드 코드는 스스로 검증할 때 가장 강력합니다. 작업을 지시할 때 "이 코드를 작성하고, 테스트 코드를 돌려서 결과를 확인해 줘"와 같이 자체 검증 명령을 반드시 포함하세요.', tool:'claude', tag:'팁', date:'2026-05-07' },
  { id:'seed-3', title:'컨텍스트 윈도우의 공격적 관리', content:'대화가 길어지면 컨텍스트가 꽉 차서 성능이 저하됩니다. @를 사용해 특정 파일만 참조하고, 작업이 끝나면 /clear 또는 /compact를 실행하세요.', tool:'claude', tag:'팁', date:'2026-05-07' },
  { id:'seed-4', title:'CLAUDE.md를 통한 프로젝트 통제', content:'프로젝트 루트에 CLAUDE.md 파일을 만들고, 코딩 컨벤션·아키텍처 규칙을 기록해 두세요. 클로드 코드가 이 파일을 프로젝트의 "두뇌"처럼 읽고 지침을 따릅니다.', tool:'claude', tag:'팁', date:'2026-05-07' },
  { id:'seed-5', title:'미션 컨트롤을 통한 다중 작업 병렬 처리', content:'프론트엔드 UI 수정, 백엔드 API 작성, DB 마이그레이션을 각각 다른 에이전트에게 할당하고 Mission Control 화면에서 진행 상황만 감독하세요.', tool:'antigravity', tag:'팁', date:'2026-05-07' },
  { id:'seed-6', title:'아티팩트(Artifacts) 기반의 비동기적 피드백', content:'에이전트가 작업을 진행하며 Implementation Plan, Task List 등의 아티팩트를 생성합니다. 작업을 중단시키지 않고도 아티팩트에 리뷰를 남겨 방향성을 수정할 수 있습니다.', tool:'antigravity', tag:'팁', date:'2026-05-07' },
  { id:'seed-7', title:'내장 브라우저 서브에이전트 적극 활용', content:'"브라우저를 열어 로그인 플로우가 잘 작동하는지 녹화해 줘"라고 지시하면 에이전트가 직접 클릭·타이핑하며 WebP 비디오 리포트를 제공합니다.', tool:'antigravity', tag:'팁', date:'2026-05-07' },
  { id:'seed-8', title:'안전성(Safety) 확인 및 권한 통제', content:'위험한 명령어나 DB 삭제 관련 작업이 요청되었을 때 시스템이 "사용자의 승인"을 요구합니다. 에이전트가 제안한 CLI 명령이 의도에 맞는지 꼼꼼히 확인하고 승인하세요.', tool:'antigravity', tag:'팁', date:'2026-05-07' },
];

// ===== Storage =====
function loadLocal() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { return null; }
}
function saveLocal(notes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

// ===== State =====
let notes = [];
let currentFilter = 'all';

function initNotes() {
  const local = loadLocal();
  notes = local || SEED_NOTES;
  if (!local) saveLocal(notes);
  renderNotes();
}

function persistNotes() {
  saveLocal(notes);
}

// ===== Render =====
function formatDate(d) {
  return new Date(d).toLocaleDateString('ko-KR', { year:'numeric', month:'long', day:'numeric' });
}

function createCard(note) {
  const toolMap = {
    claude:      { label: 'Claude Code', badge: 'badge-claude' },
    antigravity: { label: 'Antigravity',  badge: 'badge-antigravity' },
    gemini:      { label: 'Gemini CLI',   badge: 'badge-gemini' },
  };
  const { label: toolLabel, badge: badgeClass } = toolMap[note.tool] || toolMap.claude;

  const card = document.createElement('article');
  card.className = `note-card tool-${note.tool}`;
  card.dataset.id = note.id;
  card.innerHTML = `
    <div class="card-header">
      <h3 class="card-title">${escapeHtml(note.title)}</h3>
      <button class="btn-delete" data-id="${note.id}" title="삭제">✕</button>
    </div>
    <div class="card-meta">
      <span class="badge ${badgeClass}">${toolLabel}</span>
      <span class="tag tag-${note.tag}">${note.tag}</span>
    </div>
    <p class="expand-hint">클릭하여 내용 보기</p>
    <p class="card-content">${escapeHtml(note.content)}</p>
    <time class="card-date">${formatDate(note.date)}</time>
  `;
  card.addEventListener('click', e => {
    if (e.target.closest('.btn-delete')) return;
    card.classList.toggle('expanded');
  });
  card.querySelector('.btn-delete').addEventListener('click', e => {
    e.stopPropagation();
    deleteNote(note.id);
  });
  return card;
}

function renderNotes() {
  const list  = document.getElementById('noteList');
  const empty = document.getElementById('emptyState');
  const filtered = currentFilter === 'all' ? notes : notes.filter(n => n.tool === currentFilter);
  list.innerHTML = '';
  if (!filtered.length) { empty.classList.remove('hidden'); return; }
  empty.classList.add('hidden');
  filtered.forEach(n => list.appendChild(createCard(n)));
}

// ===== CRUD =====
function addNote(title, content, tool, tag) {
  notes.unshift({ id:`note-${Date.now()}`, title, content, tool, tag, date: new Date().toISOString().slice(0,10) });
  persistNotes();
  renderNotes();
}

function deleteNote(id) {
  if (!confirm('이 기록을 삭제하시겠습니까?')) return;
  notes = notes.filter(n => n.id !== id);
  persistNotes();
  renderNotes();
}

function escapeHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ===== Export / Import =====
document.getElementById('exportBtn').addEventListener('click', () => {
  const json = JSON.stringify(notes, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  const date = new Date().toISOString().slice(0, 10);
  a.href     = url;
  a.download = `ai-notes-${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById('importFile').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const loaded = JSON.parse(ev.target.result);
      if (!Array.isArray(loaded)) throw new Error('형식 오류');
      if (!confirm(`${loaded.length}개 노트를 불러옵니다.\n기존 데이터와 합쳐집니다. 계속할까요?`)) return;
      // id 기준 중복 제거 후 병합 (불러온 것이 앞에)
      const merged = [...loaded];
      const ids = new Set(loaded.map(n => n.id));
      notes.forEach(n => { if (!ids.has(n.id)) merged.push(n); });
      notes = merged;
      persistNotes();
      renderNotes();
      alert(`✅ ${loaded.length}개 노트를 불러왔습니다.`);
    } catch {
      alert('❌ 올바른 JSON 파일이 아닙니다.');
    }
    e.target.value = '';
  };
  reader.readAsText(file);
});

// ===== Form =====
document.getElementById('noteForm').addEventListener('submit', e => {
  e.preventDefault();
  const title   = document.getElementById('noteTitle').value.trim();
  const content = document.getElementById('noteContent').value.trim();
  const tool    = document.getElementById('noteTool').value;
  const tag     = document.getElementById('noteTag').value;
  if (!title || !content) return;
  addNote(title, content, tool, tag);
  e.target.reset();
});

// ===== Tabs =====
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentFilter = tab.dataset.filter;
    renderNotes();
  });
});

// ===== Init =====
initNotes();
