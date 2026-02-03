// Import necessary modules
import { initCanvas } from "./canvas.js";
import { initAnimation } from "./animation.js";
import { initUI } from "./ui.js";
import { CONFIG } from "./config.js";
import { FIELDS } from "./fields.js";

/**
 * Parses URL parameters and applies them to CONFIG.
 */
function applyUrlParams() {
  const params = new URLSearchParams(window.location.search);

  // Mode: grid or layered
  const mode = params.get("mode");
  if (mode && (mode === "grid" || mode === "layered")) {
    CONFIG.mode = mode;
  }

  // Field type
  const field = params.get("field");
  if (field && FIELDS[field]) {
    CONFIG.currentField = field;
  }

  // Embedded / iframe mode: hide UI and expose only canvas
  const embed =
    params.get("embed") || params.get("embedded") || params.get("noUI");
  if (embed === "1" || embed === "true") {
    CONFIG._embedded = true;
  } else {
    CONFIG._embedded = false;
  }
}

/**
 * Main function to initialize the application
 * Sets up the canvas, animation, and user interface.
 */
function main() {
  applyUrlParams();
  initCanvas();
  initAnimation();
  // If embedded mode requested, skip building the UI and hide sidebar
  if (!CONFIG._embedded) {
    initUI();
  } else {
    const sb = document.getElementById("sidebar");
    if (sb) sb.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", main);
