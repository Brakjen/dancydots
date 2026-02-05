/**
 * Computed state derived from CONFIG + canvas dimensions.
 *
 * Architecture: CONFIG vs STATE
 * ==============================
 * CONFIG: Raw user settings (ratios, colors, speeds)
 *   - Independent of canvas size
 *   - UI directly modifies these values
 *   - Serializable to URL params
 *
 * STATE: Computed runtime values (pixel sizes, intervals)
 *   - Derived from CONFIG + canvas dimensions
 *   - Updated when CONFIG changes or window resizes
 *   - Used by rendering and animation
 *
 * Why separate?
 *   - Responsive: same config works at any screen size
 *   - Performance: avoid recalculating pixels every frame
 *   - Clarity: distinguish settings from computed values
 *
 * Call computeState() after:
 *   - Canvas initialization
 *   - Window resize
 *   - Config changes that affect layout (mode, layer count, etc.)
 */
import { CONFIG } from "./config.js";

export const STATE = {
  // Canvas dimensions (set at runtime)
  canvasWidth: 0,
  canvasHeight: 0,

  // Computed from CONFIG.fps (milliseconds per frame)
  animationInterval: 1000 / CONFIG.fps,

  // Computed layers with actual pixel radii
  // CONFIG stores radiusRatio (0-1), STATE stores radius (pixels)
  layers: [],

  // Vortex centers grid (computed from canvas size for vortexLattice field)
  vortexCenters: [],
};

/**
 * Recompute all derived state from CONFIG and canvas dimensions.
 *
 * This function:
 * 1. Updates canvas dimensions
 * 2. Converts ratio-based sizes to pixel values
 * 3. Recomputes field-specific data structures
 *
 * @param {number} canvasWidth - Canvas width in pixels
 * @param {number} canvasHeight - Canvas height in pixels
 */
export function computeState(canvasWidth, canvasHeight) {
  STATE.canvasWidth = canvasWidth;
  STATE.canvasHeight = canvasHeight;
  STATE.animationInterval = 1000 / CONFIG.fps;

  // Compute layer radii from ratios
  // radiusRatio of 0.5 = 50% of canvas height
  STATE.layers = CONFIG.layers.map((layer) => ({
    ...layer,
    radius: canvasHeight * layer.radiusRatio,
  }));

  // Compute vortex centers grid for vortexLattice field
  // Creates regular grid of vortex points
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
