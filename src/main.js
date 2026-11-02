// Entry point. Wires up navigation and delegates rendering to views.

import { state, MAP_DEFAULT_FLOOR } from './data.js';
import { initTauriApi, hasBackend, loadAll, getAppVersion } from './api.js';
import { injectLeafletStyles, showError, debounce } from './ui.js';
import { renderQuests } from './render.js';
import { renderBars, updateCounters } from './bars.js';

async function init() {
  initTauriApi();
  injectLeafletStyles();
  setupTypeBar();
  setupFilters();
  renderSkeleton();
  
  // Force layout update on initial load
  updateLayoutClass();

  if (!hasBackend()) {
    showError("Could not connect to the Tauri Backend.");
    return;
  }

  try {
    const { tasks, hideoutTasks, progress } = await loadAll();
    state.tasks = tasks;
    state.hideoutTasks = hideoutTasks;
    state.progress = progress;

    renderBars();
    renderQuests();
    updateCounters();

    const version = await getAppVersion();
    const versionEl = document.getElementById('app-version');
    if (versionEl) versionEl.textContent = version ? `v${version}` : 'v1.1.5';
  } catch (err) {
    console.error("Data loading error from Rust:", err);
    showError(err);
  }
}

function renderSkeleton() {
  const container = document.getElementById('quests-container');
  const tpl = document.getElementById('skeleton-tpl');
  if (!container || !tpl) return;
  container.innerHTML = '';
  for (let i = 0; i < 5; i++) container.appendChild(tpl.content.cloneNode(true));
}

function updateLayoutClass() {
  const shell = document.querySelector('.app-shell');
  if (!shell) return;
  
  // Horizontal layout is STRICTLY for Maps
  if (state.selectedType === "MAPS") {
    shell.classList.add('horizontal-layout');
  } else {
    shell.classList.remove('horizontal-layout');
  }

  // Dynamic Search Placeholder
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    if (state.selectedType === "HIDEOUT") searchInput.placeholder = "Search modules...";
    else if (state.selectedType === "ITEMS") searchInput.placeholder = "Search items...";
    else if (state.selectedType === "NOTES") searchInput.placeholder = "Notes...";
    else searchInput.placeholder = "Search quests or objectives... (press /)";
  }
}

function setupTypeBar() {
  document.querySelectorAll('#type-bar .nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('#type-bar .nav-btn').forEach(b => b.classList.remove('selected-type'));
      e.currentTarget.classList.add('selected-type');
      state.selectedType = e.currentTarget.dataset.type;

      state.statusFilter = "ALL";
      state.searchQuery = "";
      const searchInput = document.getElementById('search-input');
      if (searchInput) searchInput.value = "";

      document.querySelectorAll('.btn-filter').forEach(b => {
        b.classList.toggle('active', b.dataset.filter === "ALL");
      });

      if (state.selectedType === "MAPS") {
        state.selectedMapFloor = MAP_DEFAULT_FLOOR[state.selectedOnlyMap] || "Main";
      }

      state.activeMapKey = null;
      
      // Update layout BEFORE rendering
      updateLayoutClass();
      
      renderBars();
      renderQuests();
    });
  });
}

function setupFilters() {
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', debounce((e) => {
      state.searchQuery = e.target.value.toLowerCase().trim();
      renderQuests();
    }, 150));
  }

  document.querySelectorAll('.btn-filter').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      state.statusFilter = e.currentTarget.dataset.filter;
      renderQuests();
    });
  });
}

window.addEventListener('DOMContentLoaded', init);