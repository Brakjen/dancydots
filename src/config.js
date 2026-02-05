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
  backgroundColor: "#020222",

  // Target frames per second (10-60)
  // Lower = better performance, higher = smoother animation
  fps: 30,

  // Layered mode: dot spacing multiplier for collision (0.3-2.5)
  // Higher = more spread out, lower = allow more overlap
  // Only affects initial placement, not visual appearance
  dotSpacing: 1.0,

  // Enable/disable collision detection (expensive for many particles)
  collisionsEnabled: false,

  // Global movement speed multiplier (affects all fields)
  // 1.0 = normal, 0.5 = half speed, 2.0 = double speed
  globalSpeed: 1.0,

  // Grid mode settings
  // Creates uniform lattice of dots with regular spacing
  grid: {
    spacing: 25, // pixels between dots
    color: "#626900", // hex color for all dots
    radius: 2, // dot size in pixels
  },

  // Layered mode settings
  // Creates depth effect with 3 layers of different-sized dots
  // radiusRatio is relative to canvas height (0.5 = 50% of height)
  // Larger dots = background layer (farther away), smaller = foreground
  // drawMode: "solid" (fast), "gaussian" (smooth blur), "bokeh" (lens blur)
  layers: [
    {
      count: 2, // number of dots in this layer
      radiusRatio: 0.3, // dot size as fraction of canvas height
      softness: 0.1, // blur amount (0=sharp, 1=very blurred)
      speedMultiplier: 0.4, // animation speed (creates parallax when varied)
      drawMode: "bokeh", // rendering style
      colors: ["#2b1616", "#2e2a2a", "#000000"], // randomly chosen per dot
    },
    {
      count: 3,
      radiusRatio: 0.1,
      softness: 0.2,
      speedMultiplier: 2,
      drawMode: "bokeh",
      colors: ["#2f523c", "#492441", "#475230"],
    },
    {
      count: 9800,
      radiusRatio: 0.001,
      softness: 0.0,
      speedMultiplier: 0.3,
      drawMode: "solid", // solid is faster for many small dots
      colors: ["#92b9b9", "#ceabab", "#bdd7bd"],
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
      amplitude: 0.5,
    },
    curlNoise: {
      scale: 0.005,
      amplitude: 10,
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
      amplitude: 0.2,
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
