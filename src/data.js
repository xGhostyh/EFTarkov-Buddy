// Static game data — kept separate so views/util can import without circular deps.

export const SCHEMA_VERSION = 2;

export const TRADERS = ["ALL TRADERS", "Prapor", "Therapist", "Fence", "Skier", "Peacekeeper", "Mechanic", "Ragman", "Jaeger", "Ref", "Lightkeeper", "BTR Driver"];

export const STORY_CHAPTERS = [
  "All Chapters", "Tour", "Falling Skies", "Batya", "The Unheard", "Blue Fire",
  "They Are Already Here", "Accidental Witness", "The Labyrinth", "The Ticket", "Boreas"
];

export const MAIN_MAPS = ["ALL MAPS", "Customs", "Woods", "Factory", "Reserve", "Interchange", "Shoreline", "Streets of Tarkov", "Ground Zero", "Lighthouse", "The Lab", "Any Location"];

export const ONLY_MAPS_LIST = ["Customs", "Woods", "Factory", "Reserve", "Interchange", "Shoreline", "Streets of Tarkov", "Ground Zero", "Lighthouse", "The Lab", "Icebreaker", "Labyrinth", "Terminal"];

export const HIDEOUT_MODULES = [
  "All Modules", "Security", "Generator", "Lavatory", "Workbench", "Medstation",
  "Nutrition Unit", "Vents", "Heating", "Illumination", "Rest Space", "Water Collector",
  "Intelligence Center", "Shooting Range", "Weapon Rack", "Defective Wall", "Gym",
  "Gear Rack", "Hall of Fame", "Air Filtering Unit", "Bitcoin Farm", "Booze Generator",
  "Cultist Circle", "Library", "Scav Case", "Solar Power", "Stash"
];

export const MAP_IMAGES = {
  "Customs": "./images/customs.jpg",
  "Woods": "./images/woods.jpg",
  "Factory": "./images/factory.jpg",
  "Reserve": "./images/reserve.jpg",
  "Interchange": "./images/interchange.jpg",
  "Shoreline": "./images/shoreline.jpg",
  "Streets of Tarkov": "./images/streets.jpg",
  "Ground Zero": "./images/ground_zero.jpg",
  "Lighthouse": "./images/lighthouse.jpg",
  "The Lab": "./images/the_lab.jpg",
  "Icebreaker": "./images/icebreaker.jpg",
  "Labyrinth": "./images/labyrinth.jpg",
  "Terminal": "./images/terminal.jpg"
};

export const MAP_FLOOR_IMAGES = {
  "Customs": { "Dorms": "./images/customs_dorms.jpg", "Main": "./images/customs.jpg" },
  "Shoreline": { "Resort": "./images/shoreline_r.jpg", "Main": "./images/shoreline.jpg" },
  "The Lab": { "Floor 1": "./images/the_lab_floor1.jpg", "Floor 2": "./images/the_lab.jpg", "Floor 3": "./images/the_lab_floor3.jpg" }
};

export const MAP_DEFAULT_FLOOR = {
  "Customs": "Main",
  "Shoreline": "Main",
  "The Lab": "Floor 2"
};

export const MAP_WEB_URLS = {
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

export const MAP_KEYS_DB = {
  "Customs": [
    "Dorms 314 Marked Key", "Dorms 204 Key", "Dorms 214 Key", "Dorms 114 Key",
    "Dorms 105 Key", "Tarcone Director's office key", "Military Checkpoint Key",
    "Gas Station Storage Room Key", "Usek Key / Factory Exit Key"
  ],
  "Woods": ["ZB-014 Key", "Shturman's Stash Key", "Emercom Medical Key"],
  "Factory": ["Factory Exit Key"],
  "Reserve": ["RB-BK Marked Key", "RB-VO Marked Key", "RB-PKPM Marked Key", "RB-ST Key", "RB-KPR Key", "RB-AM Key", "RB-GN Key"],
  "Interchange": ["Ultra Medical Storage Key", "Kiba Arms Inner Gate Key", "Kiba Arms Outlet Key", "Object 11SR Keycard", "Object 21WS Keycard", "Pharmacy Key"],
  "Shoreline": ["Health Resort East Wing 310 Key", "Health Resort East Wing 226 Key", "Health Resort West Wing 301 Key", "Health Resort West Wing 216 Key", "Cottage Safe Key", "Radar Tower Key"],
  "Streets of Tarkov": ["Concordia 64 Office Key", "Chek 13 Key", "LexOs Key", "Pinoptik Stash Key", "Beluga Restaurant Key"],
  "Ground Zero": ["Terragroup Office Key", "Scientist Key"],
  "Lighthouse": ["Merin Car Trunk Key", "Hillside House Key", "Operating Room Key", "Water Treatment Control Room Key"],
  "The Lab": ["TerraGroup Labs Access Keycard", "Red Keycard", "Violet Keycard", "Green Keycard", "Black Keycard", "Blue Keycard", "Yellow Keycard"]
};

export const EDITIONS_BONUS = {
  eod: { "Prapor": 0.20, "Therapist": 0.20, "Fence": 0.20, "Skier": 0.20, "Peacekeeper": 0.20, "Mechanic": 0.20, "Ragman": 0.20, "Jaeger": 0.20, "Ref": 0.20 },
  unheard: { "Prapor": 0.20, "Therapist": 0.20, "Fence": 0.70, "Skier": 0.20, "Peacekeeper": 0.20, "Mechanic": 0.20, "Ragman": 0.20, "Jaeger": 0.20, "Ref": 0.20 }
};

// Traders whose reputation can legitimately go negative.
export const NEGATIVE_REP_TRADERS = new Set(["Fence"]);

// Global app state — single source of truth. Views read from this.
export const state = {
  tasks: [],
  hideoutTasks: [],
  progress: {},              // v2 namespaced shape (migrated from v1 on load)
  selectedType: "SIDE",
  selectedTrader: "ALL TRADERS",
  selectedChapter: "All Chapters",
  selectedMap: "ALL MAPS",
  selectedOnlyMap: "Customs",
  selectedMapFloor: MAP_DEFAULT_FLOOR["Customs"],
  selectedHideoutModule: "All Modules",
  statusFilter: "ALL",
  searchQuery: "",
  currentLeafletMap: null,
  // Track map identity so we only rebuild the map when it truly changes.
  activeMapKey: null
};