export const SETTINGS = {
  // Canvas settings
  canvasBackgroundColor: "black",
  canvasWidth: 0,
  canvasHeight: 0,

  // Dot settings
  dotSpacing: 25,
  dotColor: "gray",
  dotRadius: 1,

  // Animation settings
  animationFPS: 30,

  // Current active field
  currentField: "cellular",

  // Field-specific settings (grouped by field)
  fields: {
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
};
