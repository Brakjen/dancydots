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

/* ------------------------------------------------------------------ */
/* Simple value-noise implementation (3D: x, y, t) - used internally */
/* ------------------------------------------------------------------ */
function fade(t) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function hash3(i, j, k) {
  // integer hash -> deterministic pseudorandom [0,1)
  let n = i + j * 57 + k * 131;
  n = (n << 13) ^ n;
  const nn = (n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff;
  return nn; // integer in [0, 0x7fffffff]
}

function noise3(x, y, t) {
  // value noise via trilinear interpolation
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
    // hash to [0,1)
    return hash3(ix, iy, it) / 1073741824.0;
  }

  // fetch corners
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

  // trilinear interpolation
  const x00 = lerp(c000, c100, u);
  const x10 = lerp(c010, c110, u);
  const x01 = lerp(c001, c101, u);
  const x11 = lerp(c011, c111, u);

  const y0 = lerp(x00, x10, v);
  const y1 = lerp(x01, x11, v);

  const value = lerp(y0, y1, w);
  return value; // in [0,1)
}

/* ------------------------------------------------------------------ */
/* New fields implementations
/* ------------------------------------------------------------------ */

export function curlNoiseField(x, y, options) {
  const time = (options && options.time) || 0;
  const s = SETTINGS.fields.curlNoise.scale;
  const amp = SETTINGS.fields.curlNoise.amplitude;
  const tSpeed = SETTINGS.fields.curlNoise.timeSpeed;
  const eps = 0.001; // small step in noise-space

  const nx1 = noise3((x + eps) * s, y * s, time * tSpeed);
  const nx2 = noise3((x - eps) * s, y * s, time * tSpeed);
  const ny1 = noise3(x * s, (y + eps) * s, time * tSpeed);
  const ny2 = noise3(x * s, (y - eps) * s, time * tSpeed);

  const dndx = (nx1 - nx2) / (2 * eps);
  const dndy = (ny1 - ny2) / (2 * eps);

  const dx = amp * dndy;
  const dy = -amp * dndx;
  return { dx, dy };
}

export function multiWaveField(x, y, options) {
  const time = (options && options.time) || 0;
  const comps = SETTINGS.fields.multiWave.components;
  let dx = 0;
  for (let i = 0; i < comps.length; i++) {
    const c = comps[i];
    dx += c.amplitude * Math.sin(c.k * x - c.omega * time + c.phi);
  }
  return { dx: dx, dy: 0 };
}

export function vortexLatticeField(x, y, options) {
  const list = SETTINGS.fields.vortexLattice.centers;
  const R = SETTINGS.fields.vortexLattice.radius;
  const S = SETTINGS.fields.vortexLattice.strength;
  let dx = 0,
    dy = 0;
  for (let i = 0; i < list.length; i++) {
    const cx = list[i].x;
    const cy = list[i].y;
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
  const w = SETTINGS.fields.wave;
  const noiseSettings = SETTINGS.fields.waveNoise;
  const wave_dx =
    w.amplitude * Math.sin(w.waveNumber * x - w.angularFrequency * time);
  const noise_val = noise3(
    x * noiseSettings.scale,
    y * noiseSettings.scale,
    time * noiseSettings.timeSpeed,
  );
  const dx = wave_dx + noiseSettings.amplitude * (noise_val - 0.5);
  return { dx, dy: 0 };
}

export function standingWaveField(x, y, options) {
  const time = (options && options.time) || 0;
  const s = SETTINGS.fields.standingWave;
  const dx =
    s.amplitude *
    Math.sin(s.waveNumber * x) *
    Math.cos(s.angularFrequency * time);
  return { dx, dy: 0 };
}

export function cellularFlowField(x, y, options) {
  const cs = SETTINGS.fields.cellular.cellSize;
  const strength = SETTINGS.fields.cellular.strength;
  const cx = Math.floor(x / cs) * cs + cs / 2;
  const cy = Math.floor(y / cs) * cs + cs / 2;
  const centers = [
    [cx, cy],
    [cx + cs, cy],
    [cx, cy + cs],
    [cx + cs, cy + cs],
  ];
  let dx = 0,
    dy = 0;
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
 * Registry of all available field functions.
 * Add new fields here to make them available in the application.
 */
export const FIELDS = {
  shiver: shiverField,
  wave: waveField,
  curlNoise: curlNoiseField,
  multiWave: multiWaveField,
  vortexLattice: vortexLatticeField,
  waveNoise: waveNoiseField,
  standingWave: standingWaveField,
  cellular: cellularFlowField,
};
