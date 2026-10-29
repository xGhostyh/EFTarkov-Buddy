/* ==========================================================
   TopoBackground — procedural topographic map background
   Draws contour lines straight onto a <canvas> at the real
   pixel size of the screen (or any size you ask for), so it
   is always sharp: 1080p, 4K, 8K, high-DPI laptops...

   Plain JavaScript, no dependencies. Works in any webview
   (Tauri / WebView2 included).

   USAGE (live background):
     <canvas id="bg"></canvas>
     <script src="topo-background.js"></script>
     <script>
       TopoBackground.mount(document.getElementById("bg"), { seed: 20261029 });
     </script>

   USAGE (export a PNG at any resolution):
     const blob = await TopoBackground.exportPNG(7680, 4320, { seed: 7 });

   The same seed + same aspect ratio always gives the same map.
   ========================================================== */
(function (root) {
  "use strict";

  const DEFAULTS = {
    seed: 20261029,        // change it to get a different terrain
    bgColor: "#0b0d0a",    // null = transparent (lines only)
    lineColor: "#8a9a4a",
    opacity: 0.22,         // overall strength of the lines (0-1)
    levels: 16,            // number of contour levels
    cell: 0,               // grid cell in px; 0 = automatic (smaller = smoother, slower)
    glow: true,            // soft olive glow top-left
    shade: true,           // dark gradient at the bottom
    grid: true,            // faint dotted coordinate grid
    maxSide: 8192,         // safety cap for mount() (longest side, in px)
  };

  /* ---------- deterministic value noise (no stored state) ---------- */
  const imul = Math.imul;
  function hash(x, y, o, seed) {
    let h = imul(x, 374761393) ^ imul(y, 668265263) ^ imul(o + 1, 1274126177) ^ imul(seed | 0, 2246822519);
    h = imul(h ^ (h >>> 13), 1274126177);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }
  const smooth = (t) => t * t * (3 - 2 * t);
  function vnoise(x, y, o, seed) {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = smooth(x - xi), yf = smooth(y - yi);
    const a = hash(xi, yi, o, seed), b = hash(xi + 1, yi, o, seed);
    const c = hash(xi, yi + 1, o, seed), d = hash(xi + 1, yi + 1, o, seed);
    return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
  }
  function heightAt(px, py, s, seed) {
    const x = px * s, y = py * s;
    return (
      vnoise(x * 3.6, y * 3.6, 1, seed) * 0.62 +
      vnoise(x * 7.6, y * 7.6, 2, seed) * 0.28 +
      vnoise(x * 15.5, y * 15.5, 3, seed) * 0.1
    );
  }

  /* ---------- render onto any 2D context of size w x h (device pixels) ---------- */
  function render(ctx, w, h, options) {
    const o = Object.assign({}, DEFAULTS, options);
    const long = Math.max(w, h);
    const s = 1 / long;                       // resolution-independent coordinates
    const lw = long / 1920;                   // line-width scale

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);
    if (o.bgColor) { ctx.fillStyle = o.bgColor; ctx.fillRect(0, 0, w, h); }

    // height field
    const cell = o.cell > 0 ? o.cell : Math.max(4, Math.round(Math.min(w, h) / 160));
    const cols = Math.ceil(w / cell), rows = Math.ceil(h / cell), stride = cols + 1;
    const f = new Float32Array(stride * (rows + 1));
    for (let j = 0; j <= rows; j++)
      for (let i = 0; i <= cols; i++) f[j * stride + i] = heightAt(i * cell, j * cell, s, o.seed);

    // contour lines (marching squares)
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = o.lineColor;
    const lo = 0.2, hi = 0.8;
    for (let l = 0; l < o.levels; l++) {
      const t = lo + ((hi - lo) * l) / (o.levels - 1);
      const major = l % 4 === 0;
      ctx.globalAlpha = o.opacity * (major ? 0.9 : 0.55);
      ctx.lineWidth = (major ? 2.0 : 1.2) * lw;
      ctx.beginPath();
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const v0 = f[j * stride + i], v1 = f[j * stride + i + 1];
          const v2 = f[(j + 1) * stride + i + 1], v3 = f[(j + 1) * stride + i];
          const idx = (v0 > t ? 8 : 0) | (v1 > t ? 4 : 0) | (v2 > t ? 2 : 0) | (v3 > t ? 1 : 0);
          if (idx === 0 || idx === 15) continue;
          const x = i * cell, y = j * cell;
          const tx = x + cell * ((t - v0) / (v1 - v0)), ty = y;
          const rx = x + cell, ry = y + cell * ((t - v1) / (v2 - v1));
          const bx = x + cell * ((t - v3) / (v2 - v3)), by = y + cell;
          const lx = x, ly = y + cell * ((t - v0) / (v3 - v0));
          const seg = (ax, ay, bx2, by2) => { ctx.moveTo(ax, ay); ctx.lineTo(bx2, by2); };
          switch (idx) {
            case 1: case 14: seg(lx, ly, bx, by); break;
            case 2: case 13: seg(bx, by, rx, ry); break;
            case 3: case 12: seg(lx, ly, rx, ry); break;
            case 4: case 11: seg(tx, ty, rx, ry); break;
            case 5: seg(lx, ly, tx, ty); seg(bx, by, rx, ry); break;
            case 6: case 9: seg(tx, ty, bx, by); break;
            case 7: case 8: seg(lx, ly, tx, ty); break;
            case 10: seg(tx, ty, rx, ry); seg(lx, ly, bx, by); break;
          }
        }
      }
      ctx.stroke();
    }

    // faint dotted coordinate grid
    if (o.grid) {
      ctx.globalAlpha = o.opacity * 0.45;
      ctx.lineWidth = lw;
      ctx.setLineDash([2 * lw, 8 * lw]);
      ctx.beginPath();
      const step = 160 * lw;
      for (let x = 0; x <= w; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
      for (let y = 0; y <= h; y += step) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // glow + bottom shade (only if there is a background to blend with)
    ctx.globalAlpha = 1;
    if (o.glow && o.bgColor) {
      const g = ctx.createRadialGradient(w * 0.2, 0, 0, w * 0.2, 0, long * 0.7);
      g.addColorStop(0, "rgba(95,113,50,0.18)");
      g.addColorStop(1, "rgba(95,113,50,0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    }
    if (o.shade && o.bgColor) {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0.6, "rgba(0,0,0,0)");
      g.addColorStop(1, "rgba(0,0,0,0.55)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    }
    ctx.restore();
  }

  /* ---------- live canvas: sharp at real resolution, redraws on resize ---------- */
  function mount(canvas, options) {
    let opts = Object.assign({}, options);
    let last = "", timer = 0;

    function draw(force) {
      const dpr = opts.dpr || root.devicePixelRatio || 1;
      const cssW = canvas.clientWidth || root.innerWidth, cssH = canvas.clientHeight || root.innerHeight;
      let w = Math.round(cssW * dpr), h = Math.round(cssH * dpr);
      const k = Math.min(1, (opts.maxSide || DEFAULTS.maxSide) / Math.max(w, h));
      w = Math.max(1, Math.round(w * k)); h = Math.max(1, Math.round(h * k));
      const key = w + "x" + h;
      if (!force && key === last) return;
      last = key;
      canvas.width = w; canvas.height = h;
      render(canvas.getContext("2d"), w, h, opts);
    }
    const later = () => { clearTimeout(timer); timer = setTimeout(draw, 120); };

    let ro = null;
    if (typeof ResizeObserver !== "undefined") { ro = new ResizeObserver(later); ro.observe(canvas); }
    else root.addEventListener("resize", later);
    draw(true);

    return {
      redraw(newOptions) { if (newOptions) opts = Object.assign(opts, newOptions); draw(true); },
      destroy() { clearTimeout(timer); if (ro) ro.disconnect(); else root.removeEventListener("resize", later); },
    };
  }

  /* ---------- export a PNG of any size (browser) ---------- */
  function exportPNG(width, height, options) {
    const c = root.document.createElement("canvas");
    c.width = width; c.height = height;
    render(c.getContext("2d"), width, height, options);
    return new Promise((resolve) => c.toBlob(resolve, "image/png"));
  }

  const api = { render, mount, exportPNG, defaults: DEFAULTS };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.TopoBackground = api;
})(typeof window !== "undefined" ? window : globalThis);
