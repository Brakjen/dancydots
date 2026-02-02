import { SETTINGS } from "./settings.js";

let canvas;
let ctx;
const CANVAS_ID = "dotCanvas";

// Global array to hold dot positions
export let dots = [];

/**
 * Updates layer radii based on current canvas height.
 * Call after canvas dimensions are set.
 */
function updateLayerRadii() {
  const h = canvas.height;
  if (SETTINGS.layers[0]) {
    SETTINGS.layers[0].radius = h / 2;
  }
  if (SETTINGS.layers[1]) {
    SETTINGS.layers[1].radius = h / 10;
  }
}

/**
 * Initializes the canvas element and sets up initial drawing.
 */
export function initCanvas() {
  canvas = document.getElementById(CANVAS_ID);
  ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;

  // Set size
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  SETTINGS.canvasWidth = canvas.width;
  SETTINGS.canvasHeight = canvas.height;

  // Update layer radii based on canvas size
  updateLayerRadii();

  // Initial draw
  setCanvasBackground();
  dots = buildDotGrid();
  drawScene(dots, SETTINGS.dotColor);

  // Handle resize
  window.addEventListener("resize", function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    SETTINGS.canvasWidth = canvas.width;
    SETTINGS.canvasHeight = canvas.height;
    updateLayerRadii(); // Recalculate radii on resize
    dots = buildDotGrid(); // Update global dots array
    setCanvasBackground();
    drawScene(dots, SETTINGS.dotColor);
  });
}

/**
 * Converts hex color to rgba string with alpha.
 * @param {string} hex - Hex color like \"#1a3a3a\"
 * @param {number} alpha - Alpha value 0-1
 * @returns {string} rgba string
 */
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return "rgba(" + r + "," + g + "," + b + "," + alpha + ")";
}

/**
 * Picks a random color from array and applies slight HSL variation.
 * @param {Array} colors - Array of hex color strings
 * @returns {string} A color string with slight variation
 */
function pickColorWithVariation(colors) {
  if (!colors || colors.length === 0) return SETTINGS.dotColor;
  const base = colors[Math.floor(Math.random() * colors.length)];
  // Add slight variation by adjusting lightness
  const variation = (Math.random() - 0.5) * 10; // ±5% lightness
  return adjustColorLightness(base, variation);
}

/**
 * Adjusts a hex color's lightness.
 * @param {string} hex - Hex color like "#1a3a3a"
 * @param {number} amount - Lightness adjustment (-100 to 100)
 * @returns {string} Adjusted hex color
 */
