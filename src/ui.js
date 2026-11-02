// Small reusable UI helpers.

let toastTimer = null;

const TOAST_ICONS = {
  info: "ℹ️",
  success: "✅",
  warn: "⚠️",
  error: "❌",
  save: "💾",
};

export function showToast(message, variant = "save") {
  let toast = document.getElementById('toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.className = 'toast-notification';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }
  // Reset classes
  toast.className = 'toast-notification';
  toast.classList.add(`toast-${variant}`);

  const icon = TOAST_ICONS[variant] || TOAST_ICONS.info;
  toast.innerHTML = `<span>${icon} ${escapeHtml(message)}</span>`;
  // Force reflow so transition replays
  void toast.offsetWidth;
  toast.classList.add('show');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}

export function showEmptyState(title = "Nothing to show", hint = "") {
  const container = document.getElementById('quests-container');
  const tpl = document.getElementById('empty-state-tpl');
  if (!container || !tpl) return;
  container.innerHTML = '';
  const node = tpl.content.cloneNode(true);
  node.querySelector('.empty-title').textContent = title;
  const hintEl = node.querySelector('.empty-hint');
  if (hint) hintEl.textContent = hint;
  else hintEl.remove();
  container.appendChild(node);
}

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

export function showError(msg) {
  const container = document.getElementById('quests-container');
  if (!container) return;
  const safe = escapeHtml(typeof msg === 'string' ? msg : String(msg));
  container.innerHTML = `
    <div style="background: rgba(30, 10, 10, 0.85); border: 1px solid #ff5252; color: #ff8282; padding: 20px; margin-top: 20px; border-radius: 6px; text-align: center; font-weight: bold;">
      ⚠️ DATA LOADING ERROR:<br><br>${safe}
    </div>`;
}

export function debounce(fn, ms = 150) {
  let t = null;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

export function injectLeafletStyles() {
  if (document.getElementById('custom-leaflet-styles')) return;
  const style = document.createElement('style');
  style.id = 'custom-leaflet-styles';
  style.innerHTML = `
    .leaflet-bar a, .leaflet-bar a:hover {
      background-color: rgba(11, 13, 10, 0.9) !important;
      color: var(--accent-gold, #d2b98a) !important;
      border: 1px solid var(--line) !important;
    }
    .leaflet-bar a.leaflet-disabled {
      background-color: rgba(11, 13, 10, 0.5) !important;
      color: #555 !important;
    }
    .leaflet-control-zoom {
      border: none !important;
      box-shadow: 0 2px 5px rgba(0,0,0,0.5) !important;
    }
  `;
  document.head.appendChild(style);
}