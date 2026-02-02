export const SETTINGS = {
  backgroundColor: "black",

  dotSpacing: 10,
  dotColor: "gray",
  dotRadius: 1,
  dotSpeed: 0.1,

  animationAmplitude: 10,
  animationFPS: 30,

  shiverFieldRestoreStrength: 0.5,
};

// Calculate animation interval based on FPS
SETTINGS.animationInterval = 1000 / SETTINGS.animationFPS;
