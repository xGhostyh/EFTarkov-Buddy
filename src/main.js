let invoke, open;

function initTauriApi() {
  if (window.__TAURI__ && window.__TAURI__.core) {
    invoke = window.__TAURI__.core.invoke;
  } else if (window.__TAURI_INTERNALS__ && window.__TAURI_INTERNALS__.invoke) {
    invoke = window.__TAURI_INTERNALS__.invoke;
  }

  if (window.__TAURI__ && window.__TAURI__.shell) {
    open = window.__TAURI__.shell.open;
  }
}

async function openExternalUrl(url) {
  if (!url) return;

  let opened = false;

  try {
    if (window.__TAURI__ && window.__TAURI__.shell && window.__TAURI__.shell.open) {
      await window.__TAURI__.shell.open(url);
      opened = true;
    } else if (window.__TAURI_INTERNALS__ && window.__TAURI_INTERNALS__.plugins && window.__TAURI_INTERNALS__.plugins.shell) {
      await window.__TAURI__.plugins.shell.open(url);
      opened = true;
    }
  } catch (err) {
    console.warn("Permiso denegado o error en Tauri shell.open:", err);
  }

  if (!opened) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

function showToast(message) {
  let toast = document.getElementById('toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.className = 'toast-notification';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<span>💾 ${message}</span>`;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

const TRADERS = ["ALL TRADERS", "Prapor", "Therapist", "Fence", "Skier", "Peacekeeper", "Mechanic", "Ragman", "Jaeger", "Ref", "Lightkeeper", "BTR Driver"];
const STORY_CHAPTERS = [
  "All Chapters",
  "Tour",
  "Falling Skies",
  "Batya",
  "The Unheard",
  "Blue Fire",
  "They Are Already Here",
  "Accidental Witness",
  "The Labyrinth",
  "The Ticket",
  "Boreas"
];
const MAIN_MAPS = ["ALL MAPS", "Customs", "Woods", "Factory", "Reserve", "Interchange", "Shoreline", "Streets of Tarkov", "Ground Zero", "Lighthouse", "The Lab", "Any Location"];
const ONLY_MAPS_LIST = ["Customs", "Woods", "Factory", "Reserve", "Interchange", "Shoreline", "Streets of Tarkov", "Ground Zero", "Lighthouse", "The Lab"];

const HIDEOUT_MODULES = [
  "All Modules",
  "Security",
  "Generator",
  "Lavatory",
  "Workbench",
  "Medstation",
  "Nutrition Unit",
  "Vents",
  "Heating",
  "Illumination",
  "Rest Space",
  "Water Collector",
  "Intelligence Center",
  "Shooting Range",
  "Weapon Rack",
  "Defective Wall",
  "Gym",
  "Gear Rack",
  "Hall of Fame",
  "Air Filtering Unit",
  "Bitcoin Farm",
  "Booze Generator",
  "Cultist Circle",
  "Library",
  "Scav Case",
  "Solar Power",
  "Stash"
];

const MAP_IMAGES = {
  "Customs": "./images/customs.png",
  "Woods": "./images/woods.png",
  "Factory": "./images/factory.png",
  "Reserve": "./images/reserve.png",
  "Interchange": "./images/interchange.png",
  "Shoreline": "./images/shoreline.png",
  "Streets of Tarkov": "./images/streets.png",
  "Ground Zero": "./images/ground_zero.png",
  "Lighthouse": "./images/lighthouse.png",
  "The Lab": "./images/the_lab.png"
};

// Base de datos de 3 plantas para los mapas permitidos (puedes ajustar los nombres de archivo PNG en ./images/)
const MAP_FLOOR_IMAGES = {
  "Customs": {
    "Dorms": "./images/customs_dorms.png",
    "Main": "./images/customs.png"
  },
  "Factory": {
    "Basement": "./images/factory_b.png",
    "Main": "./images/factory.png",
    "Level 2": "./images/factory_floor2.png",
    "Level 3": "./images/factory_floor3.png"
  },
  "Reserve": {
    "Bunker": "./images/reserve_b.png",
    "Main": "./images/reserve.png"
  },
  "Interchange": {
    "Ground Floor": "./images/interchange.png",
    "Level 2": "./images/interchange_2.png",
    "Level 3": "./images/interchange_3.png"
  },
  "Shoreline": {
    "Resort": "./images/shoreline_r.png",
    "Floor 2": "./images/shoreline.png",
  },
  "The Lab": {
    "Floor 1": "./images/the_lab_floor1.png",
    "Floor 2": "./images/the_lab.png",
    "Floor 3": "./images/the_lab_floor3.png"
  }
};

const MAP_WEB_URLS = {
  "Customs": "https://tarkov-market.com/maps/customs",
  "Woods": "https://tarkov-market.com/maps/woods",
  "Factory": "https://tarkov-market.com/maps/factory",
  "Reserve": "https://tarkov-market.com/maps/reserve",
  "Interchange": "https://tarkov-market.com/maps/interchange",
  "Shoreline": "https://tarkov-market.com/maps/shoreline",
  "Streets of Tarkov": "https://tarkov-market.com/maps/streets",
  "Ground Zero": "https://tarkov-market.com/maps/ground-zero",
  "Lighthouse": "https://tarkov-market.com/maps/lighthouse",
  "The Lab": "https://tarkov-market.com/maps/lab"
};

const MAP_KEYS_DB = {
  "Customs": [
    "Dorms 314 Marked Key",
    "Dorms 204 Key",
    "Dorms 214 Key",
    "Dorms 114 Key",
    "Dorms 105 Key",
    "Tarcone Director's office key",
    "Military Checkpoint Key",
    "Gas Station Storage Room Key",
    "Usek Key / Factory Exit Key"
  ],
  "Woods": [
    "ZB-014 Key",
    "Shturman's Stash Key",
    "Emercom Medical Key"
  ],
  "Factory": [
    "Factory Exit Key"
  ],
  "Reserve": [
    "RB-BK Marked Key",
    "RB-VO Marked Key",
    "RB-PKPM Marked Key",
    "RB-ST Key",
    "RB-KPR Key",
    "RB-AM Key",
    "RB-GN Key"
  ],
  "Interchange": [
    "Ultra Medical Storage Key",
    "Kiba Arms Inner Gate Key",
    "Kiba Arms Outlet Key",
    "Object 11SR Keycard",
    "Object 21WS Keycard",
    "Pharmacy Key"
  ],
  "Shoreline": [
    "Health Resort East Wing 310 Key",
    "Health Resort East Wing 226 Key",
    "Health Resort West Wing 301 Key",
    "Health Resort West Wing 216 Key",
    "Cottage Safe Key",
    "Radar Tower Key"
  ],
  "Streets of Tarkov": [
    "Concordia 64 Office Key",
    "Chek 13 Key",
    "LexOs Key",
    "Pinoptik Stash Key",
    "Beluga Restaurant Key"
  ],
  "Ground Zero": [
    "Terragroup Office Key",
    "Scientist Key"
  ],
  "Lighthouse": [
    "Merin Car Trunk Key",
    "Hillside House Key",
    "Operating Room Key",
    "Water Treatment Control Room Key"
  ],
  "The Lab": [
    "TerraGroup Labs Access Keycard",
    "Red Keycard",
    "Violet Keycard",
    "Green Keycard",
    "Black Keycard",
    "Blue Keycard",
    "Yellow Keycard"
  ]
};

let tasks = [];
let hideoutTasks = [];
let progress = {};
let selectedType = "SIDE";
let selectedTrader = "ALL TRADERS";
let selectedChapter = "All Chapters";
let selectedMap = "ALL MAPS";
let selectedOnlyMap = "Customs";
let selectedMapFloor = "Floor 2";
let selectedHideoutModule = "All Modules";
let statusFilter = "ALL";
let searchQuery = "";
let currentLeafletMap = null;

async function init() {
  initTauriApi();
  setupTypeBar();
  setupFilters();
  renderBars();

  if (!invoke) {
    showError("No se pudo conectar con el Backend de Tauri.");
    return;
  }

  try {
    tasks = await invoke('load_quests');
    hideoutTasks = await invoke('load_hideout');
    progress = await invoke('load_progress');

    updateCounters();
    renderQuests();
  } catch (err) {
    console.error("Error al cargar datos desde Rust:", err);
    showError(err);
  }
}

function showError(msg) {
  const container = document.getElementById('quests-container');
  if (container) {
    container.innerHTML = `
      <div style="background: rgba(30, 10, 10, 0.85); border: 1px solid #ff5252; color: #ff8282; padding: 20px; margin-top: 20px; border-radius: 6px; text-align: center; font-weight: bold;">
        ⚠️ ERROR DE CARGA DE DATOS:<br><br>${msg}
      </div>`;
  }
}

function normalizeMap(mapStr) {
  if (!mapStr || mapStr.includes("Not specified") || mapStr.includes(",")) {
    return "Any Location";
  }
  return mapStr.trim();
}

async function updateProgress(key, value) {
  progress[key] = value;
  if (invoke) {
    await invoke('save_progress', { progress });
  }
  updateCounters();
}

async function applyQuestReputation(task, isCompleting) {
  if (!task.rewards || typeof task.rewards !== 'string') return;

  const rewardsLower = task.rewards.toLowerCase();
  
  for (const trader of TRADERS) {
    if (trader === "ALL TRADERS") continue;
    
    const traderSearch = `${trader.toLowerCase()} rep`;
    if (rewardsLower.includes(traderSearch)) {
      try {
        const idx = rewardsLower.indexOf(traderSearch);
        const sub = task.rewards.substring(idx + traderSearch.length).trim();
        const matchVal = sub.match(/^([+-]?\d*\.?\d+)/);
        
        if (matchVal) {
          const repChangeValue = parseFloat(matchVal[1]);
          if (!isNaN(repChangeValue)) {
            const repKey = `trader_rep_${trader}`;
            let currentRep = parseFloat(progress[repKey]) || 0.00;

            if (isCompleting) {
              currentRep += repChangeValue;
            } else {
              currentRep -= repChangeValue;
            }

            currentRep = Math.max(0, currentRep);
            await updateProgress(repKey, currentRep.toFixed(2));
          }
        }
      } catch (e) {
        console.error("Error al procesar la reputación de la misión:", e);
      }
    }
  }
}

function setupTypeBar() {
  document.querySelectorAll('#type-bar .nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('#type-bar .nav-btn').forEach(b => b.classList.remove('selected-type'));
      e.target.classList.add('selected-type');
      selectedType = e.target.dataset.type;
      renderBars();
      renderQuests();
    });
  });
}

