import { CONFIG } from "./config.js";

/**
 * Field function source code templates.
 * Each field is self-contained with its required helpers.
 */
const FIELD_SOURCES = {
  randomWalk: `
function seededRandom(seed) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function fieldFn(x, y, options) {
  const time = (options && options.time) || 0;
  const x0 = (options && options.x0) || 0;
  const y0 = (options && options.y0) || 0;
  const speed = CONFIG.fields.randomWalk.speed;
  const turnSpeed = CONFIG.fields.randomWalk.turnSpeed;

  const dotId = x0 * 1.3 + y0 * 2.7;
  const period = 1 / turnSpeed;
  const timeStep = Math.floor(time / period);
  const timeFrac = (time % period) / period;

  const angle1 = seededRandom(dotId + timeStep * 100) * Math.PI * 2;
  const angle2 = seededRandom(dotId + (timeStep + 1) * 100) * Math.PI * 2;

  let angleDiff = angle2 - angle1;
  if (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
  if (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

  const ease = timeFrac * timeFrac * (3 - 2 * timeFrac);
  const angle = angle1 + angleDiff * ease;

  return { dx: Math.cos(angle) * speed, dy: Math.sin(angle) * speed };
}`,

  shiver: `
function fieldFn(x, y, options) {
  const x0 = options.x0;
  const y0 = options.y0;
  const amplitude = CONFIG.fields.shiver.amplitude;
  const restoreStrength = CONFIG.fields.shiver.restoreStrength;

  const distanceX = x - x0;
  const distanceY = y - y0;
  const dist = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
  const maxDist = 50;
  const penalty = Math.max(0, (dist - maxDist) / maxDist);

  const randomX = Math.random() - 0.5;
  const randomY = Math.random() - 0.5;
  const baseDx = randomX * amplitude * (1 - penalty);
  const baseDy = randomY * amplitude * (1 - penalty);

  const restoreX = (x0 - x) * restoreStrength;
  const restoreY = (y0 - y) * restoreStrength;

  return { dx: restoreX + baseDx, dy: restoreY + baseDy };
}`,

  wave: `
function fieldFn(x, y, options) {
  const time = options.time;
  const k = CONFIG.fields.wave.waveNumber;
  const omega = CONFIG.fields.wave.angularFrequency;
  const amplitude = CONFIG.fields.wave.amplitude;

  const phase = k * x - omega * time;
  const dx = amplitude * Math.sin(phase);

  return { dx: dx, dy: 0 };
}`,

  curlNoise: `
function fade(t) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function hash3(i, j, k) {
  let n = i + j * 57 + k * 131;
  n = (n << 13) ^ n;
  const nn = (n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff;
  return nn;
}

function noise3(x, y, t) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const ti = Math.floor(t);
  const xf = x - xi;
  const yf = y - yi;
  const tf = t - ti;

  const u = fade(xf);
  const v = fade(yf);
  const w = fade(tf);

  function corner(ix, iy, it) {
    return hash3(ix, iy, it) / 1073741824.0;
  }

  const c000 = corner(xi, yi, ti);
  const c100 = corner(xi + 1, yi, ti);
  const c010 = corner(xi, yi + 1, ti);
  const c110 = corner(xi + 1, yi + 1, ti);
  const c001 = corner(xi, yi, ti + 1);
  const c101 = corner(xi + 1, yi, ti + 1);
  const c011 = corner(xi, yi + 1, ti + 1);
  const c111 = corner(xi + 1, yi + 1, ti + 1);

  function lerp(a, b, t2) {
    return a + (b - a) * t2;
  }

  const x00 = lerp(c000, c100, u);
  const x10 = lerp(c010, c110, u);
  const x01 = lerp(c001, c101, u);
  const x11 = lerp(c011, c111, u);

  const y0 = lerp(x00, x10, v);
  const y1 = lerp(x01, x11, v);

  return lerp(y0, y1, w);
}

function fieldFn(x, y, options) {
  const time = (options && options.time) || 0;
  const s = CONFIG.fields.curlNoise.scale;
  const amp = CONFIG.fields.curlNoise.amplitude;
  const tSpeed = CONFIG.fields.curlNoise.timeSpeed;
  const eps = 0.001;

  const nx1 = noise3((x + eps) * s, y * s, time * tSpeed);
  const nx2 = noise3((x - eps) * s, y * s, time * tSpeed);
  const ny1 = noise3(x * s, (y + eps) * s, time * tSpeed);
  const ny2 = noise3(x * s, (y - eps) * s, time * tSpeed);

  const dndx = (nx1 - nx2) / (2 * eps);
  const dndy = (ny1 - ny2) / (2 * eps);

  return { dx: amp * dndy, dy: -amp * dndx };
}`,

  multiWave: `
function fieldFn(x, y, options) {
  const time = (options && options.time) || 0;
  const comps = CONFIG.fields.multiWave.components;
  let dx = 0;
  let dy = 0;
  const n = comps.length || 1;

  for (let i = 0; i < comps.length; i++) {
    const c = comps[i];
    const k = c.k;
    const angle = c.angle !== undefined ? c.angle : (i * Math.PI * 2) / n;
    const phase = k * (x * Math.cos(angle) + y * Math.sin(angle)) - c.omega * time + (c.phi || 0);
    const amp = c.amplitude || 1;
    dx += amp * Math.sin(phase) * -Math.sin(angle);
    dy += amp * Math.sin(phase) * Math.cos(angle);
  }
  return { dx, dy };
}`,

  vortexLattice: `
function fieldFn(x, y, options) {
  const centers = STATE.vortexCenters;
  const R = CONFIG.fields.vortexLattice.radius;
  const S = CONFIG.fields.vortexLattice.strength;
  let dx = 0;
  let dy = 0;

  for (let i = 0; i < centers.length; i++) {
    const cx = centers[i].x;
    const cy = centers[i].y;
    const rx = x - cx;
    const ry = y - cy;
    const d2 = rx * rx + ry * ry;
    if (d2 === 0) continue;
    const d = Math.sqrt(d2);
    const fall = Math.exp(-(d * d) / (R * R));
    const s = S * fall;
    dx += s * (-ry / d);
    dy += s * (rx / d);
  }
  return { dx, dy };
}`,

  waveNoise: `
function fade(t) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function hash3(i, j, k) {
  let n = i + j * 57 + k * 131;
  n = (n << 13) ^ n;
  const nn = (n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff;
  return nn;
}

function noise3(x, y, t) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const ti = Math.floor(t);
  const xf = x - xi;
  const yf = y - yi;
  const tf = t - ti;

  const u = fade(xf);
  const v = fade(yf);
  const w = fade(tf);

  function corner(ix, iy, it) {
    return hash3(ix, iy, it) / 1073741824.0;
  }

  const c000 = corner(xi, yi, ti);
  const c100 = corner(xi + 1, yi, ti);
  const c010 = corner(xi, yi + 1, ti);
  const c110 = corner(xi + 1, yi + 1, ti);
  const c001 = corner(xi, yi, ti + 1);
  const c101 = corner(xi + 1, yi, ti + 1);
  const c011 = corner(xi, yi + 1, ti + 1);
  const c111 = corner(xi + 1, yi + 1, ti + 1);

  function lerp(a, b, t2) {
    return a + (b - a) * t2;
  }

  const x00 = lerp(c000, c100, u);
  const x10 = lerp(c010, c110, u);
  const x01 = lerp(c001, c101, u);
  const x11 = lerp(c011, c111, u);

  const y0 = lerp(x00, x10, v);
  const y1 = lerp(x01, x11, v);

  return lerp(y0, y1, w);
}

function fieldFn(x, y, options) {
  const time = (options && options.time) || 0;
  const waveCfg = CONFIG.fields.wave;
  const noiseCfg = CONFIG.fields.waveNoise;
  const wave_dx = waveCfg.amplitude * Math.sin(waveCfg.waveNumber * x - waveCfg.angularFrequency * time);
  const noise_val = noise3(x * noiseCfg.scale, y * noiseCfg.scale, time * noiseCfg.timeSpeed);
  const dx = wave_dx + noiseCfg.amplitude * (noise_val - 0.5);
  return { dx, dy: 0 };
}`,

  standingWave: `
function fieldFn(x, y, options) {
  const time = (options && options.time) || 0;
  const cfg = CONFIG.fields.standingWave;
  const dx = cfg.amplitude * Math.sin(cfg.waveNumber * x) * Math.cos(cfg.angularFrequency * time);
  return { dx, dy: 0 };
}`,

  cellular: `
function fieldFn(x, y, options) {
  const cs = CONFIG.fields.cellular.cellSize;
  const strength = CONFIG.fields.cellular.strength;
  const cx = Math.floor(x / cs) * cs + cs / 2;
  const cy = Math.floor(y / cs) * cs + cs / 2;
  const centers = [
    [cx, cy],
    [cx + cs, cy],
    [cx, cy + cs],
    [cx + cs, cy + cs],
  ];
  let dx = 0;
  let dy = 0;
  for (let c of centers) {
    const rx = x - c[0];
    const ry = y - c[1];
    const d2 = rx * rx + ry * ry;
    const d = Math.sqrt(d2) + 1e-6;
    const fall = Math.exp(-d2 / (cs * cs));
    const s = strength * fall;
    dx += s * (-ry / d);
    dy += s * (rx / d);
  }
  return { dx, dy };
}`,
};

