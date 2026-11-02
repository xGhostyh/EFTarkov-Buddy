// Structured reputation parsing — replaces the fragile regex-on-display approach.

import { TRADERS, NEGATIVE_REP_TRADERS, TRADER_REQUIREMENTS } from './data.js';
import { state } from './data.js';
import { getTraderRep, setTraderRep, getTraderLL, setTraderLL } from './api.js';
import { showToast } from './ui.js';

// Parse a rewards string into an array of { trader, delta }.
export function parseRepChanges(rewardsStr) {
  if (typeof rewardsStr !== 'string') return [];
  const out = [];
  for (const trader of TRADERS) {
    if (trader === "ALL TRADERS") continue;
    const re = new RegExp(
      `${escapeRegExp(trader)}\\s+rep\\s*([+-]?\\d*\\.?\\d+)`,
      'i'
    );
    const m = rewardsStr.match(re);
    if (!m) continue;
    const delta = parseFloat(m[1]);
    if (Number.isFinite(delta) && delta !== 0) out.push({ trader, delta });
  }
  return out;
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function applyQuestReputation(task, isCompleting) {
  const changes = parseRepChanges(task.rewards);
  for (const { trader, delta } of changes) {
    const prev = getTraderRep(trader);
    // Only Fence can go negative — everyone else clamps at 0.
    const raw = isCompleting ? prev + delta : prev - delta;
    const next = NEGATIVE_REP_TRADERS.has(trader) ? raw : Math.max(0, raw);
    await setTraderRep(trader, Number(next.toFixed(2)));
    await checkAutoTraderLL(trader); // Auto-level up trader if thresholds are met
  }
}

export async function checkAutoTraderLL(traderName) {
  const reqs = TRADER_REQUIREMENTS[traderName];
  if (!reqs) return;

  const playerLevel = Number(state.progress.settings?.level) || 1;
  const currentRep = getTraderRep(traderName) || 0.00;
  const oldLL = Number(getTraderLL(traderName)) || 1;

  let calculatedLL = 1;
  for (const req of reqs) {
    if (currentRep >= req.rep && playerLevel >= req.level) {
      calculatedLL = req.ll;
    }
  }

  // Update LL in local state & backend
  if (calculatedLL > oldLL) {
  await setTraderLL(traderName, calculatedLL);
  
  // Delay by 800ms so it doesn't collide with the Quest Completed toast
  setTimeout(() => {
    showToast(`🎖️ ${traderName} leveled up to Level ${calculatedLL}!`, "success");
  }, 1500);
} else if (calculatedLL < oldLL) {
    await setTraderLL(traderName, calculatedLL);
  }
}

// Helper to check all traders at once (e.g., when Player Level changes)
export async function checkAllTradersLL() {
  for (const traderName of Object.keys(TRADER_REQUIREMENTS)) {
    await checkAutoTraderLL(traderName);
  }
}