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
  currentField: "wave",

  // Field-specific settings (grouped by field)
  fields: {
    shiver: {
      amplitude: 1,  // Adjusted (was 100 * dotSpeed 0.01)
      restoreStrength: 0.5,
    },
    wave: {
      waveNumber: 0.005,
      angularFrequency: 1.0,  // rad/s (with time in seconds)
      amplitude: 1,  // Adjusted (was 100 * dotSpeed 0.01)
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
