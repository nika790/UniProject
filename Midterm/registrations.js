/* ================================================================
   KIU Admin — registrations.js
   ================================================================ */

// ── LOCK SCREEN ───────────────────────────────────────────────────
const AUTH_KEY    = 'kiu-admin-auth';
const ACCESS_CODE = '12345678';

const lockScreen  = document.getElementById('lock-screen');
const adminPanel  = document.getElementById('admin-panel');
const accessInput = document.getElementById('access-code');
const unlockBtn   = document.getElementById('unlock-btn');
const lockError   = document.getElementById('lock-error');

const showPanel = () => {
  lockScreen.style.display = 'none';
  adminPanel.style.display = 'block';
  applyDarkMode(localStorage.getItem('kiu-dark-mode') === 'true');
  init();
};

const tryUnlock = () => {
  if (accessInput.value === ACCESS_CODE) {
    localStorage.setItem(AUTH_KEY, '1');
    showPanel();
  } else {
    lockError.textContent = 'Incorrect code. Please try again.';
    accessInput.value = '';
    accessInput.focus();
    accessInput.classList.add('shake');
    setTimeout(() => accessInput.classList.remove('shake'), 500);
  }
};

unlockBtn.addEventListener('click', tryUnlock);
accessInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') tryUnlock(); });

// ── STORAGE ───────────────────────────────────────────────────────
const STORAGE_KEY = 'kiu-registrations';
const loadRegistrations = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
const saveRegistrations = (list) => localStorage.setItem(STORAGE_KEY, JSON.stringify(list));

// ── DARK MODE ─────────────────────────────────────────────────────
const darkToggle = document.getElementById('dark-mode-toggle');

const applyDarkMode = (isDark) => {
  document.body.classList.toggle('dark-mode', isDark);
  if (darkToggle) darkToggle.textContent = isDark ? '☀️' : '🌙';
  localStorage.setItem('kiu-dark-mode', isDark);
};

darkToggle?.addEventListener('click', () =>
  applyDarkMode(!document.body.classList.contains('dark-mode'))
);

// Logout button: clear persisted auth and show lock screen
const logoutBtn = document.getElementById('logout-btn');
const logout = () => {
  localStorage.removeItem(AUTH_KEY);
  adminPanel.style.display = 'none';
  lockScreen.style.display = 'flex';
  accessInput.value = '';
  if (typeof showToast === 'function') showToast('Logged out.', 'info');
};
logoutBtn?.addEventListener('click', logout);

// ── TOAST ─────────────────────────────────────────────────────────
const toastContainer = document.getElementById('toast-container');

const showToast = (text, type = 'info') => {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = text;
  toastContainer.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('toast-show'));
  setTimeout(() => {
    toast.classList.remove('toast-show');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, 3500);
};

// ── TIME AGO ──────────────────────────────────────────────────────
const timeAgo = (dateStr) => {
  const diff  = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return 'just now';
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

// ── CHART ─────────────────────────────────────────────────────────
const programKeys = ['computer-science','business','medicine','design','law','psychology'];

const drawChart = () => {
  const canvas = document.getElementById('reg-chart');
  if (!canvas) return;

  const regs   = loadRegistrations();
  const counts = {};
  regs.forEach(({ program }) => { counts[program] = (counts[program] || 0) + 1; });
  const values = programKeys.map((k) => counts[k] || 0);

  if (values.every((v) => v === 0)) { canvas.style.display = 'none'; return; }
  canvas.style.display = 'block';

  const W   = canvas.width  = canvas.offsetWidth || 600;
  const H   = canvas.height = 220;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);

  const pad    = { top: 24, right: 20, bottom: 50, left: 36 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  const max    = Math.max(...values, 1);
  const barW   = chartW / programKeys.length;
  const colors = ['#2c5aa0','#ff6b6b','#28a745','#fd7e14','#6f42c1','#17a2b8'];

  ctx.strokeStyle = '#ccc';
  ctx.lineWidth   = 1;
  ctx.beginPath();
  ctx.moveTo(pad.left, pad.top);
  ctx.lineTo(pad.left, H - pad.bottom);
  ctx.lineTo(W - pad.right, H - pad.bottom);
  ctx.stroke();

  programKeys.forEach((label, i) => {
    const x    = pad.left + i * barW;
    const barH = (values[i] / max) * chartH;
    const y    = pad.top + chartH - barH;

    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x + barW * 0.12, y, barW * 0.76, barH, [4, 4, 0, 0]);
    else ctx.rect(x + barW * 0.12, y, barW * 0.76, barH);
    ctx.fill();

    if (values[i] > 0) {
      ctx.fillStyle = '#333';
      ctx.font      = 'bold 12px Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(values[i], x + barW / 2, y - 6);
    }

    const short = label === 'computer-science' ? 'CS'
                : label.charAt(0).toUpperCase() + label.slice(1, 4);
    ctx.fillStyle = '#688';
    ctx.font      = '11px Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(short, x + barW / 2, H - pad.bottom + 16);
  });
};

