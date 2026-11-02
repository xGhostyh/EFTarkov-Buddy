import { state } from './data.js';
import { isDone, isPinned, isFolded, isObjectiveDone } from './api.js';
import { getFilteredTasksByType, matchesMapFilter, getNeededItems, esc, isMainTask } from './util.js';
import { renderProfile, renderMaps } from './view-maps.js';
import { renderItems } from './view-items.js';
import { renderQuestCard } from './view-quests.js';
import { renderNotes } from './view-notes.js';

export function renderQuests() {
  const container = document.getElementById('quests-container');
  if (!container) return;  
  container.innerHTML = '';

  if (state.selectedType === "PROFILE") return renderProfile(container);
  if (state.selectedType === "MAPS") return renderMaps(container);
  if (state.selectedType === "ITEMS") return renderItems(container, getNeededItems());
  if (state.selectedType === "NOTES") return renderNotes(container);

  const currentTasks = getFilteredTasksByType();

  let filtered = currentTasks.filter(t => {
    if (state.selectedType === "MAIN") {
      if (state.selectedChapter !== "All Chapters") {
        const target = state.selectedChapter.toLowerCase().trim();
        const fields = [t.chapter, t.trader, t.name, t.id].filter(Boolean).map(s => String(s).toLowerCase().trim());
        if (!fields.some(val => val.includes(target))) return false;
      }
    } else if (state.selectedType === "SIDE") {
      if (state.selectedTrader !== "ALL TRADERS" && t.trader !== state.selectedTrader) return false;
      if (!matchesMapFilter(t.map, state.selectedMap)) return false;

      if (state.statusFilter === "ACTIVE" && !isPinned(t.id)) return false;
      if (state.statusFilter === "AVAILABLE" && isDone(t.id)) return false;
      if (state.statusFilter === "COMPLETED" && !isDone(t.id)) return false;
      if (state.statusFilter === "KAPPA" && !t.kappa) return false;
    } else if (state.selectedType === "HIDEOUT") {
      if (state.selectedHideoutModule !== "All Modules") {
        const target = state.selectedHideoutModule.toLowerCase().trim();
        const fields = [t.chapter, t.name, t.trader, t.id].filter(Boolean);
        
        // THE FIX: Check if it strictly matches, or if the field STARTS WITH the target 
        // (so "Generator Level 1" matches "Generator", but "Booze Generator" does NOT).
        const matches = fields.some(val => {
          const str = String(val).toLowerCase().trim();
          return str === target || str.startsWith(target + " ");
        });
        
        if (!matches) return false;
      }
      if (state.statusFilter === "AVAILABLE" && isDone(t.id)) return false;
      if (state.statusFilter === "COMPLETED" && !isDone(t.id)) return false;
    }else if (state.selectedType === "NOTES") return renderNotes(container);

    if (state.searchQuery) {
      const matchName = (t.name || "").toLowerCase().includes(state.searchQuery);
      const items = t.objectives || t.requirements || [];
      const matchObj = items.some(o => typeof o === 'string' && o.toLowerCase().includes(state.searchQuery));
      if (!matchName && !matchObj) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div style="color: #888; text-align: center; padding: 40px; font-weight: bold;">No data for this filter.</div>`;
    return;
  }

  const showPinBtn = state.selectedType === "SIDE";
  filtered.forEach(task => {
    container.appendChild(renderQuestCard(task, showPinBtn));
  });
}