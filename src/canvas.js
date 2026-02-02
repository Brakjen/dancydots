import { SETTINGS } from "./settings.js";

let canvas;
let ctx;
const CANVAS_ID = "dotCanvas";

// Global array to hold dot positions
export let dots = [];

/**
 * Initializes the canvas element and sets up initial drawing.
 */
export function initCanvas() {
  canvas = document.getElementById(CANVAS_ID);
  ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;

  // Set size
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  SETTINGS.canvasWidth = canvas.width;
  SETTINGS.canvasHeight = canvas.height;

  // Initial draw
  setCanvasBackground();
  dots = buildDotGrid();
  drawScene(dots, SETTINGS.dotColor);

  // Handle resize
  window.addEventListener("resize", function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    SETTINGS.canvasWidth = canvas.width;
    SETTINGS.canvasHeight = canvas.height;
    dots = buildDotGrid(); // Update global dots array
    setCanvasBackground();
    drawScene(dots, SETTINGS.dotColor);
  });
}

/**
 * Builds a grid of dot positions based on the current canvas size and spacing.
 * @returns {Array} Array of dot position objects
 */
export function buildDotGrid() {
  const newDots = [];
  const spacing = SETTINGS.dotSpacing;
  const startOffset = spacing / 2;

  for (let x = startOffset; x < canvas.width; x = x + spacing) {
    for (let y = startOffset; y < canvas.height; y = y + spacing) {
      const dot = {
        x: x,
        y: y,
        x0: x, // Original x position (for restoration)
        y0: y, // Original y position (for restoration)
      };
      newDots.push(dot);
    }
  }

  return newDots;
}

/**
 * Draws dots on the canvas at the specified positions.
 * @param {Array} dotsArray - Array of dot position objects
 * @param {string} dotColor - Color to fill the dots
 */
export function drawScene(dotsArray, dotColor) {
  setCanvasBackground();
  ctx.fillStyle = dotColor;

  dotsArray.forEach(function (dot) {
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, SETTINGS.dotRadius, 0, Math.PI * 2);
    ctx.fill();
  });
}

/**
 * Sets the canvas background color.
 * @param {string} color - Background color (defaults to SETTINGS value)
 */
export function setCanvasBackground(color) {
  if (color === undefined) {
    color = SETTINGS.canvasBackgroundColor;
  }
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
