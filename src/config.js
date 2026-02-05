/**
 * User-editable configuration.
 * This is what the UI will bind to.
 * All values here are static/ratios — no computed values.
 *
 * Architecture note:
 * - CONFIG holds raw user settings (ratios, colors, speeds)
 * - STATE holds computed values (pixel sizes, animation intervals)
 * - Rendering and animation read from both as needed
 */
export const CONFIG = {
  // Mode: "grid" = uniform spacing, "layered" = random per-layer with depth
  mode: "layered",

  // Current active field
  currentField: "randomWalk",

  // Canvas background color (hex)
  backgroundColor: "#010112",

  // Target frames per second (10-60)
  // Lower = better performance, higher = smoother animation
  fps: 30,

  // Layered mode: dot spacing multiplier for collision (0.3-2.5)
  // Higher = more spread out, lower = allow more overlap
  // Only affects initial placement, not visual appearance
  dotSpacing: 1.0,

  // Enable/disable collision detection (expensive for many particles)
  collisionsEnabled: true,

  // Grid mode settings
  // Creates uniform lattice of dots with regular spacing
  grid: {
    spacing: 25, // pixels between dots
    color: "#393d01", // hex color for all dots
    radius: 2, // dot size in pixels
  },

  // Layered mode settings
  // Creates depth effect with 3 layers of different-sized dots
  // radiusRatio is relative to canvas height (0.5 = 50% of height)
  // Larger dots = background layer (farther away), smaller = foreground
  // drawMode: "solid" (fast), "gaussian" (smooth blur), "bokeh" (lens blur)
  layers: [
    {
      count: 10, // number of dots in this layer
      radiusRatio: 0.45, // dot size as fraction of canvas height
      softness: 0.6, // blur amount (0=sharp, 1=very blurred)
      speedMultiplier: 0.8, // animation speed (creates parallax when varied)
      drawMode: "bokeh", // rendering style
      colors: ["#1c3232", "#291717", "#1a301a"], // randomly chosen per dot
    },
    {
      count: 25,
      radiusRatio: 0.1,
      softness: 1.0,
      speedMultiplier: 1.2,
      drawMode: "bokeh",
      colors: ["#1d1d40", "#492441", "#505323"],
    },
    {
      count: 300,
      radiusRatio: 0.003,
      softness: 0.05,
      speedMultiplier: 2.0,
      drawMode: "solid", // solid is faster for many small dots
      colors: ["#556666", "#665555", "#556655"],
    },
  ],

  // Field-specific settings
  // Each vector field type has its own parameters
  // Fields control how dots move through space
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
