import { state, TRADERS, STORY_CHAPTERS, MAIN_MAPS, ONLY_MAPS_LIST, HIDEOUT_MODULES, MAP_DEFAULT_FLOOR } from './data.js';
import { renderQuests } from './render.js';
import { getFilteredTasksByType, matchesMapFilter, isMainTask } from './util.js';
import { isDone, isPinned } from './api.js';

export function renderBars() {
  const sideFilters = document.getElementById('side-filters-container');
  const mainFilters = document.getElementById('main-filters-container');
  const mapsFilters = document.getElementById('maps-filters-container');
  const hideoutFilters = document.getElementById('hideout-filters-container');
  
  const controlsBar = document.querySelector('.controls-bar');
  const statusFilters = document.getElementById('status-filters');
  const searchInput = document.getElementById('search-input');

  // Types that use the top control bar
  const needsControlsBar = ["SIDE", "HIDEOUT", "ITEMS"].includes(state.selectedType);

  if (controlsBar) {
    controlsBar.style.display = needsControlsBar ? 'flex' : 'none';
  }

  if (statusFilters) {
    const needsSearch = ["SIDE", "HIDEOUT", "ITEMS"].includes(state.selectedType);
    statusFilters.style.display = needsSearch ? 'flex' : 'none';
    if (searchInput) searchInput.style.display = needsSearch ? 'inline-block' : 'none';

    statusFilters.querySelectorAll('.btn-filter').forEach(btn => btn.style.display = 'none');

    if (state.selectedType === "SIDE") {
      statusFilters.querySelectorAll('.btn-filter:not(.hideout-only)').forEach(btn => btn.style.display = 'inline-block');
    } else if (state.selectedType === "HIDEOUT") {
      if (!document.getElementById('hideout-filter-all')) {
        const createBtn = (id, text, filterVal, isActive) => {
          const b = document.createElement('button');
          b.id = id;
          b.className = `btn-filter hideout-only ${isActive ? 'active' : ''}`;
          b.dataset.filter = filterVal;
          b.innerText = text;
          b.onclick = (e) => {
            statusFilters.querySelectorAll('.hideout-only').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            state.statusFilter = filterVal;
            renderQuests();
          };
          return b;
        };
        statusFilters.appendChild(createBtn('hideout-filter-all', 'ALL MODULES [0]', 'ALL', true));
        statusFilters.appendChild(createBtn('hideout-filter-tobuild', 'TO BUILD [0]', 'AVAILABLE', false));
        statusFilters.appendChild(createBtn('hideout-filter-completed', 'COMPLETED [0]', 'COMPLETED', false));
      }
      statusFilters.querySelectorAll('.hideout-only').forEach(btn => btn.style.display = 'inline-block');
    }
  }

  if (sideFilters) sideFilters.style.display = (state.selectedType === "SIDE") ? 'block' : 'none';
  if (mainFilters) mainFilters.style.display = (state.selectedType === "MAIN") ? 'block' : 'none';
  if (mapsFilters) mapsFilters.style.display = (state.selectedType === "MAPS") ? 'block' : 'none';
  if (hideoutFilters) hideoutFilters.style.display = (state.selectedType === "HIDEOUT") ? 'block' : 'none';

  if (state.selectedType === "MAIN") {
    const chapterBar = document.getElementById('chapter-bar');
    if (chapterBar) {
      chapterBar.innerHTML = '';
      STORY_CHAPTERS.forEach(chapter => {
        const btn = document.createElement('button');
        btn.className = `nav-btn ${chapter === state.selectedChapter ? 'selected-chapter' : ''}`;
        btn.innerText = chapter;
        btn.onclick = () => { state.selectedChapter = chapter; renderBars(); renderQuests(); };
        chapterBar.appendChild(btn);
      });
    }
  } else if (state.selectedType === "MAPS") {
    const mapOnlyBar = document.getElementById('maps-only-bar');
    if (mapOnlyBar) {
      mapOnlyBar.innerHTML = '';
      ONLY_MAPS_LIST.forEach(m => {
        const btn = document.createElement('button');
        btn.className = `nav-btn ${m === state.selectedOnlyMap ? 'selected-map' : ''}`;
        btn.innerText = m;
        btn.onclick = () => { 
          state.selectedOnlyMap = m; 
          state.selectedMapFloor = MAP_DEFAULT_FLOOR[m] || "Main";
          state.activeMapKey = null; // force map rebuild
          renderBars(); 
          renderQuests(); 
        };
        mapOnlyBar.appendChild(btn);
      });
    }
  } else if (state.selectedType === "HIDEOUT") {
    const hideoutBar = document.getElementById('hideout-bar');
    if (hideoutBar) {
      hideoutBar.innerHTML = '';
      HIDEOUT_MODULES.forEach(mod => {
        const btn = document.createElement('button');
        btn.className = `nav-btn ${mod === state.selectedHideoutModule ? 'selected-chapter' : ''}`;
        btn.innerText = mod;
        btn.onclick = () => { state.selectedHideoutModule = mod; renderBars(); renderQuests(); };
        hideoutBar.appendChild(btn);
      });
    }
  } else if (state.selectedType === "SIDE") {
    const traderBar = document.getElementById('trader-bar');
    if (traderBar) {
      traderBar.innerHTML = '';
      TRADERS.forEach(trader => {
        const btn = document.createElement('button');
        btn.className = `nav-btn ${trader === state.selectedTrader ? 'selected-trader' : ''}`;
        btn.innerText = trader;
        btn.onclick = () => { state.selectedTrader = trader; renderBars(); renderQuests(); };
        traderBar.appendChild(btn);
      });
    }

    const mapBar = document.getElementById('map-bar');
    if (mapBar) {
      mapBar.innerHTML = '';
      MAIN_MAPS.forEach(m => {
        const btn = document.createElement('button');
        btn.className = `nav-btn ${m === state.selectedMap ? 'selected-map' : ''}`;
        btn.innerText = m;
        btn.onclick = () => { state.selectedMap = m; renderBars(); renderQuests(); };
        mapBar.appendChild(btn);
      });
    }
  }
  updateCounters();
}

