// Import necessary modules
import { initCanvas } from "./canvas.js";
import { initAnimation } from "./animation.js";
import { initUI } from "./ui.js";

/**
 * Main function to initialize the application
 * Sets up the canvas, animation, and user interface.
 */
function main() {
  initCanvas();
  initAnimation();
  initUI();
}

document.addEventListener("DOMContentLoaded", main);
