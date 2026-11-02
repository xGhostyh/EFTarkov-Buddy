// Structured reputation parsing — replaces the fragile regex-on-display approach.

import { TRADERS, NEGATIVE_REP_TRADERS } from './data.js';
import { getTraderRep, setTraderRep } from './api.js';

// Parse a rewards string into an array of { trader, delta }.
// Handles: "Prapor rep +0.05", "Therapist rep +0.02, Fence rep -0.10",
//          "Prapor rep +0.05 (some note)", "(Prapor rep +0.05)"
export function parseRepChanges(rewardsStr) {
  if (typeof rewardsStr !== 'string') return [];
  const out = [];
  for (const trader of TRADERS) {
    if (trader === "ALL TRADERS") continue;
    // Match "<Trader> rep <signed number>" anywhere in the string.
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
  }
}