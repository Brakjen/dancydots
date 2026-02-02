import { CONFIG } from "./config.js";
import { STATE, computeState } from "./state.js";

let canvas;
let ctx;
let container;
const CANVAS_ID = "dotCanvas";
const CONTAINER_ID = "canvasContainer";

// Global array to hold dot positions
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
 */
function pickColorWithVariation(colors) {
  if (!colors || colors.length === 0) return CONFIG.grid.color;
  const base = colors[Math.floor(Math.random() * colors.length)];
  const variation = (Math.random() - 0.5) * 10;
  return adjustColorLightness(base, variation);
}

/**
 * Adjusts a hex color's lightness.
 */
function adjustColorLightness(hex, amount) {
  if (!hex || hex.length < 7) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const adjust = (c) => Math.max(0, Math.min(255, Math.round(c + amount * 2.55)));
  const nr = adjust(r);
  const ng = adjust(g);
  const nb = adjust(b);

  return "#" + [nr, ng, nb].map((c) => c.toString(16).padStart(2, "0")).join("");
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
 */
function buildUniformGrid() {
  const newDots = [];
  const spacing = CONFIG.grid.spacing;
  const startOffset = -canvas.width * 0.5;

  for (let x = startOffset; x < canvas.width * 1.5; x += spacing) {
    for (let y = startOffset; y < canvas.height * 1.5; y += spacing) {
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
 */
function getPlacementRadius(layerIndex) {
  const layerConfig = STATE.layers[layerIndex];
  if (!layerConfig) return 10;
  return layerConfig.radius * Math.max(1, layerConfig.softness || 1) * 1.0;
}

/**
 * Checks if a position overlaps with any existing dots.
 */
function checkOverlap(x, y, radius, existingDots) {
  for (let i = 0; i < existingDots.length; i++) {
    const other = existingDots[i];
    const otherRadius = getPlacementRadius(other.layer);
    const dx = x - other.x;
    const dy = y - other.y;
    const minDist = radius + otherRadius;
    if (dx * dx + dy * dy < minDist * minDist) {
      return true;
    }
  }
  return false;
}

/**
 * Builds random dots per layer (layered mode).
 */
function buildLayeredDots() {
  const newDots = [];
  const layers = STATE.layers;
  const w = canvas.width;
  const h = canvas.height;
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

      newDots.push({
        x: x,
        y: y,
        x0: x,
        y0: y,
        layer: layerIndex,
        color: pickColorWithVariation(layerConfig.colors),
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
 * Draws layered dots with gradients.
 */
function drawLayeredScene(dotsArray) {
  const layers = STATE.layers;

  for (let layerIndex = 0; layerIndex < layers.length; layerIndex++) {
    const layerConfig = layers[layerIndex];
    const radius = layerConfig.radius;
    const softness = layerConfig.softness || 0;

    dotsArray.forEach(function (dot) {
      if (dot.layer !== layerIndex) return;

      const color = dot.color || CONFIG.grid.color;

      if (softness > 0) {
        const gradientRadius = radius * Math.max(1, softness);
        const gradient = ctx.createRadialGradient(
          dot.x, dot.y, 0,
          dot.x, dot.y, gradientRadius
        );

        // True Gaussian falloff
        const stops = 8;
        for (let i = 0; i <= stops; i++) {
          const t = i / stops;
          const gaussian = Math.exp(-Math.pow(t * 2.5, 2));
          gradient.addColorStop(t, hexToRgba(color, gaussian));
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, gradientRadius, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }
}

/**
 * Sets the canvas background color.
 */
export function setCanvasBackground(color) {
  ctx.fillStyle = color || CONFIG.backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
