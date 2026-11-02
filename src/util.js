// Pure helpers — no DOM, no state mutation.

import { state, STORY_CHAPTERS } from './data.js';

// Unify the "is this a main story task?" decision — used by every view.
export function isMainTask(t) {
  if (t.is_main === true) return true;
  if (t.chapter && String(t.chapter).length > 0) return true;
  if (t.trader && STORY_CHAPTERS.some(ch =>
    ch !== "All Chapters" && ch.toLowerCase() === String(t.trader).toLowerCase())) {
    return true;
  }
  return false;
}

// HTML escape for anything that isn't trusted constant markup.
export function esc(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function matchesMapFilter(taskMapStr, filterMap) {
  if (filterMap === "ALL MAPS") return true;
  if (!taskMapStr || taskMapStr.includes("Not specified") ||
      taskMapStr.toLowerCase().includes("any location")) {
    return filterMap === "Any Location";
  }
  const mapsList = taskMapStr.split(',').map(m => m.trim().toLowerCase());
  return mapsList.includes(filterMap.toLowerCase());
}

export function mapKey(map, floor) {
  return `${map}_${floor || 'main'}`;
}

export function getFilteredTasksByType() {
  if (state.selectedType === "HIDEOUT") return state.hideoutTasks;
  return state.tasks.filter(t =>
    state.selectedType === "MAIN" ? isMainTask(t) : !isMainTask(t)
  );
}

// ---------- Item aggregation ----------

const ACTION_VERBS = new Set([
  "survive", "extract", "eliminate", "kill", "find", "locate", "mark",
  "hand over", "reach", "scout", "explore", "neutralize", "place",
  "obtain", "get", "gather", "pickup", "check", "deliver", "mop",
  "return", "use", "determine", "modify", "stash", "investigate",
  "visit", "(optional)", "take", "put", "repair", "plant", "talk",
  "share", "search", "hide", "earn", "capture", "win", "play", "report",
  "complete", "bring", "gain", "access", "fix", "reflash", "unravel",
  "claim", "failure", "make", "go", "wait", "trigger", "signal"
]);

const CURRENCY_OR_LEVEL = [
  "roubles", "euros", "dollars", "level", "ll", "default level"
];

export function getNeededItems() {
  const itemMap = {};

  const parse = (reqStr, sourceName, sourceType) => {
    if (typeof reqStr !== 'string') return;
    const lower = reqStr.toLowerCase().trim();
    if (!lower) return;
    if (CURRENCY_OR_LEVEL.some(k => lower.includes(k))) return;

    const firstWord = lower.split(/\s+/)[0];
    if (ACTION_VERBS.has(firstWord)) return;

    let count = 1;
    let clean = reqStr.trim();

    // "3x Graphics card" / "Graphics card x3"
    const matchX = clean.match(/^(\d+)\s*x\s*(.+)$/i) || clean.match(/^(.+?)\s*x\s*(\d+)$/i);
    if (matchX) {
      if (!isNaN(matchX[1])) { count = parseInt(matchX[1], 10); clean = matchX[2].trim(); }
      else                   { count = parseInt(matchX[2], 10); clean = matchX[1].trim(); }
    } else {
      // "3 Graphics card"
      const matchSpace = clean.match(/^(\d+)\s+(.+)$/);
      if (matchSpace) { count = parseInt(matchSpace[1], 10); clean = matchSpace[2].trim(); }
    }

    if (ACTION_VERBS.has(clean.toLowerCase().split(/\s+/)[0])) return;

    if (!itemMap[clean]) itemMap[clean] = { name: clean, totalCount: 0, uses: [] };
    itemMap[clean].totalCount += count;
    itemMap[clean].uses.push({ source: sourceName, type: sourceType, count });
  };

  state.hideoutTasks.forEach(task => {
    if (state.progress.quests[task.id]?.done) return;
    const reqs = task.requirements || task.objectives || [];
    reqs.forEach(r => parse(r, task.name, 'hideout'));
  });

  state.tasks.forEach(task => {
    if (state.progress.quests[task.id]?.done) return;
    if (isMainTask(task)) return;
    const reqs = task.objectives || task.requirements || [];
    reqs.forEach((r, i) => {
      if (!isObjectiveDone(task.id, i)) parse(r, task.name, 'quest');
    });
  });

  return Object.values(itemMap).sort((a, b) => b.totalCount - a.totalCount);
}

// Imported lazily here to avoid a circular reference with api.js at module-eval time.
import { isObjectiveDone } from './api.js';