/**
 * Computed state derived from CONFIG + canvas dimensions.
 * This is what rendering and animation code reads from.
 * Call computeState() after canvas init and on resize.
 */
import { CONFIG } from "./config.js";

export const STATE = {
  // Canvas dimensions (set at runtime)
  canvasWidth: 0,
  canvasHeight: 0,

  // Computed from CONFIG.fps
  animationInterval: 1000 / CONFIG.fps,

  // Computed layers with actual pixel radii
  layers: [],

  // Vortex centers (computed from canvas size)
  vortexCenters: [],
};

/**
 * Recompute all derived state from CONFIG and canvas dimensions.
 * Call this after canvas init, on resize, or when CONFIG changes.
 * @param {number} canvasWidth
 * @param {number} canvasHeight
 */
export function computeState(canvasWidth, canvasHeight) {
  STATE.canvasWidth = canvasWidth;
  STATE.canvasHeight = canvasHeight;
  STATE.animationInterval = 1000 / CONFIG.fps;

  // Compute layer radii from ratios
  STATE.layers = CONFIG.layers.map((layer) => ({
    ...layer,
    radius: canvasHeight * layer.radiusRatio,
  }));

  // Compute vortex centers grid
  const spacing = CONFIG.fields.vortexLattice.spacing;
  STATE.vortexCenters = [];
  if (spacing > 0) {
    for (let x = spacing / 2; x < canvasWidth; x += spacing) {
      for (let y = spacing / 2; y < canvasHeight; y += spacing) {
        STATE.vortexCenters.push({ x: Math.round(x), y: Math.round(y) });
      }
    }
  }
}

/**
 * Get current mode from config.
 */
export function getMode() {
  return CONFIG.mode;
}

/**
 * Get current field name from config.
 */
export function getCurrentField() {
  return CONFIG.currentField;
}

/**
 * Get field-specific settings from config.
 * @param {string} fieldName
 */
export function getFieldConfig(fieldName) {
  return CONFIG.fields[fieldName] || {};
}

/**
 * Get grid settings from config.
 */
export function getGridConfig() {
  return CONFIG.grid;
}

/**
 * Get background color from config.
 */
export function getBackgroundColor() {
  return CONFIG.backgroundColor;
}
