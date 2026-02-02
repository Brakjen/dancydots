export const SETTINGS = {
  // Canvas settings
  canvasBackgroundColor: "black",
  canvasWidth: 0,
  canvasHeight: 0,

  // Dot grid mode: "grid" = uniform spacing, "layered" = random per-layer
  gridMode: "layered",

  // Current active field
  currentField: "randomWalk",

  // Dot settings (used in grid mode)
  dotSpacing: 25,
  dotColor: "gray",
  dotRadius: 1,

  // Depth layers (back to front): large/blurry/slow → small/crisp/fast
  // count: number of dots in this layer (layered mode only)
  // radius: dot size in pixels
  // softness: 0 = hard edge, 1 = fully soft Gaussian
  // colors: array of base colors to randomly pick from (with slight variation)
  layers: [
    {
      count: 15,
      radius: 0,
      softness: 0.6,
      speedMultiplier: 0.5,
      colors: ["#1c3232", "#291717", "#1a301a"], // dark muted teal, crimson, green
    },
    {
      count: 40,
      radius: 0,
      softness: 1,
      speedMultiplier: 1.2,
      colors: ["#1d1d40", "#492441", "#505323"], // slightly brighter muted
    },
    {
      count: 0,
      radius: 3,
      softness: 0.05,
      speedMultiplier: 1.0,
      colors: ["#556666", "#665555", "#556655"], // muted foreground
    },
  ],

  // Animation settings
  animationFPS: 30,

  // Field-specific settings (grouped by field)
  fields: {
    randomWalk: {
      speed: 1, // Base movement speed
      turnSpeed: 0.5, // How fast direction changes (lower = smoother)
      noiseScale: 2, // Spatial scale of direction noise
    },
    shiver: {
      amplitude: 1,
      restoreStrength: 0.5,
    },
    wave: {
      waveNumber: 0.005,
      angularFrequency: 1.0,
      amplitude: 1,
    },
    // New fields defaults
    curlNoise: {
      scale: 0.005,
      amplitude: 15,
      timeSpeed: 0.05,
    },
    multiWave: {
      components: [
        { k: 0.005, omega: 1, amplitude: 0.5, phi: 0 },
        { k: 0.001, omega: 1.2, amplitude: 0.75, phi: Math.PI / 4 },
      ],
    },
    vortexLattice: {
      spacing: 1,
      radius: 750,
      strength: -0.1,
      centers: [
        { x: 100, y: 100 },
        { x: 1400, y: 300 },
        { x: 3000, y: 990 },
      ],
    },
    waveNoise: {
      scale: 0.002,
      timeSpeed: 0.1,
      amplitude: 0.2,
    },
    standingWave: {
      waveNumber: 0.005,
      angularFrequency: 0.1,
      amplitude: 1.0,
    },
    cellular: {
      cellSize: 50,
      strength: 0.1,
    },
  },
};

// Calculate animation interval based on FPS
SETTINGS.animationInterval = 1000 / SETTINGS.animationFPS;

/**
 * Field metadata for UI and documentation.
 * Each field has a display name, description, and default settings.
 */
export const FIELD_INFO = {
  shiver: {
    name: "Shiver",
    description: "Random jitter with restoration force",
  },
  wave: {
    name: "Traveling Wave",
    description: "Horizontal wave motion across the canvas",
  },
  randomWalk: {
    name: "Random Walk",
    description: "Smooth random movement using Perlin noise",
  },
  curlNoise: {
    name: "Curl Noise",
    description: "Fluid-like swirling motion using curl noise",
  },
  multiWave: {
    name: "Multi Wave",
    description: "Combination of multiple traveling waves",
  },
  vortexLattice: {
    name: "Vortex Lattice",
    description: "Array of vortices creating circular flows",
  },
  waveNoise: {
    name: "Wave + Noise",
    description: "Traveling wave with added noise perturbations",
  },
  standingWave: {
    name: "Standing Wave",
    description: "Stationary wave oscillating in place",
  },
  cellular: {
    name: "Cellular Flow",
    description: "Flow based on cellular patterns",
  },
};
