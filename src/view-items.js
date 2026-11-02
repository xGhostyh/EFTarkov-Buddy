import { state } from './data.js';
import { esc } from './util.js';
import { showToast } from './ui.js';

export function renderItems(container, neededItems) {
  let filteredItems = neededItems.filter(item => {
    if (state.searchQuery) {
      return item.name.toLowerCase().includes(state.searchQuery) ||
             item.uses.some(u => u.source.toLowerCase().includes(state.searchQuery));
    }
    return true;
  });

  if (filteredItems.length === 0) {
    container.innerHTML = `<div style="color: var(--text-mute); text-align: center; padding: 40px; font-family: var(--f-mono); text-transform: uppercase; letter-spacing: 0.1em;">No pending items needed!</div>`;
    return;
  }

    container.innerHTML = `
    <div class="items-wrapper">
      <div style="display:flex; justify-content:flex-end;">
        <button id="btn-copy-items" class="btn-copy">
          <svg class="svg-icon" viewBox="0 0 24 24" style="width:14px; height:14px; margin-right:4px;"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          Copy List
        </button>
      </div>
      <div class="items-grid">
        ${filteredItems.map(item => `
          <div class="item-card">
            <div class="item-card-header">
              <span class="item-name">
                <svg class="svg-icon" viewBox="0 0 24 24" style="color: var(--text-mute);"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                ${esc(item.name)}
              </span>
              <span class="item-count-badge">NEED: ${item.totalCount}</span>
            </div>
            <div class="item-uses-list">
              ${item.uses.map(u => `
                <div class="item-use-tag ${u.type === 'hideout' ? 'use-hideout' : 'use-quest'}">
                  <span style="display:flex; align-items:center; gap:4px;">
                    ${u.type === 'hideout' 
                      ? '<svg class="svg-icon" viewBox="0 0 24 24" style="width:12px; height:12px;"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' 
                      : '<svg class="svg-icon" viewBox="0 0 24 24" style="width:12px; height:12px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>'
                    }
                    ${esc(u.source)}
                  </span>
                  <span style="margin-left: auto; font-weight: bold; color: var(--accent);">x${u.count}</span>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Copy List Feature
  const copyBtn = document.getElementById('btn-copy-items');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const text = filteredItems.map(i => `${i.totalCount}x ${i.name}`).join('\n');
      navigator.clipboard.writeText(text).then(() => {
        showToast("List copied to clipboard!", "success");
        
        const originalHTML = copyBtn.innerHTML;
        copyBtn.innerHTML = '<svg class="svg-icon" viewBox="0 0 24 24" style="width:14px; height:14px; margin-right:4px;"><polyline points="20 6 9 17 4 12"/></svg> Copied!';
        copyBtn.classList.add('success');
        
        setTimeout(() => {
          copyBtn.innerHTML = originalHTML;
          copyBtn.classList.remove('success');
        }, 2000);
      });
    });
  }
}