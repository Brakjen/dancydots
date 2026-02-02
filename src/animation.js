import { shiverField } from "./fields.js";
import { drawScene, dots } from "./canvas.js";
import { SETTINGS } from "./settings.js";

let animationId;
let lastUpdate = 0;

/**
 * Initializes and starts the animation loop.
 */
export function initAnimation() {
  function animate(timestamp) {
    if (timestamp - lastUpdate >= SETTINGS.animationInterval) {
      dots.forEach((dot) => {
        const field = shiverField(dot.x, dot.y, dot.x0, dot.y0);
        dot.vx += field.dx;
        dot.vy += field.dy;
        dot.x += field.dx * SETTINGS.dotSpeed;
        dot.y += field.dy * SETTINGS.dotSpeed;
      });

      drawScene(dots, SETTINGS.dotColor);
      lastUpdate = timestamp;
    }
    animationId = requestAnimationFrame(animate);
  }
  animate();
}

export function stopAnimation() {
  cancelAnimationFrame(animationId);
}
