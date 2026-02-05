/**
 * Animation loop and physics module.
 *
 * Responsibilities:
 * - Run the main animation loop using requestAnimationFrame
 * - Apply vector field forces to dots
 * - Handle dot-to-dot collisions
 * - Update dot positions
 * - Trigger redraws
 *
 * Animation pipeline (each frame):
 * 1. Check if enough time has passed (frame limiting)
 * 2. For each dot:
 *    a. Query vector field at dot's position
 *    b. Apply layer speed multiplier
 *    c. Update velocity
 *    d. Update position (Euler integration)
 * 3. Handle collisions between dots
 * 4. Redraw scene
 *
 * Performance notes:
 * - Uses requestAnimationFrame for smooth 60fps browser sync
 * - Only updates physics at user-specified FPS (default 30)
 * - Collision detection is O(n²) but only in layered mode
 */
import { FIELDS } from "./fields.js";
import { drawScene, dots } from "./canvas.js";
import { CONFIG } from "./config.js";
import { STATE } from "./state.js";

let animationId;
let lastUpdate = 0;

/**
 * Gets the collision radius for a dot based on its layer config.
 * Uses a smaller multiplier (0.6) than placement to allow slight overlap
 * during animation, creating more organic motion.
 * @param {Object} dot - Dot object with layer property
 * @returns {number} Collision radius in pixels
 */
function getCollisionRadius(dot) {
  if (dot.layer === null) return CONFIG.grid.radius;
  const layerConfig = STATE.layers[dot.layer];
  if (!layerConfig) return CONFIG.grid.radius;
  return layerConfig.radius * Math.max(1, layerConfig.softness || 1) * 0.6;
}

/**
 * Simple collision detection and response.
 * Uses elastic collision physics to separate overlapping dots.
 * Algorithm:
 *   1. Check all pairs of dots (O(n²) - only runs in layered mode)
 *   2. If circles overlap, calculate penetration depth
 *   3. Separate dots by moving each away from overlap (positional correction)
 *   4. Apply impulse to velocities (elastic bounce)
 * @param {Array} dotsArray - Array of dots to check for collisions
 */
function handleCollisions(dotsArray) {
  if (CONFIG.mode !== "layered") return;
  if (!CONFIG.collisionsEnabled) return;

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

        // Normal vector (direction from A to B)
        const nx = dx / dist;
        const ny = dy / dist;

        // Positional correction: push dots apart equally
        const pushX = nx * overlap * 0.5;
        const pushY = ny * overlap * 0.5;

        dotA.x -= pushX;
        dotA.y -= pushY;
        dotB.x += pushX;
        dotB.y += pushY;

        // Initialize velocities if not set
        if (!dotA.vx) {
          dotA.vx = 0;
          dotA.vy = 0;
        }
        if (!dotB.vx) {
          dotB.vx = 0;
          dotB.vy = 0;
        }

        // Impulse resolution: elastic collision response
        const relVelX = dotB.vx - dotA.vx;
        const relVelY = dotB.vy - dotA.vy;
        const relVelDotN = relVelX * nx + relVelY * ny;

        // Transfer momentum along collision normal
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
 * Uses requestAnimationFrame for smooth 60fps browser rendering,
 * but only updates physics/positions at user-specified FPS (default 30)
 * to reduce computation cost.
 *
 * Delta-time scaling ensures movement speed is independent of FPS.
 */
export function initAnimation() {
  function animate(timestamp) {
    const fieldFunction = FIELDS[CONFIG.currentField];
    const timeInSeconds = timestamp / 1000;

    // Frame limiting: only update at configured FPS interval
    if (timestamp - lastUpdate >= STATE.animationInterval) {
      // Delta time: seconds since last frame, normalized to 60fps baseline
      // This makes movement speed independent of FPS setting
      const dt = ((timestamp - lastUpdate) / 1000) * 60;

      dots.forEach(function (dot) {
        // Options passed to field function for context
        const options = {
          x0: dot.x0, // home position (for restoration forces)
          y0: dot.y0,
          time: timeInSeconds, // for time-varying fields
        };

        // Field returns velocity vector {dx, dy}
        const field = fieldFunction(dot.x, dot.y, options);

        // Apply layer-specific speed multiplier for depth effect
        // Closer layers (larger dots) move slower = parallax
        let speed = 1.0;
        if (CONFIG.mode === "layered" && dot.layer !== null) {
          // Read from CONFIG for live updates without grid rebuild
          speed = CONFIG.layers[dot.layer]?.speedMultiplier || 1.0;
        }

        // Set velocity and update position (Euler integration)
        // Multiply by dt for frame-rate independent movement
        dot.vx = field.dx * speed;
        dot.vy = field.dy * speed;

        dot.x = dot.x + dot.vx * dt;
        dot.y = dot.y + dot.vy * dt;
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
