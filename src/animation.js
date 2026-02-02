import { FIELDS } from "./fields.js";
import { drawScene, dots } from "./canvas.js";
import { SETTINGS } from "./settings.js";

let animationId; // Used in canceling animation
let lastUpdate = 0; // Used in throttling animation updates

/**
 * Initializes and starts the animation loop.
 */
export function initAnimation() {
  function animate(timestamp) {
    const fieldFunction = FIELDS[SETTINGS.currentField];
    const timeInSeconds = timestamp / 1000; // Convert ms to seconds

    // Throttle updates based on desired FPS
    // Helps control performance
    if (timestamp - lastUpdate >= SETTINGS.animationInterval) {
      dots.forEach(function (dot) {
        // Build options object for field function
        const options = {
          x0: dot.x0,
          y0: dot.y0,
          time: timeInSeconds,
        };

        // Calculate field displacement
        const field = fieldFunction(dot.x, dot.y, options);

        // Update dot position
        dot.x = dot.x + field.dx;
        dot.y = dot.y + field.dy;
      });

      drawScene(dots, SETTINGS.dotColor);
      lastUpdate = timestamp;
    }

    animationId = requestAnimationFrame(animate);
  }

  animate();
}

/**
 * Stops the animation loop.
 */
export function stopAnimation() {
  cancelAnimationFrame(animationId);
}
