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
    container.innerHTML = `<div style="color: #888; text-align: center; padding: 40px; font-weight: bold;">No pending items needed!</div>`;
    return;
  }

  container.innerHTML = `
    <div style="display:flex; justify-content:flex-end; margin-bottom: 10px;">
      <button id="btn-copy-items" class="btn-copy">📋 Copy List</button>
    </div>
    <div class="items-grid">
      ${filteredItems.map(item => `
        <div class="item-card">
          <div class="item-card-header">
            <span class="item-name">📦 ${esc(item.name)}</span>
            <span class="item-count-badge">Need: ${item.totalCount}</span>
          </div>
          <div class="item-uses-list">
            ${item.uses.map(u => `
              <div class="item-use-tag ${u.type === 'hideout' ? 'use-hideout' : 'use-quest'}">
                <span>${u.type === 'hideout' ? '🏠' : '📜'} ${esc(u.source)}</span>
                <span style="margin-left: auto; font-weight: bold;">x${u.count}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // Copy List Feature con feedback visual
  const copyBtn = document.getElementById('btn-copy-items');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const text = filteredItems.map(i => `${i.totalCount}x ${i.name}`).join('\n');
      navigator.clipboard.writeText(text).then(() => {
        showToast("List copied to clipboard!", "success");
        
        // Efecto visual en el botón
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '✅ Copied!';
        copyBtn.classList.add('success');
        
        setTimeout(() => {
          copyBtn.innerHTML = originalText;
          copyBtn.classList.remove('success');
        }, 2000);
      });
    });
  }
}