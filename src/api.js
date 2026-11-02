// Tauri bridge + persistence layer.

import { state, SCHEMA_VERSION } from './data.js';

let invoke;
let tauriOpen;

export function initTauriApi() {
  if (window.__TAURI__ && window.__TAURI__.core) {
    invoke = window.__TAURI__.core.invoke;
  } else if (window.__TAURI_INTERNALS__ && window.__TAURI_INTERNALS__.invoke) {
    invoke = window.__TAURI_INTERNALS__.invoke;
  }

  if (window.__TAURI__ && window.__TAURI__.shell) {
    tauriOpen = window.__TAURI__.shell.open;
  }
}

export function hasBackend() { return !!invoke; }

export async function loadAll() {
  const rawTasks = await invoke('load_quests');
  const rawHideout = await invoke('load_hideout');
  const rawProgress = await invoke('load_progress');
  return {
    tasks: rawTasks,
    hideoutTasks: rawHideout,
    progress: migrateProgress(rawProgress || {})
  };
}

export async function saveProgress(progress) {
  if (!invoke) return;
  await invoke('save_progress', { progress });
}

export async function openExternalUrl(url) {
  if (!url) return;
  let opened = false;
  try {
    if (tauriOpen) {
      await tauriOpen(url);
      opened = true;
    }
  } catch (err) {
    console.warn("Tauri shell.open failed:", err);
  }
  if (!opened) window.open(url, '_blank', 'noopener,noreferrer');
}

export async function getAppVersion() {
  try {
    if (window.__TAURI__ && window.__TAURI__.app && window.__TAURI__.app.getVersion) {
      return await window.__TAURI__.app.getVersion();
    }
  } catch { /* noop */ }
  return null;
}

// ---------- Progress schema v1 → v2 migration ----------
//
// v2 shape:
// {
//   schemaVersion: 2,
//   settings: { edition: 'none'|'eod'|'unheard', level, faction, prestige },
//   traders: { Prapor: { ll, rep }, ... },
//   quests:  { [taskId]: { done, pinned, folded, objectives: { [i]: true } } },
//   pins:    { 'Customs_main': [{ lat, lng, text }] },
//   keys:    { [keyId]: true }
// }

export function emptyProgress() {
  return { schemaVersion: SCHEMA_VERSION, settings: {}, traders: {}, quests: {}, pins: {}, keys: {}, notes: ""};
}

export function migrateProgress(raw) {
  if (!raw || typeof raw !== 'object') return emptyProgress();
  if (raw.schemaVersion === SCHEMA_VERSION) return raw;

  // Migrate from v1 flat bag.
  const out = emptyProgress();

  out.settings.edition = raw['edition_unheard'] ? 'unheard'
    : raw['edition_eod'] ? 'eod' : 'none';
  out.settings.level = Number(raw['player_level']) || 1;
  out.settings.faction = raw['player_faction'] || 'usec';
  out.settings.prestige = Number(raw['player_prestige']) || 0;

  for (const [key, val] of Object.entries(raw)) {
    if (key.startsWith('trader_ll_')) {
      const t = key.slice('trader_ll_'.length);
      out.traders[t] = out.traders[t] || {};
      out.traders[t].ll = Number(val) || 1;
    } else if (key.startsWith('trader_rep_')) {
      const t = key.slice('trader_rep_'.length);
      out.traders[t] = out.traders[t] || {};
      out.traders[t].rep = Number(val) || 0;
    } else if (key.startsWith('custom_pins_')) {
      out.pins[key.slice('custom_pins_'.length)] = Array.isArray(val) ? val : [];
    } else if (key.startsWith('key_')) {
      if (val) out.keys[key] = true;
    } else if (key === 'edition_eod' || key === 'edition_unheard' ||
               key === 'player_level' || key === 'player_faction' ||
               key === 'player_prestige') {
      // already handled
    } else if (key.endsWith('_obj_')) {
      // no-op fallback
    } else if (key.includes('_obj_')) {
      const [taskId, idxStr] = key.split('_obj_');
      const idx = parseInt(idxStr, 10);
      if (Number.isFinite(idx)) {
        out.quests[taskId] = out.quests[taskId] || {};
        out.quests[taskId].objectives = out.quests[taskId].objectives || {};
        out.quests[taskId].objectives[idx] = !!val;
      }
    } else if (key.endsWith('_pinned')) {
      const taskId = key.slice(0, -'_pinned'.length);
      out.quests[taskId] = out.quests[taskId] || {};
      out.quests[taskId].pinned = !!val;
    } else if (key.endsWith('_folded')) {
      const taskId = key.slice(0, -'_folded'.length);
      out.quests[taskId] = out.quests[taskId] || {};
      out.quests[taskId].folded = !!val;
    } else {
      // Bare task completion flag
      out.quests[key] = out.quests[key] || {};
      out.quests[key].done = !!val;
    }
  }

  return out;
}

// Convenience accessors — all mutation goes through these.

export function isDone(taskId)          { return !!(state.progress.quests[taskId]?.done); }
export function isPinned(taskId)        { return !!(state.progress.quests[taskId]?.pinned); }
export function isFolded(taskId)        { return !!(state.progress.quests[taskId]?.folded); }
export function isObjectiveDone(taskId, i) { return !!(state.progress.quests[taskId]?.objectives?.[i]); }
export function isKeyOwned(keyId)       { return !!state.progress.keys[keyId]; }
export function getTraderLL(trader)     { return state.progress.traders[trader]?.ll ?? 1; }
export function getTraderRep(trader)    { return state.progress.traders[trader]?.rep ?? 0; }
export function getSetting(key, fallback) { return state.progress.settings[key] ?? fallback; }

function ensureQuest(taskId) {
  state.progress.quests[taskId] = state.progress.quests[taskId] || {};
  return state.progress.quests[taskId];
}
function ensureTrader(trader) {
  state.progress.traders[trader] = state.progress.traders[trader] || {};
  return state.progress.traders[trader];
}

export async function setQuestDone(taskId, done) {
  ensureQuest(taskId).done = !!done;
  if (done) ensureQuest(taskId).pinned = false;
  await saveProgress(state.progress);
}
export async function setQuestPinned(taskId, pinned) {
  ensureQuest(taskId).pinned = !!pinned;
  await saveProgress(state.progress);
}
export async function setQuestFolded(taskId, folded) {
  ensureQuest(taskId).folded = !!folded;
  await saveProgress(state.progress);
}
export async function setObjectiveDone(taskId, i, done) {
  const q = ensureQuest(taskId);
  q.objectives = q.objectives || {};
  q.objectives[i] = !!done;
  await saveProgress(state.progress);
}
export async function setKeyOwned(keyId, owned) {
  if (owned) state.progress.keys[keyId] = true;
  else delete state.progress.keys[keyId];
  await saveProgress(state.progress);
}
export async function setTraderLL(trader, ll) {
  ensureTrader(trader).ll = ll;
  await saveProgress(state.progress);
}
export async function setTraderRep(trader, rep) {
  ensureTrader(trader).rep = rep;
  await saveProgress(state.progress);
}
export async function setSetting(key, val) {
  state.progress.settings[key] = val;
  await saveProgress(state.progress);
}
export async function setPins(mapKey, pins) {
  state.progress.pins[mapKey] = pins;
  await saveProgress(state.progress);
}

export async function setNotes(text) {
  state.progress.notes = text;
  await saveProgress(state.progress);
}

export function getNotes() {
  return state.progress.notes || "";
}
export function getPins(mapKey) {
  return state.progress.pins[mapKey] || [];
}