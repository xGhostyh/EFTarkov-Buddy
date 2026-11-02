import { state } from './data.js';
import { getNotes, setNotes } from './api.js';
import { showToast } from './ui.js';
import { debounce } from './ui.js';

export function renderNotes(container) {
  container.innerHTML = `
    <div class="notes-container">
      <div class="notes-header">
        <div class="notes-title">
          <span class="notes-icon">📝</span>
          <span>FIELD NOTES</span>
        </div>
        <div class="notes-actions">
          <span class="notes-status" id="notes-status">Idle</span>
          <button class="action-btn btn-complete" id="notes-clear-btn" title="Clear all notes">🗑️ Clear</button>
        </div>
      </div>
      <textarea
        id="notes-textarea"
        class="notes-textarea"
        placeholder="Write your raid notes, key locations, loot routes, task reminders...&#10;&#10;Everything is saved automatically."
        spellcheck="false"
      ></textarea>
      <div class="notes-footer">
        <span id="notes-char-count">0 chars</span>
        <span class="notes-hint">Auto-saved locally · Ctrl+A to select all</span>
      </div>
    </div>
  `;

  const textarea = document.getElementById('notes-textarea');
  const statusEl = document.getElementById('notes-status');
  const charCountEl = document.getElementById('notes-char-count');
  const clearBtn = document.getElementById('notes-clear-btn');

  // Cargar notas existentes
  textarea.value = getNotes();
  updateCharCount();

  // Guardado con debounce para no saturar el backend en cada tecla
  const saveDebounced = debounce(async () => {
    await setNotes(textarea.value);
    statusEl.textContent = '✓ Saved';
    statusEl.style.color = 'var(--olive-l)';
    setTimeout(() => {
      if (statusEl.textContent === '✓ Saved') {
        statusEl.textContent = 'Idle';
        statusEl.style.color = 'var(--muted)';
      }
    }, 1500);
  }, 400);

  textarea.addEventListener('input', () => {
    statusEl.textContent = '● Editing...';
    statusEl.style.color = 'var(--alert)';
    updateCharCount();
    saveDebounced();
  });

  // Guardar también al perder foco (por si el debounce no llegó a disparar)
  textarea.addEventListener('blur', async () => {
    await setNotes(textarea.value);
    statusEl.textContent = '✓ Saved';
    statusEl.style.color = 'var(--olive-l)';
  });

  clearBtn.addEventListener('click', async () => {
    if (!textarea.value.trim()) return;
    if (!confirm("Clear all notes? This cannot be undone.")) return;
    textarea.value = '';
    updateCharCount();
    await setNotes('');
    statusEl.textContent = '✓ Cleared';
    statusEl.style.color = 'var(--olive-l)';
    showToast("Notes cleared", "success");
  });

  // Focus automático al entrar
  setTimeout(() => textarea.focus(), 50);

  function updateCharCount() {
    const len = textarea.value.length;
    charCountEl.textContent = `${len} char${len === 1 ? '' : 's'}`;
  }
}