/**
 * Serializes current CONFIG values needed for export.
 * Handles special cases like Math.PI in multiWave components.
 */
function serializeConfig() {
  const fieldKey = CONFIG.currentField;
  const fieldConfig = CONFIG.fields[fieldKey];

  // Build a minimal config object
  const exportConfig = {
    mode: CONFIG.mode,
    currentField: CONFIG.currentField,
    backgroundColor: CONFIG.backgroundColor,
    fps: CONFIG.fps,
    collisionsEnabled: CONFIG.collisionsEnabled,
    grid: { ...CONFIG.grid },
    layers: CONFIG.layers.map((l) => ({
      count: l.count,
      radiusRatio: l.radiusRatio,
      softness: l.softness,
      speedMultiplier: l.speedMultiplier,
      drawMode: l.drawMode || "bokeh",
      colors: [...l.colors],
    })),
    fields: {},
  };

  // Include only the active field's config
  exportConfig.fields[fieldKey] = JSON.parse(JSON.stringify(fieldConfig));

  // For waveNoise, also need wave config
  if (fieldKey === "waveNoise") {
    exportConfig.fields.wave = JSON.parse(JSON.stringify(CONFIG.fields.wave));
  }

  // For vortexLattice, need to include spacing for vortex center generation
  if (fieldKey === "vortexLattice") {
    exportConfig.fields.vortexLattice = JSON.parse(
      JSON.stringify(CONFIG.fields.vortexLattice),
    );
  }

  return JSON.stringify(exportConfig, null, 2);
}

