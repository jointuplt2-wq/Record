'use strict';

// ===== Constants =====
const STORAGE_KEY   = 'ai-coding-notes';
const TOKEN_KEY     = 'gist-token';
const GIST_ID_KEY   = 'gist-id';
const GIST_FILENAME = 'ai-recording-notes.json';

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

// ===== Gist API =====
function getToken()  { return localStorage.getItem(TOKEN_KEY) || ''; }
function getGistId() { return localStorage.getItem(GIST_ID_KEY) || ''; }

function setSync(state, msg) {
  const el = document.getElementById('syncStatus');
  if (!el) return;
  el.className = `sync-status ${state}`;
  el.textContent = msg;
}

async function gistFetch(path, method, body) {
  const token = getToken();
  const res = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      'Authorization': `token ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github+json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  return res.json();
}

async function findGistId() {
  // 파일명이 일치하는 Gist 전체 탐색
  const list = await gistFetch('/gists?per_page=100', 'GET');
  const matches = list.filter(g => g.files?.[GIST_FILENAME]);
  if (!matches.length) return getGistId() || null;

  // Gist가 하나면 바로 사용
  if (matches.length === 1) {
    const id = matches[0].id;
    localStorage.setItem(GIST_ID_KEY, id);
    const el = document.getElementById('gistIdInput');
    if (el) el.value = id;
    return id;
  }

  // 여러 개이면 가장 먼저 만들어진 Gist(정본)를 선택
  matches.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  const id = matches[0].id;
  localStorage.setItem(GIST_ID_KEY, id);
  const el = document.getElementById('gistIdInput');
  if (el) el.value = id;
  return id;
}

async function loadFromGist() {
  const token = getToken();
  if (!token) return null;
  setSync('syncing', '🔄 불러오는 중…');
  const gistId = await findGistId();
  if (!gistId) return null;
  const data = await gistFetch(`/gists/${gistId}`, 'GET');
  const content = data.files?.[GIST_FILENAME]?.content;
  if (!content) return null;
  setSync('synced', '✅ 동기화됨');
  return JSON.parse(content);
}

async function saveToGist(notes) {
  const token = getToken();
  if (!token) return;
  setSync('syncing', '🔄 저장 중…');
  const body = { files: { [GIST_FILENAME]: { content: JSON.stringify(notes, null, 2) } } };
  let gistId = await findGistId();
  if (gistId) {
    await gistFetch(`/gists/${gistId}`, 'PATCH', body);
  } else {
    const res = await gistFetch('/gists', 'POST', {
      ...body,
      description: 'AI Recording Notes — 자동 생성',
      public: false,
    });
    gistId = res.id;
    localStorage.setItem(GIST_ID_KEY, gistId);
    // 설정창 ID 필드 업데이트
    const el = document.getElementById('gistIdInput');
    if (el) el.value = gistId;
  }
  setSync('synced', '✅ 동기화됨');
}

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

async function initNotes() {
  if (getToken()) {
    try {
      const remote = await loadFromGist();
      if (remote) { notes = remote; saveLocal(notes); renderNotes(); return; }
    } catch (e) {
      setSync('error', '❌ 연결 실패');
    }
  }
  const local = loadLocal();
  notes = local || SEED_NOTES;
  if (!local) saveLocal(notes);
  if (!getToken()) setSync('', '');
  renderNotes();
}

async function persistNotes() {
  saveLocal(notes);
  if (getToken()) {
    try { await saveToGist(notes); }
    catch { setSync('error', '❌ 저장 실패'); }
  }
}

// ===== Render =====
function formatDate(d) {
  return new Date(d).toLocaleDateString('ko-KR', { year:'numeric', month:'long', day:'numeric' });
}

function tagEmoji() { return ''; }

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
      <span class="tag tag-${note.tag}">${tagEmoji(note.tag)}${note.tag}</span>
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

// ===== Settings Modal =====
function openModal() {
  document.getElementById('tokenInput').value  = getToken();
  document.getElementById('gistIdInput').value = getGistId();
  document.getElementById('settingsModal').classList.remove('hidden');
}
function closeModal() {
  document.getElementById('settingsModal').classList.add('hidden');
}

document.getElementById('settingsBtn').addEventListener('click', openModal);
document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('settingsModal').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeModal();
});

document.getElementById('saveSettingsBtn').addEventListener('click', async () => {
  const token  = document.getElementById('tokenInput').value.trim();
  const gistId = document.getElementById('gistIdInput').value.trim();
  if (!token) { alert('토큰을 입력해 주세요.'); return; }
  localStorage.setItem(TOKEN_KEY, token);
  if (gistId) localStorage.setItem(GIST_ID_KEY, gistId);
  else localStorage.removeItem(GIST_ID_KEY);
  closeModal();
  // 즉시 Gist에 현재 노트 업로드 or 불러오기
  try {
    if (gistId) {
      const remote = await loadFromGist();
      if (remote) { notes = remote; saveLocal(notes); renderNotes(); }
    } else {
      await saveToGist(notes);
    }
  } catch { setSync('error', '❌ 연결 실패'); }
});

document.getElementById('clearSettingsBtn').addEventListener('click', () => {
  if (!confirm('Gist 연결을 해제하시겠습니까?\n(로컬 데이터는 유지됩니다)')) return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(GIST_ID_KEY);
  setSync('', '');
  closeModal();
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
