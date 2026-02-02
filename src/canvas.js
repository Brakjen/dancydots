import { SETTINGS } from "./settings.js";

let canvas, ctx;
const CANVAS_ID = "dotCanvas";

// Global array to hold dot positions
export let dots = [];

/**
 * Initializes the canvas element and sets up initial drawing.
 */
export function initCanvas() {
  console.log("Initializing canvas...");
  canvas = document.getElementById(CANVAS_ID);
  ctx = canvas.getContext("2d");

  // Set size
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Initial draw
  setCanvasBackground();
  dots = buildDotGrid();
  drawScene(dots, SETTINGS.dotColor);

  // Handle resize
  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const dots = buildDotGrid();
    setCanvasBackground();
    drawScene(dots, SETTINGS.dotColor);
  });
}

/**
 * Builds a grid of dot positions based on the current canvas size and spacing.
 * @returns {Array} Array of dot positions
 */
export function buildDotGrid() {
  const dots = [];
  for (
    let x = SETTINGS.dotSpacing / 2;
    x < canvas.width;
    x += SETTINGS.dotSpacing
  ) {
    for (
      let y = SETTINGS.dotSpacing / 2;
      y < canvas.height;
      y += SETTINGS.dotSpacing
    ) {
      dots.push({
        x: x,
        x0: x,
        vx: 0,
        y: y,
        y0: y,
        vy: 0,
      });
    }
  }
  return dots;
}

/**
 * Draws dots on the canvas at the specified positions.
 * @param {*} dots Array of dot positions
 */
export function drawScene(dots, dotColor) {
  setCanvasBackground(); // Fills canvas (acts as "clear")
  ctx.fillStyle = dotColor;
  dots.forEach((dot) => {
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, SETTINGS.dotRadius, 0, Math.PI * 2);
    ctx.fill();
  });
}

/**
 * Sets the canvas background color.
 * @param {*} color Background color
 */
export function setCanvasBackground(color = SETTINGS.backgroundColor) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
