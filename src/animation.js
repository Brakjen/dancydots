import { FIELDS } from "./fields.js";
import { drawScene, dots } from "./canvas.js";
import { SETTINGS } from "./settings.js";

let animationId; // Used in canceling animation
let lastUpdate = 0; // Used in throttling animation updates

/**
 * Gets the collision radius for a dot based on its layer config.
 * Scales with softness since visual size extends beyond base radius.
 */
function getCollisionRadius(dot) {
  if (dot.layer === null) return SETTINGS.dotRadius;
  const layerConfig = SETTINGS.layers[dot.layer];
  if (!layerConfig) return SETTINGS.dotRadius;
  // Collision radius is base radius scaled by softness (but at least 1x)
  // Use a fraction (e.g., 0.5) so they don't bounce too early
  return layerConfig.radius * Math.max(1, layerConfig.softness || 1) * 0.6;
}

/**
 * Simple collision detection and response.
 * Checks all dot pairs and pushes apart if overlapping.
 * Only runs in layered mode for performance.
 */
function handleCollisions(dotsArray) {
  if (SETTINGS.gridMode !== "layered") return;

  const len = dotsArray.length;
  for (let i = 0; i < len; i++) {
    const dotA = dotsArray[i];
    const radiusA = getCollisionRadius(dotA);

    for (let j = i + 1; j < len; j++) {
      const dotB = dotsArray[j];
      const radiusB = getCollisionRadius(dotB);

      // Distance between centers
      const dx = dotB.x - dotA.x;
      const dy = dotB.y - dotA.y;
      const distSq = dx * dx + dy * dy;
      const minDist = radiusA + radiusB;

      // Check if overlapping
      if (distSq < minDist * minDist && distSq > 0) {
        const dist = Math.sqrt(distSq);
        const overlap = minDist - dist;

        // Normalize collision vector
        const nx = dx / dist;
        const ny = dy / dist;

        // Push dots apart (each moves half the overlap)
        const pushX = nx * overlap * 0.5;
        const pushY = ny * overlap * 0.5;

        dotA.x -= pushX;
        dotA.y -= pushY;
        dotB.x += pushX;
        dotB.y += pushY;

        // Store velocity inversion hint for next frame
        // Invert velocity component along collision normal
        if (!dotA.vx) { dotA.vx = 0; dotA.vy = 0; }
        if (!dotB.vx) { dotB.vx = 0; dotB.vy = 0; }
        
        // Swap velocity components along normal (simple elastic)
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

        // Apply layer speed multiplier only in layered mode
        let speed = 1.0;
        if (SETTINGS.gridMode === "layered" && dot.layer !== null) {
          const layerConfig = SETTINGS.layers[dot.layer];
          speed = layerConfig ? layerConfig.speedMultiplier : 1.0;
        }

        // Store velocity for collision response
        dot.vx = field.dx * speed;
        dot.vy = field.dy * speed;

        // Update dot position
        dot.x = dot.x + dot.vx;
        dot.y = dot.y + dot.vy;
      });

      // Handle collisions after movement
      handleCollisions(dots);

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