/**
 * Generates the complete self-contained HTML export.
 */
export function generateExportCode() {
  const fieldKey = CONFIG.currentField;
  const fieldSource = FIELD_SOURCES[fieldKey];

  if (!fieldSource) {
    console.error(`No export template for field: ${fieldKey}`);
    return null;
  }

  const needsVortexCenters = fieldKey === "vortexLattice";
  const configJson = serializeConfig();

  return `<!-- DancyDots Background - Generated Export -->
<canvas id="dancydots-bg"></canvas>
<style>
  #dancydots-bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: -1;
    pointer-events: none;
  }
</style>
<script>
(function() {
  "use strict";

  // ============================================
  // Configuration (baked from DancyDots UI)
  // ============================================
  const CONFIG = ${configJson};

  // ============================================
  // State (computed at runtime)
  // ============================================
  const STATE = {
    canvasWidth: 0,
    canvasHeight: 0,
    animationInterval: 1000 / CONFIG.fps,
    layers: [],
    vortexCenters: []
  };

  function computeState(w, h) {
    STATE.canvasWidth = w;
    STATE.canvasHeight = h;
    STATE.animationInterval = 1000 / CONFIG.fps;
    STATE.layers = CONFIG.layers.map(function(layer) {
      return Object.assign({}, layer, { radius: h * layer.radiusRatio });
    });
    ${
      needsVortexCenters
        ? `
    // Compute vortex centers
    const spacing = CONFIG.fields.vortexLattice.spacing;
    STATE.vortexCenters = [];
    if (spacing > 0) {
      for (let x = spacing / 2; x < w; x += spacing) {
        for (let y = spacing / 2; y < h; y += spacing) {
          STATE.vortexCenters.push({ x: Math.round(x), y: Math.round(y) });
        }
      }
    }`
        : ""
    }
  }

  // ============================================
  // Field Function
  // ============================================
  ${fieldSource}

  // ============================================
  // Canvas & Dots
  // ============================================
  const canvas = document.getElementById("dancydots-bg");
  const ctx = canvas.getContext("2d");
  let dots = [];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    computeState(canvas.width, canvas.height);
    dots = buildDots();
  }

  function hexToRgba(hex, alpha) {
    if (!hex || hex.length < 7) return "rgba(128,128,128," + alpha + ")";
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return "rgba(" + r + "," + g + "," + b + "," + alpha + ")";
  }

  function pickColor(colors) {
    if (!colors || colors.length === 0) return { color: CONFIG.grid.color, colorIndex: 0 };
    const idx = Math.floor(Math.random() * colors.length);
    return { color: colors[idx], colorIndex: idx };
  }

  function buildDots() {
    const newDots = [];
    if (CONFIG.mode === "layered") {
      const w = canvas.width;
      const h = canvas.height;
      // Small margin (5%) to avoid dots popping in/out at edges
      const margin = 0.05;
      for (let li = 0; li < STATE.layers.length; li++) {
        const layer = STATE.layers[li];
        // Handle count=0 explicitly (don't default to 50)
        const count = layer.count !== undefined ? layer.count : 50;
        for (let i = 0; i < count; i++) {
          const x = (Math.random() - margin) * w * (1 + 2 * margin);
          const y = (Math.random() - margin) * h * (1 + 2 * margin);
          const picked = pickColor(layer.colors);
          newDots.push({ x: x, y: y, x0: x, y0: y, layer: li, color: picked.color, colorIndex: picked.colorIndex });
        }
      }
    } else {
      const spacing = CONFIG.grid.spacing;
      const startOffset = -canvas.width * 0.5;
      for (let x = startOffset; x < canvas.width * 1.5; x += spacing) {
        for (let y = startOffset; y < canvas.height * 1.5; y += spacing) {
          newDots.push({ x: x, y: y, x0: x, y0: y, layer: null, color: CONFIG.grid.color });
        }
      }
    }
    return newDots;
  }

  function drawScene() {
    ctx.fillStyle = CONFIG.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (CONFIG.mode === "layered") {
      // Pre-group dots by layer for O(n) iteration
      const dotsByLayer = [];
      for (let i = 0; i < STATE.layers.length; i++) dotsByLayer[i] = [];
      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        if (dot.layer !== null && dot.layer < STATE.layers.length) {
          dotsByLayer[dot.layer].push(dot);
        }
      }
      // Sort each layer by colorIndex for z-ordering (first color at bottom)
      for (let i = 0; i < dotsByLayer.length; i++) {
        dotsByLayer[i].sort(function(a, b) { return (a.colorIndex || 0) - (b.colorIndex || 0); });
      }

      for (let li = 0; li < STATE.layers.length; li++) {
        const layer = STATE.layers[li];
        const radius = layer.radius;
        const softness = layer.softness || 0;
        const drawMode = layer.drawMode || "bokeh";
        const layerDots = dotsByLayer[li];

        // Solid mode: batch all dots (fastest)
        if (drawMode === "solid" || softness === 0) {
          const byColor = {};
          for (let i = 0; i < layerDots.length; i++) {
            const dot = layerDots[i];
            const color = dot.color || CONFIG.grid.color;
            if (!byColor[color]) byColor[color] = [];
            byColor[color].push(dot);
          }
          for (const color in byColor) {
            ctx.fillStyle = color;
            ctx.beginPath();
            const colorDots = byColor[color];
            for (let i = 0; i < colorDots.length; i++) {
              const dot = colorDots[i];
              ctx.moveTo(dot.x + radius, dot.y);
              ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
            }
            ctx.fill();
          }
          continue;
        }

        // Gradient modes
        const gr = radius * Math.max(1, softness);
        for (let i = 0; i < layerDots.length; i++) {
          const dot = layerDots[i];
          const color = dot.color || CONFIG.grid.color;
          const gradient = ctx.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y, gr);
          
          if (drawMode === "gaussian") {
            for (let s = 0; s <= 8; s++) {
              const t = s / 8;
              const g = Math.exp(-Math.pow(t * 2.5, 2));
              gradient.addColorStop(t, hexToRgba(color, g));
            }
          } else {
            // Bokeh
            const edgeStart = Math.max(0.3, 1 - softness);
            const edgeWidth = Math.min(0.5, softness * 0.5);
            for (let s = 0; s <= 8; s++) {
              const t = s / 8;
              const ring = 0.3 + 0.7 * t;
              const falloff = t < edgeStart ? 1.0 : Math.max(0, 1 - (t - edgeStart) / edgeWidth);
              gradient.addColorStop(t, hexToRgba(color, ring * falloff));
            }
          }
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, gr, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else {
      // Grid mode: batch all dots
      ctx.fillStyle = CONFIG.grid.color;
      ctx.beginPath();
      const radius = CONFIG.grid.radius;
      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        ctx.moveTo(dot.x + radius, dot.y);
        ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
      }
      ctx.fill();
    }
  }

  // ============================================
  // Collision Handling
  // ============================================
  function getCollisionRadius(dot) {
    if (dot.layer === null) return CONFIG.grid.radius;
    const layer = STATE.layers[dot.layer];
    if (!layer) return CONFIG.grid.radius;
    return layer.radius * Math.max(1, layer.softness || 1) * 0.6;
  }

  function handleCollisions() {
    if (CONFIG.mode !== "layered" || !CONFIG.collisionsEnabled) return;
    const len = dots.length;
    for (let i = 0; i < len; i++) {
      const dotA = dots[i];
      const radiusA = getCollisionRadius(dotA);
      for (let j = i + 1; j < len; j++) {
        const dotB = dots[j];
        const radiusB = getCollisionRadius(dotB);
        const dx = dotB.x - dotA.x;
        const dy = dotB.y - dotA.y;
        const distSq = dx * dx + dy * dy;
        const minDist = radiusA + radiusB;
        if (distSq < minDist * minDist && distSq > 0) {
          const dist = Math.sqrt(distSq);
          const overlap = minDist - dist;
          const nx = dx / dist;
          const ny = dy / dist;
          const pushX = nx * overlap * 0.5;
          const pushY = ny * overlap * 0.5;
          dotA.x -= pushX;
          dotA.y -= pushY;
          dotB.x += pushX;
          dotB.y += pushY;
        }
      }
    }
  }

  // ============================================
  // Animation Loop
  // ============================================
  let lastUpdate = 0;

  function animate(timestamp) {
    const timeInSeconds = timestamp / 1000;
    if (timestamp - lastUpdate >= STATE.animationInterval) {
      // Delta time: normalized to 60fps baseline for consistent speed
      const dt = ((timestamp - lastUpdate) / 1000) * 60;

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        const options = { x0: dot.x0, y0: dot.y0, time: timeInSeconds };
        const field = fieldFn(dot.x, dot.y, options);
        let speed = 1.0;
        if (CONFIG.mode === "layered" && dot.layer !== null) {
          const layerConfig = STATE.layers[dot.layer];
          speed = layerConfig ? layerConfig.speedMultiplier : 1.0;
        }
        dot.vx = field.dx * speed;
        dot.vy = field.dy * speed;
        dot.x += dot.vx * dt;
        dot.y += dot.vy * dt;

        // Boundary conditions based on layer
        const w = canvas.width;
        const h = canvas.height;
        if (w > 0 && h > 0) {
          if (dot.layer === 2 || dot.layer === null) {
            // Layer 3 (small dots) and grid mode: periodic boundary (wrap around)
            dot.x = ((dot.x % w) + w) % w;
            dot.y = ((dot.y % h) + h) % h;
          } else {
            // Layers 1, 2 (large dots): soft containment with bounce
            var radius = STATE.layers[dot.layer] ? STATE.layers[dot.layer].radius : 10;
            if (dot.x < radius) { dot.x = radius; dot.vx = Math.abs(dot.vx) * 0.5; }
            else if (dot.x > w - radius) { dot.x = w - radius; dot.vx = -Math.abs(dot.vx) * 0.5; }
            if (dot.y < radius) { dot.y = radius; dot.vy = Math.abs(dot.vy) * 0.5; }
            else if (dot.y > h - radius) { dot.y = h - radius; dot.vy = -Math.abs(dot.vy) * 0.5; }
          }
        }
      }
      handleCollisions();
      drawScene();
      lastUpdate = timestamp;
    }
    requestAnimationFrame(animate);
  }

  // ============================================
  // Initialize
  // ============================================
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  requestAnimationFrame(animate);
})();
</script>`;
}

/**
 * Downloads the export as an HTML file.
 */
export function downloadExport() {
  const code = generateExportCode();
  if (!code) return;

  const mode = CONFIG.mode;
  const field = CONFIG.currentField;
  const filename = `dancydots_${mode}_${field}.html`;

  const blob = new Blob([code], { type: "text/html" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
