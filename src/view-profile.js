import { state, TRADERS, EDITIONS_BONUS } from './data.js';
import { isDone, getTraderLL, getTraderRep, setTraderLL, setTraderRep, setSetting, saveProgress } from './api.js';
import { showToast } from './ui.js';
import { esc } from './util.js';
import { renderQuests } from './render.js';
import { updateCounters } from './bars.js';

export async function changeEdition(newEditionStr) {
  let currentEdition = state.progress.settings.edition || 'none';
  if (currentEdition === newEditionStr) return;

  for (let trader of TRADERS) {
    if (trader === "ALL TRADERS") continue;
    let oldBonus = (EDITIONS_BONUS[currentEdition] && EDITIONS_BONUS[currentEdition][trader]) || 0;
    let newBonus = (EDITIONS_BONUS[newEditionStr] && EDITIONS_BONUS[newEditionStr][trader]) || 0;
    
    let diff = newBonus - oldBonus;
    if (diff !== 0) {
      let currentRep = parseFloat(getTraderRep(trader)) || 0.00;
      currentRep += diff;
      // Only clamp to 0 if it's not Fence (who can go negative)
      if (trader !== "Fence") currentRep = Math.max(0, currentRep);
      await setTraderRep(trader, Number(currentRep.toFixed(2)));
    }
  }

  await setSetting('edition', newEditionStr);
  renderQuests();
}

