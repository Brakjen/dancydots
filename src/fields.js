import { SETTINGS } from "./settings.js";

/**
 * Shiver field function that perturbs dot positions randomly.
 *
 * Uses a restorative force to pull dots back to their original positions.
 * @param {number} x - Current x position of the dot.
 * @param {number} y - Current y position of the dot.
 * @param {Object} options - Options object containing field parameters.
 * @param {number} options.x0 - Original x position of the dot.
 * @param {number} options.y0 - Original y position of the dot.
 * @returns {{dx: number, dy: number}} Displacement vector
 */
export function shiverField(x, y, options) {
  const x0 = options.x0;
  const y0 = options.y0;
  const fieldSettings = SETTINGS.fields.shiver;
  const amplitude = fieldSettings.amplitude;
  const restoreStrength = fieldSettings.restoreStrength;

  // Calculate distance from original position
  // Used to scale down random motion when far away
  // Maximum distance limits dot wandering to a max of about 50 pixels
  const distanceX = x - x0;
  const distanceY = y - y0;
  const dist = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
  const maxDist = 50;
  const penalty = Math.max(0, (dist - maxDist) / maxDist); // 0 to 1

  // Random jitter scaled by amplitude and penalty
  const randomX = Math.random() - 0.5;
  const randomY = Math.random() - 0.5;
  const baseDx = randomX * amplitude * (1 - penalty);
  const baseDy = randomY * amplitude * (1 - penalty);

  // Restoration force towards original position
  const restoreX = (x0 - x) * restoreStrength;
  const restoreY = (y0 - y) * restoreStrength;

  return {
    dx: restoreX + baseDx,
    dy: restoreY + baseDy,
  };
}

/**
 * Traveling wave field: creates horizontal wave motion.
 * @param {number} x - Dot x position.
 * @param {number} y - Dot y position.
 * @param {Object} options - Options object containing field parameters.
 * @param {number} options.time - Current time in seconds for animation.
 * @returns {{dx: number, dy: number}} Displacement vector.
 */
export function waveField(x, y, options) {
  const time = options.time;
  const fieldSettings = SETTINGS.fields.wave;
  const k = fieldSettings.waveNumber;
  const omega = fieldSettings.angularFrequency;
  const amplitude = fieldSettings.amplitude;

  // Using a simple traveling wave formula: dx = A * sin(kx - ωt)
  const phase = k * x - omega * time;
  const dx = amplitude * Math.sin(phase);

  return {
    dx: dx,
    dy: 0,
  };
}

/**
 * Registry of all available field functions.
 * Add new fields here to make them available in the application.
 */
export const FIELDS = {
  shiver: shiverField,
  wave: waveField,
};
