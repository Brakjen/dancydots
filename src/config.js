/**
 * User-editable configuration.
 * This is what the UI will bind to.
 * All values here are static/ratios — no computed values.
 */
export const CONFIG = {
  // Mode: "grid" = uniform spacing, "layered" = random per-layer with depth
  mode: "layered",

  // Current active field
  currentField: "randomWalk",

  // Canvas
  backgroundColor: "#010112",
  fps: 30,

  // Grid mode settings
  grid: {
    spacing: 25,
    color: "#393d01",
    radius: 2,
  },

  // Layered mode settings
  // radiusRatio is relative to canvas height (0.5 = 50% of height)
  layers: [
    {
      count: 15,
      radiusRatio: 0.5,
      softness: 0.6,
      speedMultiplier: 0.8,
      colors: ["#1c3232", "#291717", "#1a301a"],
    },
    {
      count: 50,
      radiusRatio: 0.1,
      softness: 1.0,
      speedMultiplier: 1.2,
      colors: ["#1d1d40", "#492441", "#505323"],
    },
    {
      count: 75,
      radiusRatio: 0.003,
      softness: 0.05,
      speedMultiplier: 2.0,
      colors: ["#556666", "#665555", "#556655"],
    },
  ],

  // Field-specific settings
  fields: {
    randomWalk: {
      speed: 1,
      turnSpeed: 0.5,
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
    curlNoise: {
      scale: 0.005,
      amplitude: 15,
      timeSpeed: 0.05,
    },
    multiWave: {
      components: [
        { k: 0.01, omega: 1, amplitude: 0.2, phi: 0, angle: 0 },
        {
          k: 0.008,
          omega: 1.5,
          amplitude: 0.5,
          phi: Math.PI / 4,
          angle: Math.PI / 3,
        },
      ],
    },
    vortexLattice: {
      spacing: 300,
      radius: 750,
      strength: -0.1,
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

/**
 * Field metadata for UI labels and descriptions.
 */
export const FIELD_INFO = {
  randomWalk: {
    name: "Random Walk",
    description: "Independent wandering motion per dot",
  },
  shiver: {
    name: "Shiver",
    description: "Random jitter with restoration force",
  },
  wave: {
    name: "Traveling Wave",
    description: "Horizontal wave motion",
  },
  curlNoise: {
    name: "Curl Noise",
    description: "Fluid-like swirling motion",
  },
  multiWave: {
    name: "Multi-Wave",
    description: "Superposition of multiple waves",
  },
  vortexLattice: {
    name: "Vortex Lattice",
    description: "Multiple rotating vortex centers",
  },
  waveNoise: {
    name: "Wave + Noise",
    description: "Wave motion with noise variation",
  },
  standingWave: {
    name: "Standing Wave",
    description: "Oscillating wave pattern",
  },
  cellular: {
    name: "Cellular Flow",
    description: "Cell-based rotating regions",
  },
};
