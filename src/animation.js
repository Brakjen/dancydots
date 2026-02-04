import { FIELDS } from "./fields.js";
import { drawScene, dots } from "./canvas.js";
import { CONFIG } from "./config.js";
import { STATE } from "./state.js";

let animationId;
let lastUpdate = 0;

/**
 * Gets the collision radius for a dot based on its layer config.
 */
function getCollisionRadius(dot) {
  if (dot.layer === null) return CONFIG.grid.radius;
  const layerConfig = STATE.layers[dot.layer];
  if (!layerConfig) return CONFIG.grid.radius;
  return layerConfig.radius * Math.max(1, layerConfig.softness || 1) * 0.6;
}

/**
 * Simple collision detection and response.
 */
function handleCollisions(dotsArray) {
  if (CONFIG.mode !== "layered") return;

  const len = dotsArray.length;
  for (let i = 0; i < len; i++) {
    const dotA = dotsArray[i];
    const radiusA = getCollisionRadius(dotA);

    for (let j = i + 1; j < len; j++) {
      const dotB = dotsArray[j];
      const radiusB = getCollisionRadius(dotB);

      const dx = dotB.x - dotA.x;
      const dy = dotB.y - dotA.y;
      const distSq = dx * dx + dy * dy;
      const minDist = radiusA + radiusB;

      if (distSq < minDist * minDist && distSq > 0) {
        const dist = Math.sqrt(distSq);
        const overlap = minDist - dist;

        const nx = dx / dist;
        const ny = dy / dist;

        const pushX = nx * overlap * 0.5;
        const pushY = ny * overlap * 0.5;

        dotA.x -= pushX;
        dotA.y -= pushY;
        dotB.x += pushX;
        dotB.y += pushY;

        if (!dotA.vx) { dotA.vx = 0; dotA.vy = 0; }
        if (!dotB.vx) { dotB.vx = 0; dotB.vy = 0; }

        const relVelX = dotB.vx - dotA.vx;
        const relVelY = dotB.vy - dotA.vy;
        const relVelDotN = relVelX * nx + relVelY * ny;

        dotA.vx += relVelDotN * nx;
        dotA.vy += relVelDotN * ny;
        dotB.vx -= relVelDotN * nx;
        dotB.vy -= relVelDotN * ny;
      }
    }
  }
}

/**
 * Initializes and starts the animation loop.
 */
export function initAnimation() {
  function animate(timestamp) {
    const fieldFunction = FIELDS[CONFIG.currentField];
    const timeInSeconds = timestamp / 1000;

    if (timestamp - lastUpdate >= STATE.animationInterval) {
      dots.forEach(function (dot) {
        const options = {
          x0: dot.x0,
          y0: dot.y0,
          time: timeInSeconds,
        };

        const field = fieldFunction(dot.x, dot.y, options);

        let speed = 1.0;
        if (CONFIG.mode === "layered" && dot.layer !== null) {
          // Read from CONFIG for live updates without grid rebuild
          speed = CONFIG.layers[dot.layer]?.speedMultiplier || 1.0;
        }

        dot.vx = field.dx * speed;
        dot.vy = field.dy * speed;

        dot.x = dot.x + dot.vx;
        dot.y = dot.y + dot.vy;
      });

      handleCollisions(dots);
      drawScene(dots);
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
