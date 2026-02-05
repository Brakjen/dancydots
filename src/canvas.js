/**
 * Canvas rendering and dot placement module.
 *
 * Responsibilities:
 * - Initialize and manage HTML canvas element
 * - Build dot grids (uniform or layered)
 * - Render dots with bokeh-style blur
 * - Handle canvas resizing
 *
 * Rendering pipeline:
 * 1. Clear canvas with background color
 * 2. For each layer (back to front):
 *    a. For each dot in that layer:
 *       - Create radial gradient with bokeh falloff
 *       - Draw circle at dot position
 *
 * Visual effects:
 * - Bokeh blur: Simulates camera lens out-of-focus highlights
 * - Layer ordering: Larger dots rendered first (background)
 * - Color variation: Slight randomness for organic look
 */
import { CONFIG } from "./config.js";
import { STATE, computeState } from "./state.js";

let canvas;
let ctx;
let container;
const CANVAS_ID = "dotCanvas";
const CONTAINER_ID = "canvasContainer";

/**
 * Global array to hold dot positions.
 * Each dot has properties:
 * - x, y: current position
 * - x0, y0: initial/home position
 * - vx, vy: velocity (set during animation)
 * - layer: layer index (null for grid mode)
 * - color: hex color string
 */
export let dots = [];

/**
 * Resize the canvas to fit its container.
 */
function resizeCanvas() {
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
}

/**
 * Initializes the canvas element and sets up initial drawing.
 */
export function initCanvas() {
  container = document.getElementById(CONTAINER_ID);
  canvas = document.getElementById(CANVAS_ID);
  ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;

  // Set size to container
  resizeCanvas();

  // Compute state from config + canvas dimensions
  computeState(canvas.width, canvas.height);

  // Initial draw
  setCanvasBackground();
  dots = buildDotGrid();
  drawScene(dots);

  // Handle resize
  window.addEventListener("resize", function () {
    resizeCanvas();
    computeState(canvas.width, canvas.height);
    dots = buildDotGrid();
    setCanvasBackground();
    drawScene(dots);
  });
}

/**
 * Rebuild dots and redraw. Call when config changes.
 */
export function refresh() {
  computeState(canvas.width, canvas.height);
  dots = buildDotGrid();
  setCanvasBackground();
  drawScene(dots);
}

/**
 * Get the canvas element.
 */
export function getCanvas() {
  return canvas;
}

/**
 * Get the canvas context.
 */
export function getContext() {
  return ctx;
}

/**
 * Converts hex color to rgba string with alpha.
 */
