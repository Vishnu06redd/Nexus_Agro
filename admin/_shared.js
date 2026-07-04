/* ═══════════════════════════════════════════════
   NEXUS GROUP — SHARED JAVASCRIPT v1.0.0
   Loaded by all dashboard pages via:
   <script src="_shared.js"></script>
═══════════════════════════════════════════════ */

/* ── LIVE DATE IN TOPBAR ── */
function updateTopbarDate() {
  const dateEl = document.getElementById('topbarDate');
  const dayEl  = document.getElementById('topbarDay');
  if (!dateEl && !dayEl) return;
  const now = new Date();
  const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  if (dateEl) dateEl.textContent = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
  if (dayEl)  dayEl.textContent  = days[now.getDay()];
}
updateTopbarDate();

/* ── MODAL ── */
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}
// Close modal on overlay click
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
});

/* ── TOAST ── */
function showToast(message, type = 'info', duration = 3000) {
  const wrap = document.getElementById('toastWrap');
  if (!wrap) return;
  const icons = { success: '✓', error: '✕', info: '✦' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || '✦'}</span><span>${message}</span>`;
  wrap.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(6px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/* ── DRAWER ── */
function openDrawer(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}
function closeDrawer(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}

/* ── AI ASSISTANT FAB ── */
let _aiOpen = false;

function toggleAI() {
  _aiOpen = !_aiOpen;
  const panel   = document.getElementById('aiPanel');
  const chevron = document.getElementById('aiChevron');
  if (panel)   panel.classList.toggle('open', _aiOpen);
  if (chevron) chevron.textContent = _aiOpen ? '▼' : '▲';
}

const _aiResponses = {
  "summarize today's business":   'Today looks strong: 7 new orders, ₹1.8L revenue, 6 unread messages from buyers, and 4 shipments in progress. Al-Ameen Trading sent a new 50-ton inquiry for Green Chilli.',
  "who is our top buyer this month?": 'Your top buyer this month is <strong>Al-Ameen Trading (UAE)</strong> with ₹4.2L in orders.',
  "show pending shipments":       'You have <strong>4 active shipments</strong>: NXS-25-051 (UAE, 70%), NXS-25-052 (Qatar, 45%), NXS-25-053 (Saudi Arabia, 25%), NXS-25-054 (Oman, 10%).',
  "draft a quotation email":      'Here\'s a draft:<br><em>Subject: Quotation for [Product] — Nexus Group<br>Dear [Buyer Name],<br>Thank you for your inquiry. We are pleased to offer [Product] at ₹[Price] per ton, FOB Mumbai. Minimum order: [MOQ] tons. Validity: 30 days. Please confirm to proceed.<br>Warm regards,<br>Kamalesh Reddy, Nexus Group</em>',
  "what is today's revenue?":     "Today's revenue stands at <strong>₹1.8 Lakhs</strong>, tracking 15.7% ahead of this day last month.",
};

function aiQuery(q) {
  const panel = document.getElementById('aiPanel');
  if (!panel) return;
  const body = panel.querySelector('.ai-panel-body');
  if (!body) return;

  const userBubble = document.createElement('div');
  userBubble.className = 'ai-bubble user';
  userBubble.textContent = q;
  body.appendChild(userBubble);
  body.scrollTop = body.scrollHeight;

  setTimeout(() => {
    const aiBubble = document.createElement('div');
    aiBubble.className = 'ai-bubble';
    const key = q.toLowerCase().trim();
    aiBubble.innerHTML = _aiResponses[key] || 'I\'m analyzing your business data. Connect the Nexus backend API for live, real-time answers.';
    body.appendChild(aiBubble);
    body.scrollTop = body.scrollHeight;
  }, 700);
}

function aiSend() {
  const input = document.getElementById('aiInput');
  if (!input) return;
  const val = input.value.trim();
  if (!val) return;
  aiQuery(val);
  input.value = '';
}

// Keyboard shortcut: Enter in AI input
document.addEventListener('DOMContentLoaded', function() {
  const aiInput = document.getElementById('aiInput');
  if (aiInput) {
    aiInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') aiSend();
    });
  }
});

/* ── GLOBAL SEARCH SHORTCUT (⌘K / Ctrl+K) ── */
document.addEventListener('keydown', function(e) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    const searchInput = document.querySelector('.topbar-search input');
    if (searchInput) searchInput.focus();
  }
  if (e.key === 'Escape') {
    // Close any open modal
    document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
    // Close AI panel
    if (_aiOpen) toggleAI();
  }
});

/* ── SIDEBAR MOBILE TOGGLE ── */
const menuBtn = document.querySelector('.topbar-menu-btn');
if (menuBtn) {
  menuBtn.addEventListener('click', function() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.classList.toggle('sidebar-open');
  });
}