function setupFilters() {
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderQuests();
    });
  }

  document.querySelectorAll('.btn-filter').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      statusFilter = e.target.dataset.filter;
      renderQuests();
    });
  });
}

function getFilteredTasksByType() {
  if (selectedType === "HIDEOUT") {
    return hideoutTasks;
  }

  return tasks.filter(t => {
    const isMain = t.is_main === true || 
                   (t.chapter && t.chapter.length > 0) ||
                   (t.trader && STORY_CHAPTERS.some(ch => ch !== "All Chapters" && ch.toLowerCase() === t.trader.toLowerCase()));
    
    return selectedType === "MAIN" ? isMain : !isMain;
  });
}

function renderBars() {
  const sideFilters = document.getElementById('side-filters-container');
  const mainFilters = document.getElementById('main-filters-container');
  const mapsFilters = document.getElementById('maps-filters-container');
  const hideoutFilters = document.getElementById('hideout-filters-container');
  const statusFilters = document.getElementById('status-filters');

  if (statusFilters) {
    statusFilters.style.display = (selectedType === "MAIN" || selectedType === "MAPS" || selectedType === "PROFILE") ? 'none' : 'flex';

    const activeBtn = statusFilters.querySelector('button[data-filter="ACTIVE"]');
    const availableBtn = statusFilters.querySelector('button[data-filter="AVAILABLE"]');
    const kappaBtn = statusFilters.querySelector('button[data-filter="KAPPA"]');
    const allBtn = statusFilters.querySelector('button[data-filter="ALL"]');
    const completedBtn = statusFilters.querySelector('button[data-filter="COMPLETED"]');

    if (selectedType === "ITEMS") {
      if (activeBtn) activeBtn.style.display = 'none';
      if (availableBtn) availableBtn.style.display = 'none';
      if (kappaBtn) kappaBtn.style.display = 'none';
      if (allBtn) allBtn.style.display = 'none';
      if (completedBtn) completedBtn.style.display = 'none';
    } else if (selectedType === "HIDEOUT") {
      if (activeBtn) activeBtn.style.display = 'none';
      if (availableBtn) activeBtn.style.display = 'none';
      if (kappaBtn) kappaBtn.style.display = 'none';
      if (allBtn) allBtn.style.display = 'inline-block';
      if (completedBtn) completedBtn.style.display = 'inline-block';

      if (statusFilter === "ACTIVE" || statusFilter === "AVAILABLE" || statusFilter === "KAPPA") {
        statusFilter = "ALL";
        statusFilters.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
        if (allBtn) allBtn.classList.add('active');
      }
    } else {
      if (activeBtn) activeBtn.style.display = 'inline-block';
      if (availableBtn) availableBtn.style.display = 'inline-block';
      if (kappaBtn) kappaBtn.style.display = 'inline-block';
      if (allBtn) allBtn.style.display = 'inline-block';
      if (completedBtn) completedBtn.style.display = 'inline-block';
    }
  }

  if (selectedType === "MAIN") {
    if (sideFilters) sideFilters.style.display = 'none';
    if (mapsFilters) mapsFilters.style.display = 'none';
    if (hideoutFilters) hideoutFilters.style.display = 'none';
    if (mainFilters) mainFilters.style.display = 'block';

    const chapterBar = document.getElementById('chapter-bar');
    if (chapterBar) {
      chapterBar.innerHTML = '';
      STORY_CHAPTERS.forEach(chapter => {
        const btn = document.createElement('button');
        btn.className = `nav-btn ${chapter === selectedChapter ? 'selected-chapter' : ''}`;
        btn.dataset.chapter = chapter;
        btn.innerText = chapter;
        btn.onclick = () => {
          selectedChapter = chapter;
          renderBars();
          renderQuests();
        };
        chapterBar.appendChild(btn);
      });
    }

  } else if (selectedType === "MAPS") {
    if (sideFilters) sideFilters.style.display = 'none';
    if (mainFilters) mainFilters.style.display = 'none';
    if (hideoutFilters) hideoutFilters.style.display = 'none';
    if (mapsFilters) mapsFilters.style.display = 'block';

    const mapOnlyBar = document.getElementById('maps-only-bar');
    if (mapOnlyBar) {
      mapOnlyBar.innerHTML = '';
      ONLY_MAPS_LIST.forEach(m => {
        const btn = document.createElement('button');
        btn.className = `nav-btn ${m === selectedOnlyMap ? 'selected-map' : ''}`;
        btn.dataset.map = m;
        btn.innerText = m;
        btn.onclick = () => {
          selectedOnlyMap = m;
          selectedMapFloor = "Floor 2";
          renderBars();
          renderQuests();
        };
        mapOnlyBar.appendChild(btn);
      });
    }

  } else if (selectedType === "HIDEOUT") {
    if (sideFilters) sideFilters.style.display = 'none';
    if (mainFilters) mainFilters.style.display = 'none';
    if (mapsFilters) mapsFilters.style.display = 'none';
    if (hideoutFilters) hideoutFilters.style.display = 'block';

    const hideoutBar = document.getElementById('hideout-bar');
    if (hideoutBar) {
      hideoutBar.innerHTML = '';
      HIDEOUT_MODULES.forEach(mod => {
        const btn = document.createElement('button');
        btn.className = `nav-btn ${mod === selectedHideoutModule ? 'selected-chapter' : ''}`;
        btn.dataset.module = mod;
        btn.innerText = mod;
        btn.onclick = () => {
          selectedHideoutModule = mod;
          renderBars();
          renderQuests();
        };
        hideoutBar.appendChild(btn);
      });
    }

  } else if (selectedType === "PROFILE" || selectedType === "ITEMS") {
    if (sideFilters) sideFilters.style.display = 'none';
    if (mainFilters) mainFilters.style.display = 'none';
    if (mapsFilters) mapsFilters.style.display = 'none';
    if (hideoutFilters) hideoutFilters.style.display = 'none';

  } else {
    if (mainFilters) mainFilters.style.display = 'none';
    if (mapsFilters) mapsFilters.style.display = 'none';
    if (hideoutFilters) hideoutFilters.style.display = 'none';
    if (sideFilters) sideFilters.style.display = 'block';

    const traderBar = document.getElementById('trader-bar');
    if (traderBar) {
      traderBar.innerHTML = '';
      TRADERS.forEach(trader => {
        const btn = document.createElement('button');
        btn.className = `nav-btn ${trader === selectedTrader ? 'selected-trader' : ''}`;
        btn.dataset.trader = trader;
        btn.innerText = trader;
        btn.onclick = () => {
          selectedTrader = trader;
          renderBars();
          renderQuests();
        };
        traderBar.appendChild(btn);
      });
    }

    const mapBar = document.getElementById('map-bar');
    if (mapBar) {
      mapBar.innerHTML = '';
      MAIN_MAPS.forEach(m => {
        const btn = document.createElement('button');
        btn.className = `nav-btn ${m === selectedMap ? 'selected-map' : ''}`;
        btn.dataset.map = m;
        btn.innerText = m;
        btn.onclick = () => {
          selectedMap = m;
          renderBars();
          renderQuests();
        };
        mapBar.appendChild(btn);
      });
    }
  }

  updateCounters();
}

