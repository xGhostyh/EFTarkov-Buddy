import { state, MAP_IMAGES, MAP_FLOOR_IMAGES, MAP_WEB_URLS, MAP_KEYS_DB, TRADERS, EDITIONS_BONUS } from './data.js';
import { isPinned, isKeyOwned, setKeyOwned, setPins, getPins, isDone, getTraderLL, getTraderRep, setTraderLL, setTraderRep, setSetting, saveProgress } from './api.js';
import { matchesMapFilter, mapKey, esc } from './util.js';
import { openExternalUrl } from './api.js';
import { showToast } from './ui.js';
import { renderQuests } from './render.js';
import { renderBars } from './bars.js';

// ==========================================
// PROFILE VIEW
// ==========================================
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
      <div class="profile-top-row">
        
        <div class="level-card">
          <div class="level-info" style="justify-content: space-evenly;">
            <span class="level-label">Faction</span>
            <img id="profile-faction-img" src="./images/${playerFaction}.png" alt="Faction" style="height: 32px; object-fit: contain; margin-top: 4px; filter: grayscale(1) brightness(1.5);">
          </div>
          <div class="level-controls">
            <button class="btn-level ${playerFaction === 'usec' ? 'active' : ''}" id="btn-faction-usec" style="font-size: 10px;">USEC</button>
            <button class="btn-level ${playerFaction === 'bear' ? 'active' : ''}" id="btn-faction-bear" style="font-size: 10px;">BEAR</button>
          </div>
        </div>

        <div class="level-card">
          <div class="level-info" style="justify-content: space-evenly;">
            <span class="level-label">EOD Edition</span>
            <img id="profile-eod-img" src="./images/eod.png" alt="EOD" style="height: 32px; object-fit: contain; margin-top: 4px; filter: ${hasEod ? 'none' : 'grayscale(100%) opacity(0.3)'}; transition: all 80ms;">
          </div>
          <div class="level-controls" style="justify-content: center; align-items: center; display: flex; padding: 0 12px;">
            <input type="checkbox" id="check-eod" ${hasEod ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer; accent-color: var(--accent);">
          </div>
        </div>

        <div class="level-card">
          <div class="level-info" style="justify-content: space-evenly;">
            <span class="level-label">Unheard Edition</span>
            <img id="profile-unheard-img" src="./images/unheard.png" alt="Unheard" style="height: 32px; object-fit: contain; margin-top: 4px; filter: ${hasUnheard ? 'none' : 'grayscale(100%) opacity(0.3)'}; transition: all 80ms;">
          </div>
          <div class="level-controls" style="justify-content: center; align-items: center; display: flex; padding: 0 12px;">
            <input type="checkbox" id="check-unheard" ${hasUnheard ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer; accent-color: var(--accent);">
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
            <span class="level-value" id="profile-prestige-val" style="color: var(--accent);">${prestigeLevel}</span>
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
              <div class="trader-task-count">${completedTasks}/${totalTasks} TASKS</div>
              <div class="progress-bar-bg">
                <div class="progress-bar-fill" style="width: ${pct}%;"></div>
              </div>

              <div class="trader-details">
                <div class="loyalty-section">
                  <span class="trader-label">Loyalty</span>
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
        <h3>Progress Backup</h3>
        <p style="color: var(--text-dim); font-size: 11px; margin: 0; font-family: var(--f-mono); text-transform: uppercase;">Export your progress before the new season/wipe/prestige level or restore a previous backup.</p>
        <div class="backup-actions">
          <button class="btn-backup" id="btn-export-progress">Export Backup</button>
          <button class="btn-backup" id="btn-import-progress">Import Backup</button>
          <input type="file" id="import-file-input" accept=".json" style="display: none;">
          <button class="btn-backup btn-danger" id="btn-wipe-reset">Wipe / Reset Progress</button>
        </div>
      </div>
    </div>
  `;

  const checkEod = document.getElementById('check-eod');
  checkEod.onchange = async (e) => await changeEdition(e.target.checked ? 'eod' : 'none');

  const checkUnheard = document.getElementById('check-unheard');
  checkUnheard.onchange = async (e) => await changeEdition(e.target.checked ? 'unheard' : 'none');

  document.getElementById('btn-faction-usec').onclick = async () => { await setSetting('player_faction', 'usec'); renderQuests(); };
  document.getElementById('btn-faction-bear').onclick = async () => { await setSetting('player_faction', 'bear'); renderQuests(); };

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

  document.getElementById('btn-wipe-reset').onclick = async () => {
    if (confirm("⚠️ Are you sure you want to reset all progress?\nThis cannot be undone.")) {
      state.progress = { schemaVersion: 2, settings: {}, traders: {}, quests: {}, pins: {}, keys: {} };
      await saveProgress(state.progress);
      renderQuests();
      showToast("Wipe reset completed.");
    }
  };

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

// Helper to calculate exact zoom requirements dynamically across screen resizes
function fitMapToContainer(map, bounds) {
  if (!map) return;
  map.invalidateSize();
  map.setMinZoom(-10);
  const fitZoom = map.getBoundsZoom(bounds, false);
  map.setZoom(fitZoom);
  map.setMinZoom(fitZoom);
  map.fitBounds(bounds, { padding: [0, 0] });
}

// ==========================================
// MAPS VIEW (Leaflet)
// ==========================================
export function renderMaps(container) {
  let mapImgSrc = MAP_IMAGES[state.selectedOnlyMap] || './images/customs.png';
  
  if (MAP_FLOOR_IMAGES[state.selectedOnlyMap]) {
    const floors = MAP_FLOOR_IMAGES[state.selectedOnlyMap];
    if (!floors[state.selectedMapFloor]) {
      state.selectedMapFloor = Object.keys(floors)[0];
    }
    mapImgSrc = floors[state.selectedMapFloor];
  }

  const mapWebUrl = MAP_WEB_URLS[state.selectedOnlyMap] || "https://tarkov-market.com/maps/";
  const keysList = MAP_KEYS_DB[state.selectedOnlyMap] || [];
  const wikiUrl = "https://escapefromtarkov.fandom.com/wiki/Keys_%26_Intel#Keys_&_Keycards";

  const mapFilteredQuests = state.tasks.filter(t => {
    return matchesMapFilter(t.map, state.selectedOnlyMap) && isPinned(t.id);
  });

  container.innerHTML = `
    <div class="map-view-card">
      <div id="map-outer-wrapper">
        <div id="leaflet-map-container"></div>
        
        ${MAP_FLOOR_IMAGES[state.selectedOnlyMap] ? `
          <div id="map-floor-selector" style="position: absolute; bottom: 0; left: 0; z-index: 1000; display: flex; gap: 1px; padding: 10px;">
            ${Object.keys(MAP_FLOOR_IMAGES[state.selectedOnlyMap]).map((floor) => `
              <button class="map-ui-btn ${floor === state.selectedMapFloor ? 'active' : ''}" data-floor="${floor}">
                ${floor}
              </button>
            `).join('')}
          </div>
        ` : ''}

        <div class="map-hint-tooltip">
          CLICK MAP TO ADD PIN
        </div>

        <div style="position: absolute; bottom: 0; right: 0; z-index: 1000; padding: 10px;">
          <button class="map-ui-btn map-ui-btn-gold" id="btn-open-interactive-map">
            <svg class="svg-icon" viewBox="0 0 24 24" style="width:14px; height:14px;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            Open Interactive Map
          </button>
        </div>
      </div>

      <div class="map-sidebar-panels" style="display: flex; flex-direction: column; gap: 1px; width: 340px; flex-shrink: 0; height: 100%; overflow-y: auto; background: var(--border);">
        <div class="map-keys-card" style="width: 100%;">
          <h3 style="margin-top: 0; display: flex; justify-content: space-between; align-items: center; font-family: var(--f-head); font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">
            <a href="${wikiUrl}" id="link-important-keys" style="color: var(--text); text-decoration: none; display: flex; align-items: center; gap: 6px;">
              <svg class="svg-icon" viewBox="0 0 24 24" style="width:16px; height:16px;"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
              Important Keys
            </a>
            <svg class="svg-icon" viewBox="0 0 24 24" style="width:12px; height:12px; color: var(--text-mute);"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </h3>
          <div class="keys-list">
            ${keysList.length > 0 ? keysList.map(keyName => {
              const kId = `key_${state.selectedOnlyMap.replace(/\s+/g, '')}_${keyName.replace(/\s+/g, '')}`;
              const checked = isKeyOwned(kId);
              return `
                <label class="key-item" style="color: ${checked ? 'var(--ok)' : 'var(--text)'};">
                  <input type="checkbox" data-key="${kId}" ${checked ? 'checked' : ''} style="accent-color: var(--accent);">
                  <span>${esc(keyName)}</span>
                </label>
              `;
            }).join('') : `<p style="color: var(--text-mute); font-size: 11px; font-family: var(--f-mono); text-transform: uppercase;">No keys registered.</p>`}
          </div>
        </div>

        <div class="map-quests-card" style="background-color: var(--bg); padding: 16px; display: flex; flex-direction: column; gap: 10px; flex: 1;">
          <h3 style="margin: 0; border-bottom: 1px solid var(--border); padding-bottom: 8px;">
            <a href="#" id="map-quests-title-link" style="font-family: var(--f-head); font-size: 14px; color: var(--accent); text-decoration: none; display: flex; align-items: center; gap: 6px; text-transform: uppercase; letter-spacing: 0.05em;">
              <svg class="svg-icon" viewBox="0 0 24 24" style="width:14px; height:14px;"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/></svg>
              Active Quests (${mapFilteredQuests.length})
            </a>
          </h3>
          <div class="map-quests-list" style="display: flex; flex-direction: column; gap: 4px; max-height: 25vh; overflow-y: auto;">
            ${mapFilteredQuests.length > 0 ? mapFilteredQuests.map(quest => `
              <div class="map-quest-item" style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; padding: 6px 8px; background-color: var(--surface); color: var(--text);">
                <span style="font-family: var(--f-body); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-right: 8px;">${esc(quest.name)}</span>
                <span style="font-family: var(--f-mono); font-size: 10px; color: var(--text-mute); border: 1px solid var(--border); padding: 2px 4px; flex-shrink: 0; text-transform:uppercase;">${esc(quest.trader || 'Quest')}</span>
              </div>
            `).join('') : `<p style="color: var(--text-mute); font-size: 11px; font-family: var(--f-mono); text-transform: uppercase;">No active (pinned) quests for this map.</p>`}
          </div>
        </div>
      </div>
    </div>
  `;

  const currentMapKey = mapKey(state.selectedOnlyMap, state.selectedMapFloor);
  
  if (MAP_FLOOR_IMAGES[state.selectedOnlyMap]) {
    container.querySelectorAll('.map-floor-btn, .map-ui-btn[data-floor]').forEach(btn => {
      btn.onclick = (e) => {
        state.selectedMapFloor = e.currentTarget.dataset.floor;
        renderQuests();
      };
    });
  }

  setTimeout(() => {
    const mapElement = document.getElementById('leaflet-map-container');
    if (!mapElement) return;

    if (state.activeMapKey !== currentMapKey) {
      if (state.currentLeafletMap) {
        state.currentLeafletMap.remove();
        state.currentLeafletMap = null;
      }
      state.activeMapKey = currentMapKey;

      state.currentLeafletMap = L.map('leaflet-map-container', {
        crs: L.CRS.Simple,
        zoomControl: false,
        attributionControl: false,
        zoomDelta: 0.5,
        zoomSnap: 0,
        minZoom: -5,
        maxZoom: 5,
        scrollWheelZoom: 'center',
        wheelPxPerZoomLevel: 120
      });

      L.control.zoom({ position: 'topright' }).addTo(state.currentLeafletMap);
      state.currentPinLayer = L.layerGroup().addTo(state.currentLeafletMap);

      const img = new Image();
      img.src = mapImgSrc;
      img.onload = () => {
        const imgW = img.naturalWidth || 4096;
        const imgH = img.naturalHeight || 4096;
        const bounds = [[0, 0], [imgH, imgW]];
        
        L.imageOverlay(mapImgSrc, bounds).addTo(state.currentLeafletMap);

        setTimeout(() => {
          fitMapToContainer(state.currentLeafletMap, bounds);

          const zoomControl = document.querySelector('.leaflet-control-zoom');
          if (zoomControl && !document.getElementById('btn-reset-map-view')) {
            const resetBtn = document.createElement('a');
            resetBtn.id = 'btn-reset-map-view';
            resetBtn.href = '#';
            resetBtn.title = 'Reset Map View';
            resetBtn.innerHTML = '⛶';
            resetBtn.style.fontSize = '14px';
            resetBtn.style.display = 'flex';
            resetBtn.style.alignItems = 'center';
            resetBtn.style.justifyContent = 'center';
            resetBtn.style.color = 'var(--text)';
            
            resetBtn.onclick = (e) => {
              e.preventDefault();
              e.stopPropagation();
              fitMapToContainer(state.currentLeafletMap, bounds);
            };
            zoomControl.appendChild(resetBtn);
          }

          if (window.mapResizeObserver) window.mapResizeObserver.disconnect();

          let resizeTimeout;
          window.mapResizeObserver = new ResizeObserver(() => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
              if (state.currentLeafletMap) {
                fitMapToContainer(state.currentLeafletMap, bounds);
              }
            }, 100);
          });
          window.mapResizeObserver.observe(mapElement);

          const refreshPins = () => {
            state.currentPinLayer.clearLayers();
            const savedPins = getPins(currentMapKey);
            
            savedPins.forEach((pin, index) => {
              const customIcon = L.divIcon({
                className: 'custom-map-pin-wrapper',
                html: `<div style="color: var(--accent); font-family: var(--f-mono); font-size: 11px; font-weight: 500; text-shadow: 0 1px 2px #000, 0 0 4px #000; white-space: nowrap; display: inline-flex; align-items: center; gap: 4px; background: rgba(10,10,11,0.8); padding: 2px 6px; border: 1px solid var(--border); text-transform:uppercase; letter-spacing:0.05em;">
                        <span>${esc(pin.text)}</span>
                        <button class="btn-delete-pin" data-idx="${index}" style="background: none; border: none; padding: 0 2px; cursor: pointer; color: #ff5252; font-size: 10px;" title="Delete pin">✕</button>
                      </div>`,
                iconSize: null,
                iconAnchor: [0, 12]
              });
              
              L.marker([pin.lat, pin.lng], { 
                icon: customIcon,
                bubblingMouseEvents: false 
              }).addTo(state.currentPinLayer);
            });
          };

          refreshPins();

          state.currentLeafletMap.on('click', async (e) => {
            const deleteBtn = e.originalEvent.target.closest('.btn-delete-pin');
            
            if (deleteBtn) {
              L.DomEvent.stopPropagation(e); 
              const index = parseInt(deleteBtn.dataset.idx, 10);
              const savedPins = getPins(currentMapKey);
              
              if (Number.isFinite(index) && savedPins[index]) {
                const newPins = [...savedPins];
                newPins.splice(index, 1);
                await setPins(currentMapKey, newPins);
                refreshPins(); 
                showToast("Pin removed");
              }
              return; 
            }

            const pinText = prompt("Enter the name of the mission or objective for this pin:");
            if (!pinText || !pinText.trim()) return;

            const newPin = { lat: e.latlng.lat, lng: e.latlng.lng, text: pinText.trim() };
            const newPins = [...getPins(currentMapKey), newPin];
            
            await setPins(currentMapKey, newPins);
            refreshPins(); 
            showToast("Pin added successfully");
          });
        }, 50); 
      };
      
      img.onerror = () => {
        mapElement.innerHTML = `<div style="color: #ff8282; font-family:var(--f-mono); text-transform:uppercase; padding: 40px; text-align:center;">Image not found: ${mapImgSrc}</div>`;
      };
    }
  }, 50);

  document.getElementById('btn-open-interactive-map')?.addEventListener('click', (e) => {
    e.preventDefault();
    openExternalUrl(mapWebUrl);
  });

  document.getElementById('link-important-keys')?.addEventListener('click', (e) => {
    e.preventDefault();
    openExternalUrl(wikiUrl);
  });

  document.getElementById('map-quests-title-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    state.selectedType = "SIDE";
    state.selectedMap = state.selectedOnlyMap;
    state.statusFilter = "ACTIVE";
    
    document.querySelectorAll('#type-bar .nav-btn').forEach(b => {
      b.classList.toggle('selected-type', b.dataset.type === "SIDE");
    });
    renderBars();
    renderQuests();
  });

  container.querySelectorAll('.keys-list input[type="checkbox"]').forEach(chk => {
    chk.onchange = async (e) => {
      await setKeyOwned(e.target.dataset.key, e.target.checked);
      const parentLabel = e.target.parentElement;
      if (parentLabel) parentLabel.style.color = e.target.checked ? 'var(--ok)' : 'var(--text)';
    };
  });
}