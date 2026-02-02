let canvas, ctx;

const CANVAS_ID = "dotCanvas";
const SETTINGS = {
  spacing: 20,
  dotColor: "gray",
  dotRadius: 1,
  backgroundColor: "black",
};

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

  setCanvasBackground();

  // Initial draw
  const dots = buildDotGrid();
  drawDots(dots, SETTINGS.dotColor);

  // Handle resize
  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const dots = buildDotGrid();
    setCanvasBackground();
    drawDots(dots, SETTINGS.dotColor);
  });
}

/**
 * Builds a grid of dot positions based on the current canvas size and spacing.
 * @returns {Array} Array of dot positions
 */
export function buildDotGrid() {
  const dots = [];
  for (let x = SETTINGS.spacing / 2; x < canvas.width; x += SETTINGS.spacing) {
    for (
      let y = SETTINGS.spacing / 2;
      y < canvas.height;
      y += SETTINGS.spacing
    ) {
      dots.push({ x: x, y: y });
    }
  }
  return dots;
}

/**
 * Draws dots on the canvas at the specified positions.
 * @param {*} dots Array of dot positions
 */
export function drawDots(dots, dotColor) {
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
