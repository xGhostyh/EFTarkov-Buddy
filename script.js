/* ==========================================================
   EFTarkov Buddy — landing page behaviour
   ========================================================== */

/* ---------- CONFIG: edit these before publishing ---------- */
const CONFIG = {
  // Replace YOUR_USER / YOUR_REPO with your real GitHub path.
  repo: "https://github.com/xGhostyh/EFTarkov-Buddy",
  version: "1.0.5",
};
CONFIG.releases = CONFIG.repo + "/releases";
CONFIG.installer = `EFTarkov_Buddy_${CONFIG.version}_x64-setup.exe`;

document.documentElement.classList.add("js");

/* ---------- Config -> DOM ---------- */
document.querySelectorAll("[data-link]").forEach((a) => {
  a.href = CONFIG[a.dataset.link] || CONFIG.repo;
});
document.querySelectorAll("[data-version]").forEach((el) => (el.textContent = CONFIG.version));
document.querySelectorAll("[data-installer]").forEach((el) => (el.textContent = CONFIG.installer));
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ---------- Topographic background ----------
   Value-noise height field + marching squares -> contour lines. */
(function topo() {
  const svg = document.getElementById("topo");
  if (!svg) return;

  const W = 1600, H = 900;
  const cols = 110, rows = Math.round(cols * H / W);
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);

  // seeded RNG so the map is stable between visits
  let seed = 20261029;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

  const lattice = {};
  const lat = (x, y, o) => {
    const k = o + ":" + x + ":" + y;
    return k in lattice ? lattice[k] : (lattice[k] = rnd());
  };
  const smooth = (t) => t * t * (3 - 2 * t);
  const noise = (x, y, o) => {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = smooth(x - xi), yf = smooth(y - yi);
    const a = lat(xi, yi, o), b = lat(xi + 1, yi, o), c = lat(xi, yi + 1, o), d = lat(xi + 1, yi + 1, o);
    return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
  };

  const field = [];
  for (let j = 0; j <= rows; j++) {
    const row = [];
    for (let i = 0; i <= cols; i++) {
      const x = i / cols, y = j / rows;
      const v =
        noise(x * 3.2, y * 2.4, 1) * 0.62 +
        noise(x * 6.5, y * 4.8, 2) * 0.28 +
        noise(x * 13, y * 9.6, 3) * 0.10;
      row.push(v);
    }
    field.push(row);
  }

  const cw = W / cols, ch = H / rows;
  const lerp = (a, b, t) => a + (b - a) * t;
  const levels = 16, lo = 0.2, hi = 0.8;
  const NS = "http://www.w3.org/2000/svg";

  for (let l = 0; l < levels; l++) {
    const t = lo + ((hi - lo) * l) / (levels - 1);
    let d = "";

    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const v0 = field[j][i], v1 = field[j][i + 1], v2 = field[j + 1][i + 1], v3 = field[j + 1][i];
        const idx = (v0 > t ? 8 : 0) | (v1 > t ? 4 : 0) | (v2 > t ? 2 : 0) | (v3 > t ? 1 : 0);
        if (idx === 0 || idx === 15) continue;

        const x = i * cw, y = j * ch;
        const top = [x + cw * ((t - v0) / (v1 - v0)), y];
        const right = [x + cw, y + ch * ((t - v1) / (v2 - v1))];
        const bottom = [x + cw * ((t - v3) / (v2 - v3)), y + ch];
        const left = [x, y + ch * ((t - v0) / (v3 - v0))];

        const seg = (p, q) => (d += `M${p[0].toFixed(1)} ${p[1].toFixed(1)}L${q[0].toFixed(1)} ${q[1].toFixed(1)}`);
        switch (idx) {
          case 1: case 14: seg(left, bottom); break;
          case 2: case 13: seg(bottom, right); break;
          case 3: case 12: seg(left, right); break;
          case 4: case 11: seg(top, right); break;
          case 5: seg(left, top); seg(bottom, right); break;
          case 6: case 9: seg(top, bottom); break;
          case 7: case 8: seg(left, top); break;
          case 10: seg(top, right); seg(left, bottom); break;
        }
      }
    }

    if (!d) continue;
    const p = document.createElementNS(NS, "path");
    p.setAttribute("d", d);
    p.setAttribute("class", l % 4 === 0 ? "major" : "minor");
    svg.appendChild(p);
  }

  // faint grid ticks, like map coordinates
  const grid = document.createElementNS(NS, "path");
  let g = "";
  for (let x = 0; x <= W; x += 160) g += `M${x} 0V${H}`;
  for (let y = 0; y <= H; y += 160) g += `M0 ${y}H${W}`;
  grid.setAttribute("d", g);
  grid.setAttribute("class", "minor");
  grid.style.opacity = ".18";
  grid.style.strokeDasharray = "2 8";
  svg.appendChild(grid);
})();

/* ---------- Sticky nav shadow ---------- */
const nav = document.getElementById("nav");
const onScroll = () => nav && nav.classList.toggle("is-stuck", window.scrollY > 10);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* ---------- Mobile menu ---------- */
const burger = document.getElementById("burger");
const navLinks = document.getElementById("navLinks");
if (burger && navLinks) {
  const setOpen = (open) => {
    burger.setAttribute("aria-expanded", String(open));
    navLinks.classList.toggle("is-open", open);
  };
  burger.addEventListener("click", () => setOpen(burger.getAttribute("aria-expanded") !== "true"));
  navLinks.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
}

/* ---------- Screenshot tabs ---------- */
const tabs = [...document.querySelectorAll(".tab")];
const panels = [...document.querySelectorAll(".panel")];
function selectTab(i, focus) {
  tabs.forEach((t, n) => {
    const on = n === i;
    t.classList.toggle("is-active", on);
    t.setAttribute("aria-selected", String(on));
    t.tabIndex = on ? 0 : -1;
    if (on && focus) t.focus();
  });
  panels.forEach((p, n) => p.classList.toggle("is-active", n === i));
}
tabs.forEach((t, i) => {
  t.addEventListener("click", () => selectTab(i));
  t.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") selectTab((i + 1) % tabs.length, true);
    if (e.key === "ArrowLeft") selectTab((i - 1 + tabs.length) % tabs.length, true);
  });
});
if (tabs.length) selectTab(0);

/* ---------- Real screenshots replace placeholders automatically ----------
   Drop files in docs/screenshots/ with the names listed in index.html.
   If a file is missing, the placeholder simply stays. */
const SHOT_EXTS = ["png", "jpg", "jpeg", "webp", "PNG", "JPG", "JPEG", "WEBP"];
document.querySelectorAll(".shot[data-src]").forEach((shot) => {
  const base = shot.dataset.src.replace(/\.[^.\/]+$/, "");
  let n = 0;
  const tryNext = () => {
    if (n >= SHOT_EXTS.length) return; // nothing found: keep placeholder
    const img = new Image();
    img.alt = shot.dataset.alt || "EFTarkov Buddy screenshot";
    img.decoding = "async";
    img.onload = () => {
      const body = shot.querySelector(".shot__body");
      const ph = body.querySelector(".ph");
      body.appendChild(img);
      if (ph) ph.remove();
    };
    img.onerror = tryNext;
    img.src = base + "." + SHOT_EXTS[n++];
  };
  tryNext();
});

/* ---------- Reveal on scroll ---------- */
const revealEls = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  // small stagger for items inside the same grid
  document.querySelectorAll(".cards, .steps").forEach((group) => {
    [...group.querySelectorAll(".reveal")].forEach((el, i) => el.style.setProperty("--d", i * 0.08 + "s"));
  });
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("is-in"));
}