export function renderProfile(container) {
  const userLevel = state.progress.settings.level || 1;
  const prestigeLevel = state.progress.settings.prestige || 0;
  const playerFaction = state.progress.settings.faction || 'usec';
  
  const edition = state.progress.settings.edition || 'none';
  const hasEod = edition === 'eod';
  const hasUnheard = edition === 'unheard';
  
  const profileTraders = TRADERS.filter(t => t !== "ALL TRADERS");

  container.innerHTML = `
    <div class="profile-container">
      <div style="display: flex; gap: 15px; flex-wrap: wrap;">
        
        <div class="level-card">
          <div class="level-info" style="justify-content: space-evenly;">
            <span class="level-label">Faction</span>
            <img id="profile-faction-img" src="./images/${playerFaction}.png" alt="Faction" style="height: 38px; object-fit: contain; margin-top: 4px;">
          </div>
          <div class="level-controls">
            <button class="btn-level ${playerFaction === 'usec' ? 'active' : ''}" id="btn-faction-usec" style="font-size: 0.7rem;">USEC</button>
            <button class="btn-level ${playerFaction === 'bear' ? 'active' : ''}" id="btn-faction-bear" style="font-size: 0.7rem;">BEAR</button>
          </div>
        </div>

        <div class="level-card">
          <div class="level-info" style="justify-content: space-evenly;">
            <span class="level-label">EOD Edition</span>
            <img id="profile-eod-img" src="./images/eod.png" alt="EOD" style="height: 38px; object-fit: contain; margin-top: 4px; filter: ${hasEod ? 'none' : 'grayscale(100%) opacity(0.5)'}; transition: all 0.3s ease;">
          </div>
          <div class="level-controls" style="justify-content: center; align-items: center; display: flex;">
            <input type="checkbox" id="check-eod" ${hasEod ? 'checked' : ''} style="width: 22px; height: 22px; cursor: pointer; accent-color: var(--accent-gold, #d2b98a);">
          </div>
        </div>

        <div class="level-card">
          <div class="level-info" style="justify-content: space-evenly;">
            <span class="level-label">Unheard Edition</span>
            <img id="profile-unheard-img" src="./images/unheard.png" alt="Unheard" style="height: 38px; object-fit: contain; margin-top: 4px; filter: ${hasUnheard ? 'none' : 'grayscale(100%) opacity(0.5)'}; transition: all 0.3s ease;">
          </div>
          <div class="level-controls" style="justify-content: center; align-items: center; display: flex;">
            <input type="checkbox" id="check-unheard" ${hasUnheard ? 'checked' : ''} style="width: 22px; height: 22px; cursor: pointer; accent-color: var(--accent-gold, #d2b98a);">
          </div>
        </div>

        <div class="level-card">
          <div class="level-info">
            <span class="level-label">Level</span>
            <span class="level-value" id="profile-level-val">${userLevel}</span>
          </div>
          <div class="level-controls">
            <button class="btn-level" id="btn-level-up">▲</button>
            <button class="btn-level" id="btn-level-down">▼</button>
          </div>
        </div>

        <div class="level-card">
          <div class="level-info">
            <span class="level-label">Prestige</span>
            <span class="level-value" id="profile-prestige-val" style="color: var(--alert);">${prestigeLevel}</span>
          </div>
          <div class="level-controls">
            <button class="btn-level" id="btn-prestige-up">▲</button>
            <button class="btn-level" id="btn-prestige-down">▼</button>
          </div>
        </div>
      </div>

      <div class="traders-grid">
        ${profileTraders.map(trader => {
          const traderTasks = state.tasks.filter(t => !t.is_main && t.trader === trader);
          const totalTasks = traderTasks.length;
          const completedTasks = traderTasks.filter(t => isDone(t.id)).length;
          const pct = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : "0.0";

          const currentLL = getTraderLL(trader);
          const currentRep = getTraderRep(trader).toFixed(2);

          return `
            <div class="trader-card">
              <div class="trader-card-header">
                <span class="trader-name">${esc(trader)}</span>
                <span class="trader-pct">${pct}%</span>
              </div>
              <div class="trader-task-count">${completedTasks}/${totalTasks} tasks</div>
              <div class="progress-bar-bg">
                <div class="progress-bar-fill" style="width: ${pct}%;"></div>
              </div>

              <div class="trader-details">
                <div class="loyalty-section">
                  <span class="trader-label">Loyalty Level</span>
                  <div class="loyalty-selector">
                    ${[1, 2, 3, 4].map(ll => `
                      <button class="loyalty-btn ${ll === Number(currentLL) ? 'active' : ''}" data-trader="${trader}" data-ll="${ll}">
                        ${ll}
                      </button>
                    `).join('')}
                  </div>
                </div>
                <div class="rep-section">
                  <span class="trader-label">Reputation</span>
                  <input type="number" step="0.01" class="rep-input" data-trader="${trader}" value="${currentRep}">
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div class="backup-section">
        <h3>💾 Prestige/Season Reset & Progress Backup</h3>
        <p style="color: var(--text-muted); font-size: 0.85rem; margin: 0;">
          Export your progress before the new season/wipe/prestige level or restore a previous backup.
        </p>
        <div class="backup-actions">
          <button class="btn-backup" id="btn-export-progress">📤 Export Backup</button>
          <button class="btn-backup" id="btn-import-progress">📥 Import Backup</button>
          <input type="file" id="import-file-input" accept=".json" style="display: none;">
          <button class="btn-backup btn-danger" id="btn-wipe-reset">⚠️ Wipe / Reset Progress</button>
        </div>
      </div>
    </div>
  `;

  // --- Event Listeners ---

  const checkEod = document.getElementById('check-eod');
  checkEod.onchange = async (e) => {
    await changeEdition(e.target.checked ? 'eod' : 'none');
  };

  const checkUnheard = document.getElementById('check-unheard');
  checkUnheard.onchange = async (e) => {
    await changeEdition(e.target.checked ? 'unheard' : 'none');
  };

  document.getElementById('btn-faction-usec').onclick = async () => {
    await setSetting('player_faction', 'usec');
    renderQuests();
  };
  document.getElementById('btn-faction-bear').onclick = async () => {
    await setSetting('player_faction', 'bear');
    renderQuests();
  };

  document.getElementById('btn-level-up').onclick = async () => {
    const next = userLevel + 1;
    await setSetting('player_level', next);
    document.getElementById('profile-level-val').innerText = next;
  };
  document.getElementById('btn-level-down').onclick = async () => {
    if (userLevel > 1) {
      const next = userLevel - 1;
      await setSetting('player_level', next);
      document.getElementById('profile-level-val').innerText = next;
    }
  };

  document.getElementById('btn-prestige-up').onclick = async () => {
    if (prestigeLevel < 6) {
      const next = prestigeLevel + 1;
      await setSetting('player_prestige', next);
      document.getElementById('profile-prestige-val').innerText = next;
    }
  };
  document.getElementById('btn-prestige-down').onclick = async () => {
    if (prestigeLevel > 0) {
      const next = prestigeLevel - 1;
      await setSetting('player_prestige', next);
      document.getElementById('profile-prestige-val').innerText = next;
    }
  };

  // Export
  document.getElementById('btn-export-progress').onclick = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.progress, null, 2));
    const downloadAnchor = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `eftarkov_buddy_backup_${date}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Saved on Downloads folder");
  };

  // Import
  const fileInput = document.getElementById('import-file-input');
  document.getElementById('btn-import-progress').onclick = () => fileInput.click();
  fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (imported && typeof imported === 'object' && imported.schemaVersion === 2) {
          state.progress = imported;
          await saveProgress(state.progress);
          renderQuests();
          showToast("Backup imported successfully!");
        } else {
          alert("⚠️ Invalid backup file format or outdated schema.");
        }
      } catch (err) {
        alert("⚠️ Error parsing backup file.");
      }
    };
    reader.readAsText(file);
  };

  // Wipe
  document.getElementById('btn-wipe-reset').onclick = async () => {
    if (confirm("⚠️ Are you sure you want to reset all progress?\nThis cannot be undone.")) {
      state.progress = { schemaVersion: 2, settings: {}, traders: {}, quests: {}, pins: {}, keys: {} };
      await saveProgress(state.progress);
      renderQuests();
      showToast("Wipe reset completed.");
    }
  };

  // Trader Inputs
  container.querySelectorAll('.loyalty-btn').forEach(btn => {
    btn.onclick = async (e) => {
      const trader = e.target.dataset.trader;
      const ll = e.target.dataset.ll;
      await setTraderLL(trader, ll);
      const parent = e.target.parentElement;
      parent.querySelectorAll('.loyalty-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
    };
  });

  container.querySelectorAll('.rep-input').forEach(input => {
    input.onchange = async (e) => {
      const trader = e.target.dataset.trader;
      const val = parseFloat(e.target.value) || 0.00;
      await setTraderRep(trader, val.toFixed(2));
    };
  });
}