function updateCounters() {
  const statsElem = document.getElementById('global-stats');

  if (selectedType === "MAIN" || selectedType === "MAPS" || selectedType === "HIDEOUT" || selectedType === "PROFILE" || selectedType === "ITEMS") {
    if (statsElem) statsElem.style.display = 'none';
    return;
  }

  if (statsElem) statsElem.style.display = 'block';

  const currentTasks = getFilteredTasksByType();
  const total = currentTasks.length;
  const completed = currentTasks.filter(t => progress[t.id]).length;
  const pct = total > 0 ? ((completed / total) * 100).toFixed(1) : 0;
  
  if (statsElem) {
    statsElem.innerText = `Total: ${completed} / ${total} (${pct}%)`;
  }

  if (selectedType === "SIDE") {
    document.querySelectorAll('#trader-bar .nav-btn').forEach(btn => {
      const tr = btn.dataset.trader;
      const pending = currentTasks.filter(t => (tr === "ALL TRADERS" || t.trader === tr) && !progress[t.id]).length;
      btn.innerText = `${tr} [${pending}]`;
    });

    document.querySelectorAll('#map-bar .nav-btn').forEach(btn => {
      const m = btn.dataset.map;
      const pending = currentTasks.filter(t => (m === "ALL MAPS" || normalizeMap(t.map) === m) && !progress[t.id]).length;
      btn.innerText = `${m} [${pending}]`;
    });
  }
}

