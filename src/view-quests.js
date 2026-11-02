import { state } from './data.js';
import { isDone, isPinned, isFolded, isObjectiveDone, setQuestDone, setQuestPinned, setQuestFolded, setObjectiveDone } from './api.js';
import { applyQuestReputation } from './rewards.js';
import { openExternalUrl } from './api.js';
import { showToast } from './ui.js';
import { esc } from './util.js';
import { renderQuests } from './render.js';
import { updateCounters } from './bars.js';

export function renderQuestCard(task, showPinBtn) {
  const completed = isDone(task.id);
  const pinned = isPinned(task.id);
  const folded = isFolded(task.id);
  const reqList = task.objectives || task.requirements || [];

  const card = document.createElement('div');
  card.className = `quest-card ${completed ? 'completed' : ''}`;

  card.innerHTML = `
    <div class="card-header">
      <div style="display: flex; align-items: center; gap: 8px;">
        <button class="toggle-icon" aria-expanded="${!folded}" title="Expand/collapse">${folded ? '▼' : '▲'}</button>
        <span class="quest-title" style="color: ${completed ? 'var(--ok)' : 'var(--accent)'}">
          ${task.kappa ? '<svg class="svg-icon" viewBox="0 0 24 24" style="width:14px; height:14px; color:var(--accent); margin-right:4px;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' : ''}
          ${esc(task.name)}
        </span>
        ${task.wiki_url ? `<a href="#" class="wiki-link" style="text-decoration: none; font-size: 1rem;"><svg class="svg-icon" viewBox="0 0 24 24" style="width:14px; height:14px;"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></a>` : ''}
      </div>
      <div class="right-column">
        <div class="badges-and-actions">
          ${task.kappa ? `<span class="badge badge-kappa"><svg class="svg-icon" viewBox="0 0 24 24" style="width:12px; height:12px;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> Kappa</span>` : ''}
          ${task.map ? `<span class="badge badge-map"><svg class="svg-icon" viewBox="0 0 24 24" style="width:12px; height:12px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ${esc(task.map.length > 20 ? task.map.slice(0,20)+'…' : task.map)}</span>` : ''}
          ${task.trader ? `<span class="badge badge-trader">${esc(task.trader)}</span>` : ''}
          ${showPinBtn ? `
            <button class="action-btn btn-pin ${pinned ? 'pinned' : ''}" aria-pressed="${pinned}">
              <svg class="svg-icon" viewBox="0 0 24 24" style="width:12px; height:12px;"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/></svg>
              ${pinned ? 'Pinned' : 'Pin'}
            </button>
          ` : ''}
          <button class="action-btn btn-complete ${completed ? 'done' : ''}" aria-pressed="${completed}">
            <svg class="svg-icon" viewBox="0 0 24 24" style="width:12px; height:12px;"><polyline points="20 6 9 17 4 12"/></svg>
            ${completed ? 'Done' : 'Complete'}
          </button>
        </div>
      </div>
    </div>

    <div class="quest-body" style="display: ${folded ? 'none' : 'block'}; padding-top: 12px; margin-top: 8px; border-top: 1px solid var(--border);">
      <div class="objectives-list">
        ${reqList.map((obj, i) => {
          const isChecked = isObjectiveDone(task.id, i);
          const isOpt = typeof obj === 'string' && obj.startsWith('(Optional)');
          return `
            <label class="objective-item ${isOpt ? 'optional-objective' : ''}" style="color: ${isChecked ? 'var(--text-mute)' : (isOpt ? 'var(--text-mute)' : 'var(--text)')}">
              <input type="checkbox" data-task="${task.id}" data-index="${i}" ${isChecked ? 'checked' : ''}>
              ${esc(obj)}
            </label>
          `;
        }).join('')}
      </div>

      ${task.guide ? `<div class="quest-guide"><strong>GUIDE:</strong> ${esc(task.guide)}</div>` : ''}
      ${task.rewards ? `<div class="rewards-text">REWARDS: ${esc(task.rewards)}</div>` : ''}
    </div>
  `;

  // Toggle Fold
  const iconElem = card.querySelector('.toggle-icon');
  const bodyElem = card.querySelector('.quest-body');
  iconElem.addEventListener('click', async (e) => {
    e.stopPropagation();
    const currentlyCollapsed = bodyElem.style.display === 'none';
    bodyElem.style.display = currentlyCollapsed ? 'block' : 'none';
    iconElem.innerText = currentlyCollapsed ? '▲' : '▼';
    iconElem.setAttribute('aria-expanded', String(currentlyCollapsed));
    await setQuestFolded(task.id, !currentlyCollapsed);
  });

  // Wiki Link
  const wikiLink = card.querySelector('.wiki-link');
  if (wikiLink && task.wiki_url) {
    wikiLink.onclick = (e) => { e.preventDefault(); openExternalUrl(task.wiki_url); };
  }

  // Complete Button
  const completeBtn = card.querySelector('.btn-complete');
  completeBtn.onclick = async () => {
    const willComplete = !completed;
    await setQuestDone(task.id, willComplete);
    await applyQuestReputation(task, willComplete);
    
    renderQuests(); 
    updateCounters();
  };

  // Pin Button
  const pinBtn = card.querySelector('.btn-pin');
  if (pinBtn) {
    pinBtn.onclick = async () => {
      const newPinnedState = !pinned;
      await setQuestPinned(task.id, newPinnedState);
      renderQuests();
      updateCounters();
    };
  }

  // Checkboxes
  card.querySelectorAll('.objectives-list input[type="checkbox"]').forEach(chk => {
    chk.onchange = async (e) => {
      const taskId = e.target.dataset.task;
      const idx = parseInt(e.target.dataset.index, 10);
      await setObjectiveDone(taskId, idx, e.target.checked);
      
      const parentLabel = e.target.parentElement;
      const isOpt = parentLabel.classList.contains('optional-objective');
      parentLabel.style.color = e.target.checked ? 'var(--text-mute)' : (isOpt ? 'var(--text-mute)' : 'var(--text)');

      // Auto-complete quest if all objectives are checked
      const allCheckboxes = card.querySelectorAll('.objectives-list input[type="checkbox"]');
      const allChecked = Array.from(allCheckboxes).every(box => box.checked);
      
      if (allChecked && !isDone(taskId)) {
        await setQuestDone(taskId, true);
        await applyQuestReputation(task, true);
        showToast(`"${task.name}" completed!`);
        renderQuests();
        updateCounters();
      } else if (!allChecked && isDone(taskId)) {
        await setQuestDone(taskId, false);
        await applyQuestReputation(task, false);
        renderQuests();
        updateCounters();
      }
    };
  });

  return card;
}