export function updateCounters() {
  const statsElem = document.getElementById('global-stats');
  if (statsElem) statsElem.style.display = state.selectedType === "SIDE" ? 'block' : 'none';

  if (state.selectedType !== "SIDE" && state.selectedType !== "HIDEOUT") return;

  if (!["SIDE", "HIDEOUT"].includes(state.selectedType)) return;  

  const currentTasks = getFilteredTasksByType();
  
  const baseTasks = currentTasks.filter(t => {
    if (state.selectedType === "SIDE") {
      if (state.selectedTrader !== "ALL TRADERS" && t.trader !== state.selectedTrader) return false;
      if (!matchesMapFilter(t.map, state.selectedMap)) return false;
    } else if (state.selectedType === "HIDEOUT") {
      if (state.selectedHideoutModule !== "All Modules") {
        const target = state.selectedHideoutModule.toLowerCase().trim();
        const fields = [t.chapter, t.name, t.trader, t.id].filter(Boolean);
        const matches = fields.some(val => String(val).toLowerCase().trim().includes(target));
        if (!matches) return false;
      }
    }
    return true;
  });

  const total = baseTasks.length;
  const completed = baseTasks.filter(t => isDone(t.id)).length;
  
  if (state.selectedType === "SIDE") {
    const pct = total > 0 ? ((completed / total) * 100).toFixed(1) : 0;
    if (statsElem) statsElem.innerText = `Total: ${completed} / ${total} (${pct}%)`;

    const activeCount = baseTasks.filter(t => isPinned(t.id)).length;
    const availableCount = baseTasks.filter(t => !isDone(t.id)).length;
    const kappaCount = baseTasks.filter(t => t.kappa).length;

    const setText = (sel, txt) => { const el = document.querySelector(sel); if(el) el.innerText = txt; };
    setText('#status-filters button[data-filter="ALL"]:not(.hideout-only)', `ALL [${total}]`);
    setText('#status-filters button[data-filter="ACTIVE"]:not(.hideout-only)', `ACTIVE [${activeCount}]`);
    setText('#status-filters button[data-filter="AVAILABLE"]:not(.hideout-only)', `AVAILABLE [${availableCount}]`);
    setText('#status-filters button[data-filter="KAPPA"]:not(.hideout-only)', `KAPPA [${kappaCount}]`);
    setText('#status-filters button[data-filter="COMPLETED"]:not(.hideout-only)', `COMPLETED [${completed}]`);
  } else if (state.selectedType === "HIDEOUT") {
    const toBuildCount = baseTasks.filter(t => !isDone(t.id)).length;
    const hAllBtn = document.getElementById('hideout-filter-all');
    const hToBuildBtn = document.getElementById('hideout-filter-tobuild');
    const hCompletedBtn = document.getElementById('hideout-filter-completed');
    if (hAllBtn) hAllBtn.innerText = `ALL MODULES [${total}]`;
    if (hToBuildBtn) hToBuildBtn.innerText = `TO BUILD [${toBuildCount}]`;
    if (hCompletedBtn) hCompletedBtn.innerText = `COMPLETED [${completed}]`;
  }
}