// ── BREAKDOWN BADGES ──────────────────────────────────────────────
const renderBreakdown = () => {
  const el = document.getElementById('breakdown-stats');
  if (!el) return;
  const regs = loadRegistrations();
  if (regs.length === 0) { el.innerHTML = ''; return; }
  const counts = {};
  regs.forEach(({ program }) => { counts[program] = (counts[program] || 0) + 1; });
  el.innerHTML = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([prog, n]) =>
      `<span class="badge">${prog.replace(/-/g, ' ')}: <strong>${n}</strong></span>`
    ).join('');
};

// ── TABLE STATE ───────────────────────────────────────────────────
let currentPage = 1;
let sortKey     = 'submittedAt';
let sortDir     = 'desc';
let searchQuery = '';
const PAGE_SIZE = 5;
let pendingDeleteIndex = null;

const getFilteredSorted = () => {
  let regs = loadRegistrations().map((r, i) => ({ ...r, _idx: i }));
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    regs = regs.filter(({ firstName, lastName, email, program }) =>
      `${firstName} ${lastName} ${email} ${program}`.toLowerCase().includes(q)
    );
  }
  regs.sort((a, b) => {
    const va = (a[sortKey] || '').toString().toLowerCase();
    const vb = (b[sortKey] || '').toString().toLowerCase();
    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ?  1 : -1;
    return 0;
  });
  return regs;
};

const renderAllRegistrations = () => {
  const container = document.getElementById('registrations-table-container');
  const paginEl   = document.getElementById('pagination');
  if (!container) return;

  const all        = getFilteredSorted();
  const total      = all.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (currentPage > totalPages) currentPage = totalPages;

  const slice = all.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (total === 0) {
    container.innerHTML = `<p class="no-data">${
      searchQuery ? 'No results match your search.' : 'No registrations yet.'
    }</p>`;
    if (paginEl) paginEl.innerHTML = '';
    drawChart();
    renderBreakdown();
    return;
  }

  const sortIcon = (key) => {
    if (sortKey !== key) return '<span class="sort-icon">⇅</span>';
    return `<span class="sort-icon active">${sortDir === 'asc' ? '↑' : '↓'}</span>`;
  };

  const cols = [
    { key: 'firstName',   label: 'Name' },
    { key: 'email',       label: 'Email' },
    { key: 'program',     label: 'Program' },
    { key: 'studyLevel',  label: 'Level' },
    { key: 'submittedAt', label: 'Submitted' },
  ];

  const headers = cols.map(({ key, label }) =>
    `<th class="sortable" data-sort="${key}">${label} ${sortIcon(key)}</th>`
  ).join('') + '<th>Actions</th>';

  const rows = slice.map(({ firstName, lastName, email, program, studyLevel, submittedAt, _idx }) => `
    <tr>
      <td>${firstName} ${lastName}</td>
      <td>${email}</td>
      <td>${program.replace(/-/g, ' ')}</td>
      <td>${studyLevel}</td>
      <td title="${new Date(submittedAt).toLocaleString()}">${timeAgo(submittedAt)}</td>
      <td class="action-btns">
        <button class="edit-btn"   data-index="${_idx}">Edit</button>
        <button class="delete-btn" data-index="${_idx}">Delete</button>
      </td>
    </tr>`).join('');

  container.innerHTML = `
    <table class="registrations-table">
      <thead><tr>${headers}</tr></thead>
      <tbody>${rows}</tbody>
    </table>`;

  container.querySelectorAll('.sortable').forEach((th) => {
    th.addEventListener('click', () => {
      const key = th.dataset.sort;
      if (sortKey === key) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
      else { sortKey = key; sortDir = 'asc'; }
      renderAllRegistrations();
    });
  });

  container.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.addEventListener('click', () => showDeleteModal(parseInt(btn.dataset.index)));
  });
  container.querySelectorAll('.edit-btn').forEach((btn) => {
    btn.addEventListener('click', () => showEditModal(parseInt(btn.dataset.index)));
  });

  if (paginEl) {
    paginEl.innerHTML = totalPages <= 1 ? '' : `
      <button class="page-btn" id="prev-page" ${currentPage === 1 ? 'disabled' : ''}>← Prev</button>
      <span class="page-info">Page ${currentPage} of ${totalPages} · ${total} entries</span>
      <button class="page-btn" id="next-page" ${currentPage === totalPages ? 'disabled' : ''}>Next →</button>`;
    document.getElementById('prev-page')?.addEventListener('click', () => { currentPage--; renderAllRegistrations(); });
    document.getElementById('next-page')?.addEventListener('click', () => { currentPage++; renderAllRegistrations(); });
  }

  drawChart();
  renderBreakdown();
};