function adjustColorLightness(hex, amount) {
  // Parse hex
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  // Simple lightness adjustment
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
 * Builds dots based on gridMode setting.
 * "grid" = uniform spacing (original), "layered" = random per-layer counts
 * @returns {Array} Array of dot position objects
 */
export function buildDotGrid() {
  if (SETTINGS.gridMode === "layered") {
    return buildLayeredDots();
  } else {
    return buildUniformGrid();
  }
}

/**
 * Builds uniform grid of dots (original approach).
 * @returns {Array} Array of dot objects
 */
function buildUniformGrid() {
  const newDots = [];
  const spacing = SETTINGS.dotSpacing;
  const startOffset = -canvas.width * 0.5;

  for (let x = startOffset; x < canvas.width * 1.5; x = x + spacing) {
    for (let y = startOffset; y < canvas.height * 1.5; y = y + spacing) {
      const dot = {
        x: x,
        y: y,
        x0: x,
        y0: y,
        layer: null, // No layer in grid mode
        color: SETTINGS.dotColor,
      };
      newDots.push(dot);
    }
  }
  return newDots;
}

/**
 * Gets collision radius for a dot during placement.
 * Uses same logic as animation collision but can be tuned separately.
 */
function getPlacementRadius(layerIndex) {
  const layerConfig = SETTINGS.layers[layerIndex];
  if (!layerConfig) return 10;
  // Use 40% of visual radius for collision (same as animation)
  return layerConfig.radius * Math.max(1, layerConfig.softness || 1) * 1.0;
}

/**
 * Checks if a position overlaps with any existing dots.
 * @param {number} x - X position to check
 * @param {number} y - Y position to check
 * @param {number} radius - Collision radius of new dot
 * @param {Array} existingDots - Array of already placed dots
 * @returns {boolean} True if overlapping
 */
function checkOverlap(x, y, radius, existingDots) {
  for (let i = 0; i < existingDots.length; i++) {
    const other = existingDots[i];
    const otherRadius = getPlacementRadius(other.layer);
    const dx = x - other.x;
    const dy = y - other.y;
    const minDist = radius + otherRadius;
    if (dx * dx + dy * dy < minDist * minDist) {
      return true; // Overlapping
    }
  }
  return false;
}

/**
 * Builds random dots per layer with per-dot colors.
 * Ensures no initial overlap between dots.
 * @returns {Array} Array of dot objects
 */
function buildLayeredDots() {
  const newDots = [];
  const layers = SETTINGS.layers;
  const w = canvas.width;
  const h = canvas.height;
  const margin = 0.3;
  const maxAttempts = 100; // Prevent infinite loops

  for (let layerIndex = 0; layerIndex < layers.length; layerIndex++) {
    const layerConfig = layers[layerIndex];
    const count = layerConfig.count !== undefined ? layerConfig.count : 50;
    const placementRadius = getPlacementRadius(layerIndex);

    for (let i = 0; i < count; i++) {
      let x, y;
      let attempts = 0;
      let placed = false;

      // Try to find a non-overlapping position
      while (!placed && attempts < maxAttempts) {
        x = (Math.random() - margin) * w * (1 + 2 * margin);
        y = (Math.random() - margin) * h * (1 + 2 * margin);

        if (!checkOverlap(x, y, placementRadius, newDots)) {
          placed = true;
        }
        attempts++;
      }

      // Place dot even if we couldn't find non-overlapping spot
      // (better than missing dots entirely)
      const dot = {
        x: x,
        y: y,
        x0: x,
        y0: y,
        layer: layerIndex,
        color: pickColorWithVariation(layerConfig.colors),
      };
      newDots.push(dot);
    }
  }
  return newDots;
}

/**
 * Draws dots on the canvas at the specified positions.
 * Uses radial gradients for soft Gaussian blobs on layers with softness > 0.
 * @param {Array} dotsArray - Array of dot position objects
 * @param {string} dotColor - Fallback color (used in grid mode)
 */
export function drawScene(dotsArray, dotColor) {
  setCanvasBackground();

  if (SETTINGS.gridMode === "layered") {
    drawLayeredScene(dotsArray);
  } else {
    drawGridScene(dotsArray, dotColor);
  }
}

/**
 * Draws uniform grid dots (simple circles).
 */
function drawGridScene(dotsArray, dotColor) {
  ctx.fillStyle = dotColor;
  dotsArray.forEach(function (dot) {
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, SETTINGS.dotRadius, 0, Math.PI * 2);
    ctx.fill();
  });
}

/**
 * Draws layered dots with per-layer radius, softness, and per-dot colors.
 * Softness > 1 creates even softer gradients by extending the fade zone.
 */
function drawLayeredScene(dotsArray) {
  const layers = SETTINGS.layers;

  for (let layerIndex = 0; layerIndex < layers.length; layerIndex++) {
    const layerConfig = layers[layerIndex];
    const radius = layerConfig.radius;
    const softness = layerConfig.softness || 0;

    dotsArray.forEach(function (dot) {
      if (dot.layer !== layerIndex) return;

      const color = dot.color || SETTINGS.dotColor;

      if (softness > 0) {
        // Soft Gaussian blob using radial gradient
        // softness > 1 extends gradient beyond visible radius for extra softness
        const gradientRadius = radius * Math.max(1, softness);
        const gradient = ctx.createRadialGradient(
          dot.x,
          dot.y,
          0,
          dot.x,
          dot.y,
          gradientRadius,
        );

        // True Gaussian falloff: alpha = e^(-(r/sigma)^2)
        // More stops = smoother gradient
        const stops = 8;
        for (let i = 0; i <= stops; i++) {
          const t = i / stops; // 0 to 1
          // Gaussian: sigma controls spread, here ~0.4 of radius
          const gaussian = Math.exp(-Math.pow(t * 2.5, 2));
          gradient.addColorStop(t, hexToRgba(color, gaussian));
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, gradientRadius, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Hard-edged dot
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
 * @param {string} color - Background color (defaults to SETTINGS value)
 */
export function setCanvasBackground(color) {
  if (color === undefined) {
    color = SETTINGS.canvasBackgroundColor;
  }
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
