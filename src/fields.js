import { SETTINGS } from "./canvas.js";

/**
 * Shiver field function that perturbs dot positions randomly.
 *
 * Uses a restorative force to pull dots back to their original positions.
 * @param {*} x
 * @param {*} y
 * @param {*} x0
 * @param {*} y0
 * @returns {{dx: number, dy: number}} Displacement vector
 */
export function shiverField(x, y, x0, y0) {
  const dist = Math.sqrt((x - x0) ** 2 + (y - y0) ** 2); // Distance from center
  const maxDist = 50;
  const penalty = Math.max(0, (dist - maxDist) / maxDist); // 0 to 1

  const baseDx =
    (Math.random() - 0.5) * SETTINGS.animationAmplitude * (1 - penalty);
  const baseDy =
    (Math.random() - 0.5) * SETTINGS.animationAmplitude * (1 - penalty);

  return {
    dx: (x0 - x) * SETTINGS.shiverFieldRestoreStrength + baseDx,
    dy: (y0 - y) * SETTINGS.shiverFieldRestoreStrength + baseDy,
  };
}