// ── DELETE MODAL ──────────────────────────────────────────────────
const showDeleteModal = (idx) => {
  pendingDeleteIndex = idx;
  document.getElementById('delete-modal').classList.add('modal-open');
};
const closeDeleteModal = () => {
  pendingDeleteIndex = null;
  document.getElementById('delete-modal').classList.remove('modal-open');
};

// ── EDIT MODAL ────────────────────────────────────────────────────
const showEditModal = (idx) => {
  const reg = loadRegistrations()[idx];
  if (!reg) return;
  document.getElementById('edit-idx').value       = idx;
  document.getElementById('edit-firstname').value = reg.firstName;
  document.getElementById('edit-lastname').value  = reg.lastName;
  document.getElementById('edit-email').value     = reg.email;
  document.getElementById('edit-program').value   = reg.program;
  document.getElementById('edit-level').value     = reg.studyLevel;
  document.getElementById('edit-modal').classList.add('modal-open');
};
const closeEditModal = () => document.getElementById('edit-modal').classList.remove('modal-open');

// ── EXPORT CSV ────────────────────────────────────────────────────
const exportCSV = () => {
  const regs = loadRegistrations();
  if (regs.length === 0) { showToast('No registrations to export.', 'error'); return; }
  const hdrs = ['First Name','Last Name','Email','Program','Level','Interests','Submitted'];
  const rows = regs.map(({ firstName, lastName, email, program, studyLevel, interests = [], submittedAt }) =>
    [firstName, lastName, email, program, studyLevel,
     interests.join(';'), new Date(submittedAt).toLocaleString()]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(',')
  );
  const csv  = [hdrs.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), {
    href: url, download: `kiu-registrations-${Date.now()}.csv`
  });
  a.click();
  URL.revokeObjectURL(url);
  showToast('CSV downloaded!', 'success');
};

// ── INIT (runs after successful unlock) ───────────────────────────
const init = () => {
  renderAllRegistrations();

  document.getElementById('reg-search')?.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim();
    currentPage = 1;
    renderAllRegistrations();
  });

  document.getElementById('export-csv')?.addEventListener('click', exportCSV);

  document.getElementById('print-regs')?.addEventListener('click', () => window.print());

  document.getElementById('clear-all')?.addEventListener('click', () => {
    if (loadRegistrations().length === 0) { showToast('No registrations to clear.', 'error'); return; }
    document.getElementById('clear-modal').classList.add('modal-open');
  });

  document.getElementById('modal-delete-confirm')?.addEventListener('click', () => {
    if (pendingDeleteIndex !== null) {
      saveRegistrations(loadRegistrations().filter((_, i) => i !== pendingDeleteIndex));
      renderAllRegistrations();
      showToast('Registration deleted.', 'success');
    }
    closeDeleteModal();
  });
  document.getElementById('modal-delete-cancel')?.addEventListener('click', closeDeleteModal);
  document.getElementById('delete-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'delete-modal') closeDeleteModal();
  });

  document.getElementById('modal-clear-confirm')?.addEventListener('click', () => {
    saveRegistrations([]);
    renderAllRegistrations();
    showToast('All registrations cleared.', 'success');
    document.getElementById('clear-modal').classList.remove('modal-open');
  });
  document.getElementById('modal-clear-cancel')?.addEventListener('click', () => {
    document.getElementById('clear-modal').classList.remove('modal-open');
  });
  document.getElementById('clear-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'clear-modal') document.getElementById('clear-modal').classList.remove('modal-open');
  });

  document.getElementById('edit-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const idx  = parseInt(document.getElementById('edit-idx').value);
    const regs = loadRegistrations();
    if (regs[idx]) {
      regs[idx].firstName  = document.getElementById('edit-firstname').value.trim();
      regs[idx].lastName   = document.getElementById('edit-lastname').value.trim();
      regs[idx].email      = document.getElementById('edit-email').value.trim();
      regs[idx].program    = document.getElementById('edit-program').value;
      regs[idx].studyLevel = document.getElementById('edit-level').value;
      saveRegistrations(regs);
      renderAllRegistrations();
      showToast('Registration updated.', 'success');
    }
    closeEditModal();
  });
  document.getElementById('edit-cancel')?.addEventListener('click', closeEditModal);
  document.getElementById('edit-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'edit-modal') closeEditModal();
  });
};

// Already authenticated — skip lock screen
// (must run after showPanel/applyDarkMode/init are all defined above)
if (localStorage.getItem(AUTH_KEY) === '1') showPanel();