function hexToRgba(hex, alpha) {
  // Handle shorthand or invalid
  if (!hex || hex.length < 7) return `rgba(128,128,128,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/**
 * Picks a random color from array and applies slight variation.
 * Returns both the color and its index for z-ordering.
 * @param {Array} colors - Array of hex color strings
 * @returns {Object} { color: string, colorIndex: number }
 */
function pickColorWithVariation(colors) {
  if (!colors || colors.length === 0) {
    return { color: CONFIG.grid.color, colorIndex: 0 };
  }
  const idx = Math.floor(Math.random() * colors.length);
  const base = colors[idx];
  const variation = (Math.random() - 0.5) * 10;
  return { color: adjustColorLightness(base, variation), colorIndex: idx };
}

/**
 * Adjusts a hex color's lightness.
 */
function adjustColorLightness(hex, amount) {
  if (!hex || hex.length < 7) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const adjust = (c) =>
    Math.max(0, Math.min(255, Math.round(c + amount * 2.55)));
  const nr = adjust(r);
  const ng = adjust(g);
  const nb = adjust(b);

  return (
    "#" + [nr, ng, nb].map((c) => c.toString(16).padStart(2, "0")).join("")
  );
}

/**
 * Builds dots based on mode setting.
 */
export function buildDotGrid() {
  if (CONFIG.mode === "layered") {
    return buildLayeredDots();
  } else {
    return buildUniformGrid();
  }
}

/**
 * Builds uniform grid of dots (grid mode).
 * Creates dots in a regular grid pattern with spacing between them.
 * Grid extends beyond viewport (by 0.5x width/height) to ensure
 * smooth scrolling/panning without visible edges.
 * @returns {Array} Array of dot objects
 */
function buildUniformGrid() {
  const newDots = [];
  const spacing = CONFIG.grid.spacing;
  // Start beyond left edge to fill entire visible area
  const startOffset = -canvas.width * 0.2;

  for (let x = startOffset; x < canvas.width * 1.2; x += spacing) {
    for (let y = startOffset; y < canvas.height * 1.2; y += spacing) {
      newDots.push({
        x: x,
        y: y,
        x0: x,
        y0: y,
        layer: null,
        color: CONFIG.grid.color,
      });
    }
  }
  return newDots;
}

/**
 * Gets collision radius for a dot during placement.
 * Collision radius is larger than visual radius to prevent overlap.
 * Formula: base_radius * softness_multiplier * spacing_multiplier
 * - Softness affects visual blur, so larger softness = larger collision zone
 * - dotSpacing allows user to control packing density
 * @param {number} layerIndex - Index of the layer
 * @returns {number} Collision radius in pixels
 */
function getPlacementRadius(layerIndex) {
  const layerConfig = STATE.layers[layerIndex];
  if (!layerConfig) return 10;
  return (
    layerConfig.radius *
    Math.max(1, layerConfig.softness || 1) *
    CONFIG.dotSpacing
  );
}

/**
 * Checks if a position overlaps with any existing dots.
 * Uses circle-circle collision detection (distance between centers).
 * @param {number} x - X coordinate to check
 * @param {number} y - Y coordinate to check
 * @param {number} radius - Collision radius of new dot
 * @param {Array} existingDots - Array of already-placed dots
 * @returns {boolean} True if position overlaps, false if clear
 */
function checkOverlap(x, y, radius, existingDots) {
  for (let i = 0; i < existingDots.length; i++) {
    const other = existingDots[i];
    const otherRadius = getPlacementRadius(other.layer);
    const dx = x - other.x;
    const dy = y - other.y;
    const minDist = radius + otherRadius;
    // Use squared distance to avoid expensive sqrt
    if (dx * dx + dy * dy < minDist * minDist) {
      return true;
    }
  }
  return false;
}

/**
 * Adds dots to a specific layer without rebuilding the entire grid.
 * @param {number} layerIndex - The layer to add dots to
 * @param {number} count - Number of dots to add
 */
export function addDotsToLayer(layerIndex, count) {
  const layerConfig = STATE.layers[layerIndex];
  if (!layerConfig) return;

  const w = canvas.width;
  const h = canvas.height;
  const margin = 0.3;
  const maxAttempts = 100;
  const placementRadius = getPlacementRadius(layerIndex);

  for (let i = 0; i < count; i++) {
    let x, y;
    let attempts = 0;
    let placed = false;

    while (!placed && attempts < maxAttempts) {
      x = (Math.random() - margin) * w * (1 + 2 * margin);
      y = (Math.random() - margin) * h * (1 + 2 * margin);
      if (!checkOverlap(x, y, placementRadius, dots)) {
        placed = true;
      }
      attempts++;
    }

    dots.push({
      x: x,
      y: y,
      x0: x,
      y0: y,
      layer: layerIndex,
      color: pickColorWithVariation(layerConfig.colors),
    });
  }
}

/**
 * Removes dots from a specific layer without rebuilding the entire grid.
 * @param {number} layerIndex - The layer to remove dots from
 * @param {number} count - Number of dots to remove
 */
export function removeDotsFromLayer(layerIndex, count) {
  let removed = 0;
  // Remove from the end of the array (most recently added)
  for (let i = dots.length - 1; i >= 0 && removed < count; i--) {
    if (dots[i].layer === layerIndex) {
      dots.splice(i, 1);
      removed++;
    }
  }
}

/**
 * Builds random dots per layer (layered mode).
 * Uses Poisson-disc-like sampling to place dots without overlap.
 * For each dot:
 *   1. Try random position
 *   2. Check if it overlaps existing dots
 *   3. If overlap, retry up to maxAttempts
 *   4. Place anyway if max attempts reached (ensures count is met)
 * @returns {Array} Array of dot objects sorted by layer
 */
function buildLayeredDots() {
  const newDots = [];
  const layers = STATE.layers;
  const w = canvas.width;
  const h = canvas.height;
  // Margin extends placement area beyond viewport for seamless edges
  const margin = 0.3;
  const maxAttempts = 100;

  for (let layerIndex = 0; layerIndex < layers.length; layerIndex++) {
    const layerConfig = layers[layerIndex];
    const count = layerConfig.count !== undefined ? layerConfig.count : 50;
    const placementRadius = getPlacementRadius(layerIndex);

    for (let i = 0; i < count; i++) {
      let x, y;
      let attempts = 0;
      let placed = false;

      while (!placed && attempts < maxAttempts) {
        x = (Math.random() - margin) * w * (1 + 2 * margin);
        y = (Math.random() - margin) * h * (1 + 2 * margin);
        if (!checkOverlap(x, y, placementRadius, newDots)) {
          placed = true;
        }
        attempts++;
      }

      const picked = pickColorWithVariation(layerConfig.colors);
      newDots.push({
        x: x,
        y: y,
        x0: x,
        y0: y,
        layer: layerIndex,
        color: picked.color,
        colorIndex: picked.colorIndex,
      });
    }
  }
  return newDots;
}

/**
 * Draws dots on the canvas.
 */
export function drawScene(dotsArray) {
  setCanvasBackground();

  if (CONFIG.mode === "layered") {
    drawLayeredScene(dotsArray);
  } else {
    drawGridScene(dotsArray);
  }
}

/**
 * Draws uniform grid dots.
 */
function drawGridScene(dotsArray) {
  ctx.fillStyle = CONFIG.grid.color;
  const radius = CONFIG.grid.radius;
  dotsArray.forEach(function (dot) {
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
    ctx.fill();
  });
}

/**
 * Draws layered dots with various rendering modes.
 * drawMode options:
 *   - "solid": Simple filled circles (fastest)
 *   - "gaussian": Smooth center-weighted blur
 *   - "bokeh": Lens-style blur with bright ring edge
 *
 * Performance optimization: Pre-group dots by layer to avoid
 * iterating all dots for each layer (O(n*layers) → O(n))
 */
function drawLayeredScene(dotsArray) {
  const layers = STATE.layers;

  // Pre-group dots by layer index for O(n) iteration instead of O(n*layers)
  const dotsByLayer = [];
  for (let i = 0; i < layers.length; i++) {
    dotsByLayer[i] = [];
  }
  for (let i = 0; i < dotsArray.length; i++) {
    const dot = dotsArray[i];
    if (dot.layer !== null && dot.layer < layers.length) {
      dotsByLayer[dot.layer].push(dot);
    }
  }
  // Sort each layer by colorIndex for z-ordering (first color at bottom)
  for (let i = 0; i < dotsByLayer.length; i++) {
    dotsByLayer[i].sort((a, b) => (a.colorIndex || 0) - (b.colorIndex || 0));
  }

  for (let layerIndex = 0; layerIndex < layers.length; layerIndex++) {
    const layerConfig = layers[layerIndex];
    const radius = layerConfig.radius;
    // Read from CONFIG for live updates without grid rebuild
    const softness = CONFIG.layers[layerIndex]?.softness || 0;
    const drawMode = CONFIG.layers[layerIndex]?.drawMode || "bokeh";
    const layerDots = dotsByLayer[layerIndex];

    // Solid mode: batch all dots in one path (much faster)
    if (drawMode === "solid" || softness === 0) {
      // Group by color for batching
      const byColor = {};
      for (let i = 0; i < layerDots.length; i++) {
        const dot = layerDots[i];
        const color = dot.color || CONFIG.grid.color;
        if (!byColor[color]) byColor[color] = [];
        byColor[color].push(dot);
      }

      // Draw each color batch in a single path
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

    // Gradient modes - must draw individually
    const gradientRadius = radius * Math.max(1, softness);

    for (let i = 0; i < layerDots.length; i++) {
      const dot = layerDots[i];
      const color = dot.color || CONFIG.grid.color;

      const gradient = ctx.createRadialGradient(
        dot.x,
        dot.y,
        0,
        dot.x,
        dot.y,
        gradientRadius,
      );

      if (drawMode === "gaussian") {
        // Gaussian: smooth center-weighted falloff
        const stops = 8;
        for (let s = 0; s <= stops; s++) {
          const t = s / stops;
          const gaussian = Math.exp(-Math.pow(t * 2.5, 2));
          gradient.addColorStop(t, hexToRgba(color, gaussian));
        }
      } else {
        // Bokeh: lens-style blur with bright ring edge
        const stops = 8;
        const edgeStart = Math.max(0.3, 1 - softness);
        const edgeWidth = Math.min(0.5, softness * 0.5);

        for (let s = 0; s <= stops; s++) {
          const t = s / stops;
          const ring = 0.3 + 0.7 * t;
          const falloff =
            t < edgeStart ? 1.0 : Math.max(0, 1 - (t - edgeStart) / edgeWidth);
          gradient.addColorStop(t, hexToRgba(color, ring * falloff));
        }
      }

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, gradientRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/**
 * Sets the canvas background color.
 */
export function setCanvasBackground(color) {
  ctx.fillStyle = color || CONFIG.backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
