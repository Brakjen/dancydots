/**
 * Vector field implementations.
 *
 * Each field function takes (x, y, options) and returns {dx, dy}
 * representing the velocity vector at that point.
 *
 * options typically contains:
 *   - x0, y0: dot's home position (for restoration forces)
 *   - time: seconds since page load (for time-varying fields)
 */
import { CONFIG } from "./config.js";
import { STATE } from "./state.js";

/**
 * Shiver field - random jitter with restoration force.
 * Creates a "breathing" or "shimmering" effect where dots
 * vibrate around their home position.
 *
 * - Random displacement creates jitter
 * - Restoration force pulls dots back toward (x0, y0)
 * - Penalty reduces jitter when far from home
 *
 * @param {number} x - Current x position
 * @param {number} y - Current y position
 * @param {Object} options - Field options {x0, y0, time}
 * @returns {Object} Velocity vector {dx, dy}
 */
export function shiverField(x, y, options) {
  const x0 = options.x0;
  const y0 = options.y0;
  const cfg = CONFIG.fields.shiver;
  const amplitude = cfg.amplitude;
  const restoreStrength = cfg.restoreStrength;

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

  return {
    dx: restoreX + baseDx,
    dy: restoreY + baseDy,
  };
}

/**
 * Traveling wave field.
 * Creates a horizontal traveling wave (like ocean waves).
 * Dots move in sinusoidal pattern that propagates left-to-right.
 *
 * Wave equation: displacement = amplitude * sin(k*x - omega*t)
 * - k (waveNumber): spatial frequency (smaller = longer wavelength)
 * - omega (angularFrequency): temporal frequency (smaller = slower)
 *
 * @param {number} x - Current x position
 * @param {number} y - Current y position
 * @param {Object} options - Field options {time}
 * @returns {Object} Velocity vector {dx, dy}
 */
export function waveField(x, y, options) {
  const time = options.time;
  const cfg = CONFIG.fields.wave;
  const k = cfg.waveNumber;
  const omega = cfg.angularFrequency;
  const amplitude = cfg.amplitude;

  const phase = k * x - omega * time;
  const dx = amplitude * Math.sin(phase);

  return { dx: dx, dy: 0 };
}

/* ------------------------------------------------------------------ */
/* Value-noise implementation (3D)                                    */
/* Used for organic, smoothly-varying fields like curl noise         */
/* ------------------------------------------------------------------ */

/**
 * Fade function for smooth interpolation (smoothstep).
 * Returns 0 at t=0, 1 at t=1, with smooth S-curve in between.
 */
function fade(t) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/**
 * Hash function for pseudo-random values.
 * Given integer coordinates, returns deterministic random number.
 */
