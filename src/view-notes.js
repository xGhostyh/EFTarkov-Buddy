import { state } from './data.js';
import { getNotes, setNotes } from './api.js';
import { showToast, debounce } from './ui.js';

export function renderNotes(container) {
  container.innerHTML = `
    <div class="notes-container">
      <div class="notes-header">
        <div class="notes-title">
          <svg class="svg-icon" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          <span>FIELD NOTES</span>
        </div>
        <div class="notes-actions">
          <span class="notes-status" id="notes-status">IDLE</span>
          <button class="action-btn btn-backup btn-danger" id="notes-clear-btn" title="Clear all notes">
            <svg class="svg-icon" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            CLEAR
          </button>
        </div>
      </div>
      <textarea
        id="notes-textarea"
        class="notes-textarea"
        placeholder="> Write your raid notes, key locations, loot routes, task reminders...&#10;&#10;> Everything is saved automatically."
        spellcheck="false"
      ></textarea>
      <div class="notes-footer">
        <span id="notes-char-count">0 CHARS</span>
        <span class="notes-hint">AUTO-SAVED LOCALLY</span>
      </div>
    </div>
  `;

  const textarea = document.getElementById('notes-textarea');
  const statusEl = document.getElementById('notes-status');
  const charCountEl = document.getElementById('notes-char-count');
  const clearBtn = document.getElementById('notes-clear-btn');

  textarea.value = getNotes();
  updateCharCount();

  const saveDebounced = debounce(async () => {
    await setNotes(textarea.value);
    statusEl.textContent = '✓ SAVED';
    statusEl.style.color = 'var(--accent)';
    setTimeout(() => {
      if (statusEl.textContent === '✓ SAVED') {
        statusEl.textContent = 'IDLE';
        statusEl.style.color = 'var(--text-mute)';
      }
    }, 1500);
  }, 400);

  textarea.addEventListener('input', () => {
    statusEl.textContent = '● EDITING...';
    statusEl.style.color = 'var(--text)';
    updateCharCount();
    saveDebounced();
  });

  textarea.addEventListener('blur', async () => {
    await setNotes(textarea.value);
    statusEl.textContent = '✓ SAVED';
    statusEl.style.color = 'var(--accent)';
  });

  clearBtn.addEventListener('click', async () => {
    if (!textarea.value.trim()) return;
    if (!confirm("Clear all notes? This cannot be undone.")) return;
    textarea.value = '';
    updateCharCount();
    await setNotes('');
    statusEl.textContent = '✓ CLEARED';
    statusEl.style.color = 'var(--accent)';
    showToast("Notes cleared", "success");
  });

  setTimeout(() => textarea.focus(), 50);

  function updateCharCount() {
    const len = textarea.value.length;
    charCountEl.textContent = `${len} CHAR${len === 1 ? '' : 'S'}`;
  }
}