function getNeededItems() {
  const itemMap = {};

  const actionVerbs = [
    "survive", "extract", "eliminate", "kill", "find", "locate", "mark", 
    "hand over", "reach", "scout", "explore", "neutralize", "place", 
    "obtain", "get", "gather", "pickup", "check", "deliver", "mop the floor",
    "return", "use", "determine", "modify", "stash", "investigate", "visit", "(optional)", "take", "put", "repair", "plant", "talk", "share", "search", "hide", "earn", "capture", "win", "play", "report", "complete", "bring", "gain", "access", "fix", "reflash", "unravel", "claim", "failure", "make", "go"
  ];

  function parseRequirement(reqStr, sourceName, sourceType) {
    if (typeof reqStr !== 'string') return;

    const lowerStr = reqStr.toLowerCase().trim();

    if (lowerStr.includes("roubles") || lowerStr.includes("euros") || lowerStr.includes("dollars") || 
        lowerStr.includes("level") || lowerStr.includes("ll") || lowerStr.includes("default level")) {
      return;
    }

    if (actionVerbs.some(verb => lowerStr.startsWith(verb))) {
      return;
    }

    let count = 1;
    let cleanName = reqStr.trim();

    const matchX = cleanName.match(/^(\d+)\s*x\s*(.+)$/i) || cleanName.match(/^(.+)\s*x\s*(\d+)$/i);
    if (matchX) {
      if (!isNaN(matchX[1])) {
        count = parseInt(matchX[1], 10);
        cleanName = matchX[2].trim();
      } else {
        count = parseInt(matchX[2], 10);
        cleanName = matchX[1].trim();
      }
    } else {
      const matchSpace = cleanName.match(/^(\d+)\s+(.+)$/);
      if (matchSpace) {
        count = parseInt(matchSpace[1], 10);
        cleanName = matchSpace[2].trim();
      }
    }

    if (actionVerbs.some(verb => cleanName.toLowerCase().startsWith(verb))) {
      return;
    }

    if (!itemMap[cleanName]) {
      itemMap[cleanName] = { name: cleanName, totalCount: 0, uses: [] };
    }

    itemMap[cleanName].totalCount += count;
    itemMap[cleanName].uses.push({
      source: sourceName,
      type: sourceType,
      count: count
    });
  }

  hideoutTasks.forEach(task => {
    if (!progress[task.id]) {
      const reqs = task.requirements || task.objectives || [];
      reqs.forEach(r => parseRequirement(r, task.name, 'hideout'));
    }
  });

  tasks.forEach(task => {
    if (!progress[task.id] && !task.is_main) {
      const reqs = task.objectives || task.requirements || [];
      reqs.forEach((r, i) => {
        if (!progress[`${task.id}_obj_${i}`]) {
          parseRequirement(r, task.name, 'quest');
        }
      });
    }
  });

  return Object.values(itemMap).sort((a, b) => b.totalCount - a.totalCount);
}

