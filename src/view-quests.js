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
  card.className = 'quest-card';

  card.innerHTML = `
    <div class="card-header">
      <div style="display: flex; align-items: center; gap: 8px;">
        <button class="toggle-icon" aria-expanded="${!folded}" style="font-size: 0.8rem; color: var(--accent-gold, #d2b98a); cursor: pointer; padding: 2px 6px; background: none; border: none; user-select: none;" title="Expand/collapse">${folded ? '▼' : '▲'}</button>
        <span class="quest-title" style="color: ${completed ? '#4caf50' : (task.kappa ? '#c2a649' : '#3894ff')}">
          ${task.kappa ? '★ ' : ''}${esc(task.name)}
        </span>
        ${task.wiki_url ? `<a href="#" class="wiki-link" style="text-decoration: none; font-size: 1rem;">🔗</a>` : ''}
      </div>
      <div class="right-column">
        <div class="badges-and-actions">
          ${task.kappa ? `<span class="badge badge-kappa">★ Kappa</span>` : ''}
          ${task.map ? `<span class="badge badge-map" title="${esc(task.map)}">📍 ${esc(task.map.length > 20 ? task.map.slice(0,20)+'…' : task.map)}</span>` : ''}
          ${task.trader ? `<span class="badge badge-trader">${esc(task.trader)}</span>` : ''}
          ${showPinBtn ? `
            <button class="action-btn btn-pin ${pinned ? 'pinned' : ''}" aria-pressed="${pinned}">
              ${pinned ? '📌 Active' : 'Pin Active'}
            </button>
          ` : ''}
          <button class="action-btn btn-complete ${completed ? 'done' : ''}" aria-pressed="${completed}">
            ${completed ? '✓ Completed' : 'Complete'}
          </button>
        </div>
        ${task.image ? `<div class="quest-image-container"><img src="${task.image}" alt="${esc(task.name)}" class="quest-image" loading="lazy" /></div>` : ''}
      </div>
    </div>

    <div class="quest-body" style="display: ${folded ? 'none' : 'block'}; padding-top: 12px; margin-top: 8px; border-top: 1px solid var(--line);">
      <div class="objectives-list">
        ${reqList.map((obj, i) => {
          const isChecked = isObjectiveDone(task.id, i);
          const isOpt = typeof obj === 'string' && obj.startsWith('(Optional)');
          return `
            <label class="objective-item ${isOpt ? 'optional-objective' : ''}" style="color: ${isChecked ? '#5c6370' : (isOpt ? '#9a9a9a' : '#e0e0e0')}">
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
    
    // Manual render call to update stats and color states instantly
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
      
      // Update text color locally without full re-render
      const parentLabel = e.target.parentElement;
      const isOpt = parentLabel.classList.contains('optional-objective');
      parentLabel.style.color = e.target.checked ? '#5c6370' : (isOpt ? '#9a9a9a' : '#e0e0e0');

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