function hash3(i, j, k) {
  let n = i + j * 57 + k * 131;
  n = (n << 13) ^ n;
  const nn = (n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff;
  return nn;
}

/**
 * 3D value noise function.
 * Returns smoothly-varying random values in [0,1] based on (x, y, t).
 * Uses trilinear interpolation between corner values.
 *
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} t - Time coordinate (for animation)
 * @returns {number} Noise value in range [0, 1]
 */
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

/* ------------------------------------------------------------------ */
/* Field implementations                                              */
/* ------------------------------------------------------------------ */

/**
 * Curl noise field - creates organic, turbulent flow.
 *
 * Uses the curl (rotation) of a noise field to create divergence-free flow.
 * This ensures dots don't bunch up or spread apart unnaturally.
 *
 * Mathematical background:
 *   Given scalar field f(x,y,t):
 *   curl = (∂f/∂y, -∂f/∂x)
 *
 * Result: smooth, swirling patterns like smoke or fluid.
 *
 * @param {number} x - Current x position
 * @param {number} y - Current y position
 * @param {Object} options - Field options {time}
 * @returns {Object} Velocity vector {dx, dy}
 */
export function curlNoiseField(x, y, options) {
  const time = (options && options.time) || 0;
  const cfg = CONFIG.fields.curlNoise;
  const s = cfg.scale;
  const amp = cfg.amplitude;
  const tSpeed = cfg.timeSpeed;
  const eps = 0.001;

  const nx1 = noise3((x + eps) * s, y * s, time * tSpeed);
  const nx2 = noise3((x - eps) * s, y * s, time * tSpeed);
  const ny1 = noise3(x * s, (y + eps) * s, time * tSpeed);
  const ny2 = noise3(x * s, (y - eps) * s, time * tSpeed);

  const dndx = (nx1 - nx2) / (2 * eps);
  const dndy = (ny1 - ny2) / (2 * eps);

  return { dx: amp * dndy, dy: -amp * dndx };
}

export function multiWaveField(x, y, options) {
  const time = (options && options.time) || 0;
  const comps = CONFIG.fields.multiWave.components;
  let dx = 0;
  let dy = 0;
  const n = comps.length || 1;

  for (let i = 0; i < comps.length; i++) {
    const c = comps[i];
    const k = c.k;
    const angle = c.angle !== undefined ? c.angle : (i * Math.PI * 2) / n;
    const phase =
      k * (x * Math.cos(angle) + y * Math.sin(angle)) -
      c.omega * time +
      (c.phi || 0);
    const amp = c.amplitude || 1;
    // Move perpendicular to wave direction
    dx += amp * Math.sin(phase) * -Math.sin(angle);
    dy += amp * Math.sin(phase) * Math.cos(angle);
  }
  return { dx, dy };
}

export function vortexLatticeField(x, y, options) {
  const centers = STATE.vortexCenters;
  const cfg = CONFIG.fields.vortexLattice;
  const R = cfg.radius;
  const S = cfg.strength;
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
}

export function waveNoiseField(x, y, options) {
  const time = (options && options.time) || 0;
  const waveCfg = CONFIG.fields.wave;
  const noiseCfg = CONFIG.fields.waveNoise;
  const wave_dx =
    waveCfg.amplitude *
    Math.sin(waveCfg.waveNumber * x - waveCfg.angularFrequency * time);
  const noise_val = noise3(
    x * noiseCfg.scale,
    y * noiseCfg.scale,
    time * noiseCfg.timeSpeed,
  );
  const dx = wave_dx + noiseCfg.amplitude * (noise_val - 0.5);
  return { dx, dy: 0 };
}

export function standingWaveField(x, y, options) {
  const time = (options && options.time) || 0;
  const cfg = CONFIG.fields.standingWave;
  const dx =
    cfg.amplitude *
    Math.sin(cfg.waveNumber * x) *
    Math.cos(cfg.angularFrequency * time);
  return { dx, dy: 0 };
}

export function cellularFlowField(x, y, options) {
  const cfg = CONFIG.fields.cellular;
  const cs = cfg.cellSize;
  const strength = cfg.strength;
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
}

/**
 * Seeded random for deterministic values.
 */
function seededRandom(seed) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Random Walk field - each dot wanders independently.
 */
export function randomWalkField(x, y, options) {
  const time = (options && options.time) || 0;
  const x0 = (options && options.x0) || 0;
  const y0 = (options && options.y0) || 0;
  const cfg = CONFIG.fields.randomWalk;
  const speed = cfg.speed !== undefined ? cfg.speed : 0.5;
  const turnSpeed = cfg.turnSpeed !== undefined ? cfg.turnSpeed : 0.3;

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
}

/**
 * Registry of all available field functions.
 */
export const FIELDS = {
  randomWalk: randomWalkField,
  shiver: shiverField,
  wave: waveField,
  curlNoise: curlNoiseField,
  multiWave: multiWaveField,
  vortexLattice: vortexLatticeField,
  waveNoise: waveNoiseField,
  standingWave: standingWaveField,
  cellular: cellularFlowField,
};