function renderQuests() {
  const container = document.getElementById('quests-container');
  if (!container) return;  
  container.innerHTML = '';

  if (selectedType === "ITEMS") {
    const neededItems = getNeededItems();

    let filteredItems = neededItems.filter(item => {
      if (searchQuery) {
        const matchName = item.name.toLowerCase().includes(searchQuery);
        const matchUse = item.uses.some(u => u.source.toLowerCase().includes(searchQuery));
        return matchName || matchUse;
      }
      return true;
    });

    if (filteredItems.length === 0) {
      container.innerHTML = `<div style="color: #888; text-align: center; padding: 40px; font-weight: bold;">No pending items needed!</div>`;
      return;
    }

    container.innerHTML = `
      <div class="items-grid">
        ${filteredItems.map(item => `
          <div class="item-card">
            <div class="item-card-header">
              <span class="item-name">📦 ${item.name}</span>
              <span class="item-count-badge">Need: ${item.totalCount}</span>
            </div>

            <div class="item-uses-list">
              ${item.uses.map(u => `
                <div class="item-use-tag ${u.type === 'hideout' ? 'use-hideout' : 'use-quest'}">
                  <span>${u.type === 'hideout' ? '🏠' : '📜'} ${u.source}</span>
                  <span style="margin-left: auto; font-weight: bold;">x${u.count}</span>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
    return;
  }

  if (selectedType === "PROFILE") {
    const userLevel = progress['player_level'] || 1;
    const prestigeLevel = progress['player_prestige'] || 0;
    const profileTraders = TRADERS.filter(t => t !== "ALL TRADERS");

    container.innerHTML = `
      <div class="profile-container">
        <div style="display: flex; gap: 15px; flex-wrap: wrap;">
          <div class="level-card">
            <div class="level-info">
              <span class="level-label">Level</span>
              <span class="level-value" id="profile-level-val">${userLevel}</span>
            </div>
            <div class="level-controls">
              <button class="btn-level" id="btn-level-up">+</button>
              <button class="btn-level" id="btn-level-down">-</button>
            </div>
          </div>

          <div class="level-card">
            <div class="level-info">
              <span class="level-label">Prestige</span>
              <span class="level-value" id="profile-prestige-val" style="color: var(--alert);">${prestigeLevel}</span>
            </div>
            <div class="level-controls">
              <button class="btn-level" id="btn-prestige-up">+</button>
              <button class="btn-level" id="btn-prestige-down">-</button>
            </div>
          </div>
        </div>

        <div class="traders-grid">
          ${profileTraders.map(trader => {
            const traderTasks = tasks.filter(t => !t.is_main && t.trader === trader);
            const totalTasks = traderTasks.length;
            const completedTasks = traderTasks.filter(t => progress[t.id]).length;
            const pct = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : "0.0";

            const currentLL = progress[`trader_ll_${trader}`] || 1;
            const currentRep = progress[`trader_rep_${trader}`] !== undefined ? progress[`trader_rep_${trader}`] : "0.00";

            return `
              <div class="trader-card">
                <div class="trader-card-header">
                  <span class="trader-name">${trader}</span>
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
            <button class="btn-backup" id="btn-export-progress">
              📤 Export Backup
            </button>
            <button class="btn-backup" id="btn-import-progress">
              📥 Import Backup
            </button>
            <input type="file" id="import-file-input" accept=".json" style="display: none;">
            <button class="btn-backup btn-danger" id="btn-wipe-reset">
              ⚠️ Wipe / Reset Progress
            </button>
          </div>
        </div>
      </div>
    `;

    const levelValElem = document.getElementById('profile-level-val');
    document.getElementById('btn-level-up').onclick = async () => {
      let current = parseInt(levelValElem.innerText, 10);
      current++;
      levelValElem.innerText = current;
      await updateProgress('player_level', current);
    };

    document.getElementById('btn-level-down').onclick = async () => {
      let current = parseInt(levelValElem.innerText, 10);
      if (current > 1) {
        current--;
        levelValElem.innerText = current;
        await updateProgress('player_level', current);
      }
    };

    const prestigeValElem = document.getElementById('profile-prestige-val');
    document.getElementById('btn-prestige-up').onclick = async () => {
      let current = parseInt(prestigeValElem.innerText, 10);
      if (current < 6) {
        current++;
        prestigeValElem.innerText = current;
        await updateProgress('player_prestige', current);
      }
    };

    document.getElementById('btn-prestige-down').onclick = async () => {
      let current = parseInt(prestigeValElem.innerText, 10);
      if (current > 0) {
        current--;
        prestigeValElem.innerText = current;
        await updateProgress('player_prestige', current);
      }
    };

    document.getElementById('btn-export-progress').onclick = () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(progress, null, 2));
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
    document.getElementById('btn-import-progress').onclick = () => {
      fileInput.click();
    };

    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const importedProgress = JSON.parse(event.target.result);
          if (typeof importedProgress === 'object' && importedProgress !== null) {
            progress = importedProgress;
            if (invoke) {
              await invoke('save_progress', { progress });
            }
            renderQuests();
            showToast("Backup imported successfully!");
          } else {
            alert("⚠️ Invalid backup file format.");
          }
        } catch (err) {
          alert("⚠️ Error parsing backup file.");
        }
      };
      reader.readAsText(file);
    };

    document.getElementById('btn-wipe-reset').onclick = async () => {
      const confirmed = confirm("⚠️ Are you sure you want to reset all progress for the new Wipe?\nThis action cannot be undone.");
      if (confirmed) {
        progress = {};
        if (invoke) {
          await invoke('save_progress', { progress });
        }
        renderQuests();
        showToast("Wipe reset completed successfully!");
      }
    };

    container.querySelectorAll('.loyalty-btn').forEach(btn => {
      btn.onclick = async (e) => {
        const trader = e.target.dataset.trader;
        const ll = e.target.dataset.ll;
        await updateProgress(`trader_ll_${trader}`, ll);

        const parent = e.target.parentElement;
        parent.querySelectorAll('.loyalty-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
      };
    });

    container.querySelectorAll('.rep-input').forEach(input => {
      input.onchange = async (e) => {
        const trader = e.target.dataset.trader;
        const val = parseFloat(e.target.value) || 0.00;
        await updateProgress(`trader_rep_${trader}`, val.toFixed(2));
      };
    });

    return;
  }

  if (selectedType === "MAPS") {
    let mapImgSrc = MAP_IMAGES[selectedOnlyMap] || './images/customs.png';
    
    // Si el mapa actual está en la base de datos multi-planta, usamos la planta seleccionada
    if (MAP_FLOOR_IMAGES[selectedOnlyMap]) {
      const floors = MAP_FLOOR_IMAGES[selectedOnlyMap];
      if (!floors[selectedMapFloor]) {
        selectedMapFloor = Object.keys(floors)[1] || Object.keys(floors)[0];
      }
      mapImgSrc = floors[selectedMapFloor];
    }

    const mapWebUrl = MAP_WEB_URLS[selectedOnlyMap] || "https://tarkov-market.com/maps/";
    const keysList = MAP_KEYS_DB[selectedOnlyMap] || [];
    const wikiUrl = "https://escapefromtarkov.fandom.com/wiki/Keys_%26_Intel#Keys_&_Keycards";

    const mapFilteredQuests = tasks.filter(t => {
      const taskMap = normalizeMap(t.map);
      const isCorrectMap = taskMap.toLowerCase() === selectedOnlyMap.toLowerCase();
      const isPinned = !!progress[`${t.id}_pinned`];
      return isCorrectMap && isPinned;
    });

    container.innerHTML = `
      <div class="map-view-card" style="display: flex; gap: 15px; width: 100%; height: 72vh;">
        
        <!-- Contenedor del Mapa Interactivo con Leaflet -->
        <div style="flex: 1; height: 100%; background: #0b0d0a; border-radius: var(--radius); border: 1px solid var(--line); position: relative; overflow: hidden;">
          
          <div id="leaflet-map-container" style="width: 100%; height: 100%; background: #0b0d0a; z-index: 1; cursor: crosshair;"></div>
          
          <!-- Selector de Plantas para mapas multi-planta (abajo a la izquierda absoluta sin margen) -->
          ${MAP_FLOOR_IMAGES[selectedOnlyMap] ? `
            <div id="map-floor-selector" style="position: absolute; bottom: 0; left: 0; z-index: 1000; display: flex;">
              ${Object.keys(MAP_FLOOR_IMAGES[selectedOnlyMap]).map((floor, idx) => `
                <button class="action-btn map-floor-btn ${floor === selectedMapFloor ? 'active' : ''}" data-floor="${floor}" style="background: ${floor === selectedMapFloor ? 'var(--accent-gold, #d2b98a)' : 'rgba(11, 13, 10, 0.9)'}; color: ${floor === selectedMapFloor ? '#000' : '#fff'}; font-weight: bold; padding: 6px 12px; cursor: pointer; border-top-right-radius: ${idx === Object.keys(MAP_FLOOR_IMAGES[selectedOnlyMap]).length - 1 ? '4px' : '0'}; border-bottom-left-radius: ${idx === 0 ? '0' : '0'}; border-top-left-radius: 0; border-bottom-right-radius: 0; border: none; border-right: 1px solid var(--line); box-shadow: 0 -2px 6px rgba(0,0,0,0.4);">
                  ${floor}
                </button>
              `).join('')}
            </div>
          ` : ''}

          <!-- Botón Open Web Map ajustado en la esquina derecha e inferior absoluta sin margen -->
          <div style="position: absolute; bottom: 0; right: 0; z-index: 1000;">
            <button class="action-btn" id="btn-open-interactive-map" style="background: var(--accent-gold, #d2b98a); color: #000; font-weight: bold; padding: 6px 12px; cursor: pointer; border-top-left-radius: 4px; border-bottom-right-radius: 0; border-bottom-left-radius: 0; border-top-right-radius: 0; border: none; box-shadow: 0 -2px 6px rgba(0,0,0,0.4);">
              🗺️ Open Web Map (tarkov-market) 🔗
            </button>
          </div>
        </div>

        <div class="map-sidebar-panels" style="display: flex; flex-direction: column; gap: 15px; width: 340px; flex-shrink: 0; height: 100%; overflow-y: auto;">
          
          <div class="map-keys-card" style="width: 100%;">
            <h3>
              <a href="${wikiUrl}" id="link-important-keys" class="keys-title-link" style="color: var(--accent-gold, #d2b98a); text-decoration: none;">
                🔑 Important Keys 🔗
              </a>
            </h3>
            <div class="keys-list">
              ${keysList.length > 0 ? keysList.map(keyName => {
                const keyId = `key_${selectedOnlyMap.replace(/\s+/g, '')}_${keyName.replace(/\s+/g, '')}`;
                const isChecked = !!progress[keyId];

                return `
                  <label class="key-item" style="color: ${isChecked ? '#4caf50' : '#e0e0e0'}">
                    <input type="checkbox" data-key="${keyId}" ${isChecked ? 'checked' : ''}>
                    <span>${keyName}</span>
                  </label>
                `;
              }).join('') : `<p style="color: #888; font-size: 0.85rem;">No keys registered for this map.</p>`}
            </div>
          </div>

          <div class="map-quests-card" style="background-color: var(--panel); border: 1px solid var(--line); border-radius: var(--radius); padding: 16px; display: flex; flex-direction: column; gap: 10px; backdrop-filter: blur(4px);">
            <h3 style="margin: 0;">
              <a href="#" id="map-quests-title-link" style="font-family: var(--f-head); font-size: 1.15rem; letter-spacing: 0.05em; color: var(--sand, #d2b98a); text-decoration: none; display: block; border-bottom: 1px solid var(--line); padding-bottom: 8px;">
                📌 Active Quests on ${selectedOnlyMap} (${mapFilteredQuests.length}) 🔗
              </a>
            </h3>
            <div class="map-quests-list" style="display: flex; flex-direction: column; gap: 6px; max-height: 25vh; overflow-y: auto;">
              ${mapFilteredQuests.length > 0 ? mapFilteredQuests.map(quest => {
                const isQuestDone = !!progress[quest.id];
                return `
                  <div class="map-quest-item" style="display: flex; align-items: center; justify-content: space-between; font-size: 0.85rem; padding: 6px 8px; background-color: rgba(11, 13, 10, 0.8); border-radius: var(--radius); border: 1px solid var(--line); color: ${isQuestDone ? '#4caf50' : '#e0e0e0'};">
                    <span style="font-family: var(--f-body); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-right: 8px;">${quest.name}</span>
                    <span style="font-family: var(--f-mono); font-size: 0.75rem; color: var(--muted); background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 3px; flex-shrink: 0;">${quest.trader || 'Quest'}</span>
                  </div>
                `;
              }).join('') : `<p style="color: #888; font-size: 0.85rem;">No active (pinned) quests for this map.</p>`}
            </div>
          </div>

        </div>
      </div>
    `;

    if (MAP_FLOOR_IMAGES[selectedOnlyMap]) {
      container.querySelectorAll('.map-floor-btn').forEach(btn => {
        btn.onclick = (e) => {
          selectedMapFloor = e.target.dataset.floor;
          renderQuests();
        };
      });
    }

    setTimeout(() => {
      if (currentLeafletMap) {
        currentLeafletMap.remove();
        currentLeafletMap = null;
      }

      const mapElement = document.getElementById('leaflet-map-container');
      if (mapElement) {
        currentLeafletMap = L.map('leaflet-map-container', {
          crs: L.CRS.Simple,
          minZoom: -5,
          maxZoom: 3,
          zoomControl: true,
          zoomDelta: 0.25,
          zoomSnap: 0.25,
          scrollWheelZoom: 'center',
          wheelPxPerZoomLevel: 120
        });

        const img = new Image();
        img.src = mapImgSrc;
        img.onload = () => {
          const w = img.naturalWidth || 4096;
          const h = img.naturalHeight || 4096;
          const bounds = [[0, 0], [h, w]];
          
          L.imageOverlay(mapImgSrc, bounds).addTo(currentLeafletMap);

          const containerWidth = mapElement.clientWidth || 800;
          const containerHeight = mapElement.clientHeight || 600;
          const scaleX = containerWidth / w;
          const scaleY = containerHeight / h;
          const minScale = Math.min(scaleX, scaleY);
          const dynamicMinZoom = Math.log2(minScale);

          currentLeafletMap.setMinZoom(dynamicMinZoom);
          currentLeafletMap.setMaxBounds([[-h * 0.1, -w * 0.1], [h * 1.1, w * 1.1]]);
          currentLeafletMap.fitBounds(bounds);

          const zoomControlContainer = document.querySelector('.leaflet-top.leaflet-left');
          if (zoomControlContainer && !document.getElementById('leaflet-instruction-badge')) {
            const hintDiv = document.createElement('div');
            hintDiv.id = 'leaflet-instruction-badge';
            hintDiv.style.cssText = 'display: inline-block; background: rgba(11, 13, 10, 0.9); border: 1px solid var(--line); padding: 5px 10px; border-radius: 4px; font-size: 0.75rem; color: var(--accent-gold, #d2b98a); margin-left: 8px; vertical-align: middle; box-shadow: 0 2px 5px rgba(0,0,0,0.5); pointer-events: none;';
            hintDiv.innerHTML = '💡 Click anywhere on the map to add a custom pin.';
            zoomControlContainer.appendChild(hintDiv);
          }

          const currentFloorKey = MAP_FLOOR_IMAGES[selectedOnlyMap] ? selectedMapFloor : 'main';
          const customPinsKey = `custom_pins_${selectedOnlyMap}_${currentFloorKey}`;
          const savedPins = progress[customPinsKey] || [];

          savedPins.forEach((pin, index) => {
            const customIcon = L.divIcon({
              className: 'custom-map-pin-wrapper',
              html: `<div style="color: #fff; font-family: var(--f-mono); font-size: 12px; font-weight: bold; text-shadow: 1px 1px 3px rgba(0,0,0,0.9), -1px -1px 3px rgba(0,0,0,0.9); white-space: nowrap; display: inline-flex; align-items: center; gap: 4px;">
                      <span>📌 ${pin.text}</span>
                      <span style="background: rgba(0,0,0,0.7); padding: 0 4px; border-radius: 2px; cursor: pointer; color: #ff8282; font-size: 10px;" title="Delete pin" onclick="window.deleteCustomPin('${selectedOnlyMap}', '${currentFloorKey}', ${index})">✕</span>
                    </div>`,
              iconSize: null,
              iconAnchor: [0, 12]
            });

            L.marker([pin.lat, pin.lng], { icon: customIcon }).addTo(currentLeafletMap);
          });

          currentLeafletMap.on('click', async (e) => {
            const pinText = prompt("Introduce el nombre de la misión u objetivo para este pin:");
            if (!pinText || !pinText.trim()) return;

            const newPin = {
              lat: e.latlng.lat,
              lng: e.latlng.lng,
              text: pinText.trim()
            };

            if (!progress[customPinsKey]) {
              progress[customPinsKey] = [];
            }
            progress[customPinsKey].push(newPin);

            await updateProgress(customPinsKey, progress[customPinsKey]);
            renderQuests();
            showToast("Pin añadido correctamente");
          });

        };
        img.onerror = () => {
          mapElement.innerHTML = `<div style="color: #ff8282; font-weight: bold; text-align: center; padding: 40px;">⚠️ Image not found: ${mapImgSrc}. Place it in src/images/</div>`;
        };
      }
    }, 50);

    window.deleteCustomPin = async (mapName, floorName, pinIndex) => {
      const customPinsKey = `custom_pins_${mapName}_${floorName}`;
      if (progress[customPinsKey]) {
        progress[customPinsKey].splice(pinIndex, 1);
        await updateProgress(customPinsKey, progress[customPinsKey]);
        renderQuests();
        showToast("Pin eliminado");
      }
    };

    const interactiveMapBtn = document.getElementById('btn-open-interactive-map');
    if (interactiveMapBtn) {
      interactiveMapBtn.onclick = (e) => {
        e.preventDefault();
        openExternalUrl(mapWebUrl);
      };
    }

    const keysTitleLink = document.getElementById('link-important-keys');
    if (keysTitleLink) {
      keysTitleLink.onclick = (e) => {
        e.preventDefault();
        openExternalUrl(wikiUrl);
      };
    }

    const mapQuestsTitleLink = document.getElementById('map-quests-title-link');
    if (mapQuestsTitleLink) {
      mapQuestsTitleLink.onclick = (e) => {
        e.preventDefault();
        selectedType = "SIDE";
        selectedMap = selectedOnlyMap;
        statusFilter = "ACTIVE";
        
        document.querySelectorAll('#type-bar .nav-btn').forEach(b => {
          b.classList.toggle('selected-type', b.dataset.type === "SIDE");
        });

        renderBars();
        renderQuests();
      };
    }

    container.querySelectorAll('.keys-list input[type="checkbox"]').forEach(chk => {
      chk.onchange = async (e) => {
        await updateProgress(e.target.dataset.key, e.target.checked);
        const parentLabel = e.target.parentElement;
        if (parentLabel) {
          parentLabel.style.color = e.target.checked ? '#4caf50' : '#e0e0e0';
        }
      };
    });

    return;
  }

  const currentTasks = getFilteredTasksByType();

  let filtered = currentTasks.filter(t => {
    if (selectedType === "SIDE") {
      if (selectedTrader !== "ALL TRADERS" && t.trader !== selectedTrader) return false;
      if (selectedMap !== "ALL MAPS" && normalizeMap(t.map) !== selectedMap) return false;
    } else if (selectedType === "MAIN") {
      if (selectedChapter !== "All Chapters") {
        const target = selectedChapter.toLowerCase().trim();
        const fields = [t.chapter, t.trader, t.name, t.id].filter(Boolean).map(s => String(s).toLowerCase().trim());
        if (!fields.some(val => val.includes(target))) return false;
      }
    } else if (selectedType === "HIDEOUT") {
      if (selectedHideoutModule !== "All Modules") {
        const target = selectedHideoutModule.toLowerCase().trim();
        const fields = [t.chapter, t.name, t.trader, t.id].filter(Boolean);
        const matches = fields.some(val => {
          const s = String(val).toLowerCase().trim();
          if (target === "generator") {
            return s === "generator" || s.startsWith("generator level") || (s.includes("generator") && !s.includes("booze"));
          }
          return s.includes(target);
        });

        if (!matches) return false;
      }
    }

    if (statusFilter === "ACTIVE" && !progress[`${t.id}_pinned`]) return false;
    if (statusFilter === "AVAILABLE" && progress[t.id]) return false;
    if (statusFilter === "COMPLETED" && !progress[t.id]) return false;
    if (statusFilter === "KAPPA" && !t.kappa) return false;

    if (searchQuery) {
      const matchName = (t.name || "").toLowerCase().includes(searchQuery);
      const items = t.objectives || t.requirements || [];
      const matchObj = items.some(o => typeof o === 'string' && o.toLowerCase().includes(searchQuery));
      if (!matchName && !matchObj) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div style="color: #888; text-align: center; padding: 40px; font-weight: bold;">No data for ${selectedType === "HIDEOUT" ? selectedHideoutModule : (selectedType === "MAIN" ? selectedChapter : 'this category')}.</div>`;
    return;
  }

  const showPinBtn = selectedType === "SIDE";

  filtered.forEach(task => {
    const isCompleted = !!progress[task.id];
    const isPinned = !!progress[`${task.id}_pinned`];
    const reqList = task.objectives || task.requirements || [];

    const card = document.createElement('div');
    card.className = 'quest-card';

    card.innerHTML = `
      <div class="card-header">
        <span class="quest-title" style="cursor: pointer; color: ${isCompleted ? '#4caf50' : (task.kappa ? '#c2a649' : '#3894ff')}">
          ${task.kappa ? '★ ' : ''}${task.name} ${task.wiki_url ? '🔗' : ''}
        </span>
        <div class="right-column">
          <div class="badges-and-actions">
            ${task.kappa ? `<span class="badge badge-kappa">★ Kappa</span>` : ''}
            ${task.map ? `<span class="badge badge-map">📍 ${task.map}</span>` : ''}
            ${task.trader ? `<span class="badge badge-trader">${task.trader}</span>` : ''}
            ${showPinBtn ? `
              <button class="action-btn btn-pin ${isPinned ? 'pinned' : ''}">
                ${isPinned ? '📌 Active' : 'Pin Active'}
              </button>
            ` : ''}
            <button class="action-btn btn-complete ${isCompleted ? 'done' : ''}">
              ${isCompleted ? '✓ Completed' : 'Complete'}
            </button>
          </div>
          ${task.image ? `<div class="quest-image-container"><img src="${task.image}" alt="${task.name}" class="quest-image" /></div>` : ''}
        </div>
      </div>

      <div class="objectives-list">
        ${reqList.map((obj, i) => {
          const key = `${task.id}_obj_${i}`;
          const checked = !!progress[key];
          const isOptional = typeof obj === 'string' && obj.startsWith('(Optional)');
          return `
            <label class="objective-item ${isOptional ? 'optional-objective' : ''}" style="color: ${checked ? '#5c6370' : (isOptional ? '#9a9a9a' : '#e0e0e0')}">
              <input type="checkbox" data-key="${key}" ${checked ? 'checked' : ''}>
              ${obj}
            </label>
          `;
        }).join('')}
      </div>

      ${task.guide ? `<div class="quest-guide"><strong>GUIDE:</strong> ${task.guide}</div>` : ''}
      ${task.rewards ? `<div class="rewards-text">REWARDS: ${task.rewards}</div>` : ''}
    `;

    const titleElem = card.querySelector('.quest-title');
    if (titleElem && task.wiki_url) {
      titleElem.onclick = (e) => {
        e.preventDefault();
        openExternalUrl(task.wiki_url);
      };
    }

    const completeBtn = card.querySelector('.btn-complete');
    if (completeBtn) {
      completeBtn.onclick = async () => {
        const willBeCompleted = !isCompleted;
        await updateProgress(task.id, willBeCompleted);
        await applyQuestReputation(task, willBeCompleted);

        // Si se marca como completada, se despinne automáticamente de activa si lo estaba
        if (willBeCompleted && progress[`${task.id}_pinned`]) {
          await updateProgress(`${task.id}_pinned`, false);
        }

        renderQuests();
      };
    }

    const pinBtn = card.querySelector('.btn-pin');
    if (pinBtn) {
      pinBtn.onclick = async () => {
        const newPinnedState = !progress[`${task.id}_pinned`];
        await updateProgress(`${task.id}_pinned`, newPinnedState);

        if (newPinnedState) {
          pinBtn.classList.add('pinned');
          pinBtn.innerText = '📌 Active';
        } else {
          pinBtn.classList.remove('pinned');
          pinBtn.innerText = 'Pin Active';
        }

        if (statusFilter === "ACTIVE" && !newPinnedState) {
          renderQuests();
        }
      };
    }

    card.querySelectorAll('input[type="checkbox"]').forEach(chk => {
      chk.onchange = async (e) => {
        const checkboxKey = e.target.dataset.key;
        await updateProgress(checkboxKey, e.target.checked);
        
        const parentLabel = e.target.parentElement;
        if (parentLabel) {
          const isOpt = parentLabel.classList.contains('optional-objective');
          parentLabel.style.color = e.target.checked ? '#5c6370' : (isOpt ? '#9a9a9a' : '#e0e0e0');
        }

        const allCheckboxesInCard = card.querySelectorAll('.objectives-list input[type="checkbox"]');
        if (allCheckboxesInCard.length > 0) {
          const allChecked = Array.from(allCheckboxesInCard).every(box => box.checked);
          const isTaskCurrentlyDone = !!progress[task.id];

          if (allChecked && !isTaskCurrentlyDone) {
            await updateProgress(task.id, true);
            await applyQuestReputation(task, true);

            // Si se completa automáticamente al marcar todos los objetivos, se despinne también
            if (progress[`${task.id}_pinned`]) {
              await updateProgress(`${task.id}_pinned`, false);
            }

            showToast(`¡Misión "${task.name}" completada automáticamente!`);
            renderQuests();
          } else if (!allChecked && isTaskCurrentlyDone) {
            await updateProgress(task.id, false);
            await applyQuestReputation(task, false);
            renderQuests();
          }
        }
      };
    });

    container.appendChild(card);
  });
}

window.addEventListener('DOMContentLoaded', init);