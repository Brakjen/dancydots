/**
 * UI module - handles all sidebar controls and user interaction.
 *
 * Key optimization:
 * - Visual-only changes (colors, softness) call drawScene() for instant feedback
 * - Structural changes (count, size, spacing) call refresh() to rebuild grid
 * - Animation parameters (speed, FPS) update config only, no redraw needed
 */
import { CONFIG, FIELD_INFO } from "./config.js";
import {
  refresh,
  drawScene,
  dots,
  addDotsToLayer,
  removeDotsFromLayer,
} from "./canvas.js";
import { downloadExport } from "./export.js";
import { STATE } from "./state.js";

/**
 * Initializes all UI controls and binds them to CONFIG.
 */
export function initUI() {
  // Initialize all sections
  initRefreshButton();
  initExportButton();
  initSidebarResize();
  initFullscreenChangeListener();
  initCollapsibleSections();
  initGlobalControls();
  initFieldDropdown();
  initGridControls();
  initLayerControls();
  initFieldControls();
  initKeyboardShortcuts();

  // Update visibility based on current mode
  updateModeVisibility();
}

// ============================================
// Keyboard Shortcuts
// ============================================

/**
 * Initializes global keyboard shortcuts.
 * - f: Toggle fullscreen
 * - r: Refresh/reset grid
 * - e: Export and download
 */
function initKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
    // Ignore if user is typing in an input field
    if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") return;

    switch (e.key.toLowerCase()) {
      case "f":
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          document.documentElement.requestFullscreen();
        }
        break;
      case "r":
        refresh();
        break;
      case "e":
        downloadExport();
        break;
    }
  });
}

// ============================================
// Sidebar Resize
// ============================================

/**
 * Initializes drag-to-resize functionality for the sidebar.
 * Users can drag the right edge to make the sidebar wider or narrower.
 */
function initSidebarResize() {
  const sidebar = document.getElementById("sidebar");
  const handle = document.getElementById("sidebarResizeHandle");

  let isDragging = false;

  handle.addEventListener("mousedown", (e) => {
    isDragging = true;
    handle.classList.add("dragging");
    document.body.classList.add("resizing");
    e.preventDefault();
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    // e.clientX is the mouse position from left edge of viewport
    // That's exactly the width we want for the sidebar
    const newWidth = e.clientX;
    sidebar.style.width = newWidth + "px";
  });

  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      handle.classList.remove("dragging");
      document.body.classList.remove("resizing");
    }
  });
}

// ============================================
// Refresh Button
// ============================================

function initRefreshButton() {
  const btn = document.getElementById("refreshBtn");
  btn.addEventListener("click", () => {
    refresh();
  });
}

// ============================================
// Export Button
// ============================================

function initExportButton() {
  const btn = document.getElementById("exportBtn");
  btn.addEventListener("click", () => {
    downloadExport();
  });
}

// ============================================
// Fullscreen Change Listener
// ============================================

/**
 * Syncs CSS class with fullscreen state.
 * Triggered by keyboard shortcut (F key).
 */
function initFullscreenChangeListener() {
  document.addEventListener("fullscreenchange", () => {
    if (document.fullscreenElement) {
      document.body.classList.add("fullscreen");
    } else {
      document.body.classList.remove("fullscreen");
    }
  });
}

/**
 * Determines if current field needs grid refresh on parameter change.
 * RandomWalk updates live without refresh; others need grid rebuild.
 */
function needsRefresh() {
  return CONFIG.currentField !== "randomWalk";
}

/**
 * Optionally refresh based on current field.
 */
function maybeRefresh() {
  if (needsRefresh()) {
    refresh();
  }
}

// ============================================
// Collapsible Sections
// ============================================

function initCollapsibleSections() {
  const titles = document.querySelectorAll(".section-title");
  titles.forEach((title) => {
    title.addEventListener("click", () => {
      title.classList.toggle("collapsed");
      const content = title.nextElementSibling;
      content.classList.toggle("hidden");
    });
  });
}

// ============================================
// Global Controls
// ============================================

function initGlobalControls() {
  // Mode dropdown
  const modeSelect = document.getElementById("mode");
  modeSelect.value = CONFIG.mode;
  modeSelect.addEventListener("change", (e) => {
    CONFIG.mode = e.target.value;
    updateModeVisibility();
    refresh();
  });

  // Background color
  const bgColor = document.getElementById("backgroundColor");
  bgColor.value = CONFIG.backgroundColor;
  bgColor.addEventListener("input", (e) => {
    CONFIG.backgroundColor = e.target.value;
    drawScene(dots);
  });

  // FPS slider
  const fps = document.getElementById("fps");
  const fpsValue = document.getElementById("fpsValue");
  fps.value = CONFIG.fps;
  fpsValue.textContent = CONFIG.fps;
  fps.addEventListener("input", (e) => {
    CONFIG.fps = parseInt(e.target.value, 10);
    fpsValue.textContent = CONFIG.fps;
    // Update animation interval for immediate effect
    STATE.animationInterval = 1000 / CONFIG.fps;
  });

  // Collision radius slider (affects layered mode collision detection)
  const dotSpacing = document.getElementById("dotSpacing");
  const dotSpacingValue = document.getElementById("dotSpacingValue");
  dotSpacing.value = CONFIG.dotSpacing;
  dotSpacingValue.textContent = CONFIG.dotSpacing;
  dotSpacing.addEventListener("input", (e) => {
    CONFIG.dotSpacing = parseFloat(e.target.value);
    dotSpacingValue.textContent = CONFIG.dotSpacing;
    refresh();
  });

  // Collisions checkbox
  const collisionsCheckbox = document.getElementById("collisionsEnabled");
  collisionsCheckbox.checked = CONFIG.collisionsEnabled;
  collisionsCheckbox.addEventListener("change", (e) => {
    CONFIG.collisionsEnabled = e.target.checked;
  });

  // Global speed slider
  const globalSpeed = document.getElementById("globalSpeed");
  const globalSpeedValue = document.getElementById("globalSpeedValue");
  globalSpeed.value = CONFIG.globalSpeed;
  globalSpeedValue.textContent = CONFIG.globalSpeed;
  globalSpeed.addEventListener("input", (e) => {
    CONFIG.globalSpeed = parseFloat(e.target.value);
    globalSpeedValue.textContent = CONFIG.globalSpeed;
  });
}

/**
 * Shows/hides UI sections based on current mode.
 * Grid mode: show grid settings, hide layer settings
 * Layered mode: show layer settings, hide grid settings
 */
function updateModeVisibility() {
  const gridSection = document.getElementById("gridSettings");
  const layerSection = document.getElementById("layerSettings");

  if (CONFIG.mode === "grid") {
    gridSection.style.display = "";
    layerSection.style.display = "none";
  } else {
    gridSection.style.display = "none";
    layerSection.style.display = "";
  }
}

// ============================================
// Field Dropdown
// ============================================

// ============================================
// Field Dropdown
// ============================================

function initFieldDropdown() {
  const fieldSelect = document.getElementById("field");
  const fieldDescription = document.getElementById("fieldDescription");

  // Clear and populate
  fieldSelect.innerHTML = "";
  for (const [key, info] of Object.entries(FIELD_INFO)) {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = info.name;
    fieldSelect.appendChild(option);
  }

  fieldSelect.value = CONFIG.currentField;
  fieldDescription.textContent =
    FIELD_INFO[CONFIG.currentField]?.description || "";

  fieldSelect.addEventListener("change", (e) => {
    CONFIG.currentField = e.target.value;
    fieldDescription.textContent =
      FIELD_INFO[CONFIG.currentField]?.description || "";
    initFieldControls(); // Rebuild field-specific controls
    refresh();
  });
}

// ============================================
// Grid Controls
// ============================================

function initGridControls() {
  // Spacing
  const spacing = document.getElementById("gridSpacing");
  const spacingValue = document.getElementById("gridSpacingValue");
  spacing.value = CONFIG.grid.spacing;
  spacingValue.textContent = CONFIG.grid.spacing;
  spacing.addEventListener("input", (e) => {
    CONFIG.grid.spacing = parseInt(e.target.value, 10);
    spacingValue.textContent = CONFIG.grid.spacing;
    refresh();
  });

  // Color
  const color = document.getElementById("gridColor");
  color.value = CONFIG.grid.color;
  color.addEventListener("input", (e) => {
    CONFIG.grid.color = e.target.value;
    drawScene(dots);
  });

  // Radius
  const radius = document.getElementById("gridRadius");
  const radiusValue = document.getElementById("gridRadiusValue");
  radius.value = CONFIG.grid.radius;
  radiusValue.textContent = CONFIG.grid.radius;
  radius.addEventListener("input", (e) => {
    CONFIG.grid.radius = parseFloat(e.target.value);
    radiusValue.textContent = CONFIG.grid.radius;
    drawScene(dots);
  });
}

// ============================================
// Layer Controls
// ============================================

function initLayerControls() {
  const container = document.getElementById("layerControls");
  container.innerHTML = "";

  CONFIG.layers.forEach((layer, index) => {
    const layerGroup = document.createElement("div");
    layerGroup.className = "layer-group";

    // Header
    const header = document.createElement("div");
    header.className = "layer-header";
    header.innerHTML = `<span class="layer-preview" style="background: ${layer.colors[0]}"></span> Layer ${index + 1}`;
    layerGroup.appendChild(header);

    const controls = document.createElement("div");
    controls.className = "layer-controls";

    // Count (with both slider and number input)
    controls.appendChild(
      createSliderWithInput({
        id: `layer${index}Count`,
        label: "Count",
        min: 0,
        max: 10000,
        step: 1,
        value: layer.count,
        onChange: (val) => {
          const oldCount = CONFIG.layers[index].count;
          const diff = val - oldCount;
          CONFIG.layers[index].count = val;

          if (diff > 0) {
            addDotsToLayer(index, diff);
          } else if (diff < 0) {
            removeDotsFromLayer(index, -diff);
          }
          drawScene(dots);
        },
      }),
    );

    // Radius ratio (displayed as percentage)
    controls.appendChild(
      createSlider({
        id: `layer${index}Radius`,
        label: "Size (%)",
        min: 0.1,
        max: 100,
        step: 0.1,
        value: layer.radiusRatio * 100,
        onChange: (val) => {
          CONFIG.layers[index].radiusRatio = val / 100;
          refresh();
        },
      }),
    );

    // Softness
    controls.appendChild(
      createSlider({
        id: `layer${index}Softness`,
        label: "Softness",
        min: 0.01,
        max: 1,
        step: 0.01,
        value: layer.softness,
        onChange: (val) => {
          CONFIG.layers[index].softness = val;
          drawScene(dots); // Redraw only, no grid rebuild
        },
      }),
    );

    // Speed multiplier
    controls.appendChild(
      createSlider({
        id: `layer${index}Speed`,
        label: "Speed",
        min: 0.1,
        max: 3,
        step: 0.1,
        value: layer.speedMultiplier,
        onChange: (val) => {
          CONFIG.layers[index].speedMultiplier = val;
          // Speed affects animation only, no redraw needed
        },
      }),
    );

    // Draw mode dropdown
    controls.appendChild(
      createDropdown({
        id: `layer${index}DrawMode`,
        label: "Draw Mode",
        options: [
          { value: "solid", label: "Solid (fast)" },
          { value: "gaussian", label: "Gaussian blur" },
          { value: "bokeh", label: "Bokeh blur" },
        ],
        value: layer.drawMode || "bokeh",
        onChange: (val) => {
          CONFIG.layers[index].drawMode = val;
          drawScene(dots);
        },
      }),
    );

    // Colors (multiple color pickers)
    const colorGroup = document.createElement("div");
    colorGroup.className = "control-group";

    const colorLabel = document.createElement("label");
    colorLabel.textContent = "Colors";
    colorGroup.appendChild(colorLabel);

    const colorSwatches = document.createElement("div");
    colorSwatches.className = "color-swatches";

    layer.colors.forEach((color, colorIndex) => {
      const colorInput = document.createElement("input");
      colorInput.type = "color";
      colorInput.value = color;
      colorInput.addEventListener("input", (e) => {
        CONFIG.layers[index].colors[colorIndex] = e.target.value;
        // Update the preview swatch in header
        header.querySelector(".layer-preview").style.background =
          CONFIG.layers[index].colors[0];
        // Update existing dot colors for this layer (with colorIndex for z-ordering)
        dots.forEach((dot) => {
          if (dot.layer === index) {
            const colors = CONFIG.layers[index].colors;
            const idx = Math.floor(Math.random() * colors.length);
            dot.color = colors[idx];
            dot.colorIndex = idx;
          }
        });
        drawScene(dots);
      });
      colorSwatches.appendChild(colorInput);
    });

    colorGroup.appendChild(colorSwatches);
    controls.appendChild(colorGroup);

    layerGroup.appendChild(controls);
    container.appendChild(layerGroup);
  });
}

// ============================================
// Field-Specific Controls
// ============================================

function initFieldControls() {
  const container = document.getElementById("fieldControls");
  container.innerHTML = "";

  const fieldKey = CONFIG.currentField;
  const fieldConfig = CONFIG.fields[fieldKey];

  if (!fieldConfig) {
    container.innerHTML =
      '<p style="color: #666; font-size: 12px;">No settings for this field.</p>';
    return;
  }

  // Build controls based on field type
  switch (fieldKey) {
    case "randomWalk":
      buildRandomWalkControls(container, fieldConfig);
      break;
    case "shiver":
      buildShiverControls(container, fieldConfig);
      break;
    case "wave":
    case "standingWave":
      buildWaveControls(container, fieldConfig, fieldKey);
      break;
    case "curlNoise":
      buildCurlNoiseControls(container, fieldConfig);
      break;
    case "vortexLattice":
      buildVortexLatticeControls(container, fieldConfig);
      break;
    case "waveNoise":
      buildWaveNoiseControls(container, fieldConfig);
      break;
    case "cellular":
      buildCellularControls(container, fieldConfig);
      break;
    case "multiWave":
      container.innerHTML =
        '<p style="color: #666; font-size: 12px;">Multi-wave uses preset components.</p>';
      break;
  }
}

function buildRandomWalkControls(container, config) {
  container.appendChild(
    createSlider({
      id: "rwSpeed",
      label: "Speed",
      min: 0.1,
      max: 5,
      step: 0.1,
      value: config.speed,
      onChange: (val) => {
        CONFIG.fields.randomWalk.speed = val;
      },
    }),
  );

  container.appendChild(
    createSlider({
      id: "rwTurnSpeed",
      label: "Turn Speed",
      min: 0.05,
      max: 2,
      step: 0.05,
      value: config.turnSpeed,
      onChange: (val) => {
        CONFIG.fields.randomWalk.turnSpeed = val;
      },
    }),
  );
}

function buildShiverControls(container, config) {
  container.appendChild(
    createSlider({
      id: "shiverAmp",
      label: "Amplitude",
      min: 0.1,
      max: 5,
      step: 0.1,
      value: config.amplitude,
      onChange: (val) => {
        CONFIG.fields.shiver.amplitude = val;
      },
    }),
  );

  container.appendChild(
    createSlider({
      id: "shiverRestore",
      label: "Restore Strength",
      min: 0,
      max: 1,
      step: 0.05,
      value: config.restoreStrength,
      onChange: (val) => {
        CONFIG.fields.shiver.restoreStrength = val;
      },
    }),
  );
}

function buildWaveControls(container, config, fieldKey) {
  const prefix = fieldKey === "standingWave" ? "sw" : "w";
  const configRef = CONFIG.fields[fieldKey];

  container.appendChild(
    createSlider({
      id: `${prefix}WaveNumber`,
      label: "Wave Number",
      min: 0.001,
      max: 0.02,
      step: 0.001,
      value: config.waveNumber,
      onChange: (val) => {
        configRef.waveNumber = val;
      },
    }),
  );

  container.appendChild(
    createSlider({
      id: `${prefix}Frequency`,
      label: "Frequency",
      min: 0.1,
      max: 5,
      step: 0.1,
      value: config.angularFrequency,
      onChange: (val) => {
        configRef.angularFrequency = val;
      },
    }),
  );

  container.appendChild(
    createSlider({
      id: `${prefix}Amplitude`,
      label: "Amplitude",
      min: 0.1,
      max: 5,
      step: 0.1,
      value: config.amplitude,
      onChange: (val) => {
        configRef.amplitude = val;
      },
    }),
  );
}

function buildCurlNoiseControls(container, config) {
  container.appendChild(
    createSlider({
      id: "cnScale",
      label: "Scale",
      min: 0.001,
      max: 0.02,
      step: 0.001,
      value: config.scale,
      onChange: (val) => {
        CONFIG.fields.curlNoise.scale = val;
      },
    }),
  );

  container.appendChild(
    createSlider({
      id: "cnAmplitude",
      label: "Amplitude",
      min: 1,
      max: 50,
      step: 1,
      value: config.amplitude,
      onChange: (val) => {
        CONFIG.fields.curlNoise.amplitude = val;
      },
    }),
  );

  container.appendChild(
    createSlider({
      id: "cnTimeSpeed",
      label: "Time Speed",
      min: 0.01,
      max: 0.2,
      step: 0.01,
      value: config.timeSpeed,
      onChange: (val) => {
        CONFIG.fields.curlNoise.timeSpeed = val;
      },
    }),
  );
}

function buildVortexLatticeControls(container, config) {
  container.appendChild(
    createSlider({
      id: "vlSpacing",
      label: "Spacing",
      min: 100,
      max: 500,
      step: 10,
      value: config.spacing,
      onChange: (val) => {
        CONFIG.fields.vortexLattice.spacing = val;
        refresh(); // Need refresh to rebuild vortex centers
      },
    }),
  );

  container.appendChild(
    createSlider({
      id: "vlRadius",
      label: "Radius",
      min: 100,
      max: 1000,
      step: 50,
      value: config.radius,
      onChange: (val) => {
        CONFIG.fields.vortexLattice.radius = val;
      },
    }),
  );

  container.appendChild(
    createSlider({
      id: "vlStrength",
      label: "Strength",
      min: -0.5,
      max: 0.5,
      step: 0.01,
      value: config.strength,
      onChange: (val) => {
        CONFIG.fields.vortexLattice.strength = val;
      },
    }),
  );
}

function buildWaveNoiseControls(container, config) {
  container.appendChild(
    createSlider({
      id: "wnScale",
      label: "Scale",
      min: 0.001,
      max: 0.01,
      step: 0.001,
      value: config.scale,
      onChange: (val) => {
        CONFIG.fields.waveNoise.scale = val;
      },
    }),
  );

  container.appendChild(
    createSlider({
      id: "wnTimeSpeed",
      label: "Time Speed",
      min: 0.01,
      max: 0.3,
      step: 0.01,
      value: config.timeSpeed,
      onChange: (val) => {
        CONFIG.fields.waveNoise.timeSpeed = val;
      },
    }),
  );

  container.appendChild(
    createSlider({
      id: "wnAmplitude",
      label: "Amplitude",
      min: 0.1,
      max: 1,
      step: 0.05,
      value: config.amplitude,
      onChange: (val) => {
        CONFIG.fields.waveNoise.amplitude = val;
      },
    }),
  );
}

function buildCellularControls(container, config) {
  container.appendChild(
    createSlider({
      id: "cellSize",
      label: "Cell Size",
      min: 20,
      max: 200,
      step: 10,
      value: config.cellSize,
      onChange: (val) => {
        CONFIG.fields.cellular.cellSize = val;
      },
    }),
  );

  container.appendChild(
    createSlider({
      id: "cellStrength",
      label: "Strength",
      min: 0.01,
      max: 0.5,
      step: 0.01,
      value: config.strength,
      onChange: (val) => {
        CONFIG.fields.cellular.strength = val;
      },
    }),
  );
}

// ============================================
// Control Factory Functions
// ============================================
// Helper Functions for Creating Controls
// ============================================

/**
 * Creates a slider control with both slider and number input.
 * Both inputs stay synced - changing one updates the other.
 * Useful when users want precise control over a value.
 * @param {Object} config - Slider configuration
 * @param {string} config.id - HTML id for the input element
 * @param {string} config.label - Display label text
 * @param {number} config.min - Minimum value
 * @param {number} config.max - Maximum value
 * @param {number} config.step - Increment step size
 * @param {number} config.value - Initial value
 * @param {Function} config.onChange - Callback when value changes
 * @returns {HTMLElement} Complete control group div
 */
function createSliderWithInput({ id, label, min, max, step, value, onChange }) {
  const group = document.createElement("div");
  group.className = "control-group";

  const labelEl = document.createElement("label");
  labelEl.htmlFor = id;
  labelEl.textContent = label;
  group.appendChild(labelEl);

  // Container for slider + number input
  const inputRow = document.createElement("div");
  inputRow.style.display = "flex";
  inputRow.style.gap = "8px";
  inputRow.style.alignItems = "center";

  // Slider
  const slider = document.createElement("input");
  slider.type = "range";
  slider.id = id;
  slider.min = min;
  slider.max = max;
  slider.step = step;
  slider.value = value;
  slider.style.flex = "1";

  // Number input
  const numberInput = document.createElement("input");
  numberInput.type = "number";
  numberInput.id = `${id}Number`;
  numberInput.min = min;
  numberInput.max = max;
  numberInput.step = step;
  numberInput.value = value;
  numberInput.style.width = "60px";

  // Sync slider → number input
  slider.addEventListener("input", (e) => {
    const val = parseFloat(e.target.value);
    numberInput.value = val;
    onChange(val);
  });

  // Sync number input → slider
  numberInput.addEventListener("input", (e) => {
    let val = parseFloat(e.target.value);
    if (isNaN(val)) return; // Don't update if invalid
    // Clamp to valid range
    val = Math.max(min, Math.min(max, val));
    slider.value = val;
    onChange(val);
  });

  inputRow.appendChild(slider);
  inputRow.appendChild(numberInput);
  group.appendChild(inputRow);
  return group;
}

/**
 * Creates a slider control with label and value display.
 * Automatically updates the displayed value as user drags slider.
/**
 * Creates a slider control with both slider and number input.
 * Both inputs stay synced - changing one updates the other.
 * @param {Object} config - Slider configuration
 * @param {string} config.id - HTML id for the input element
 * @param {string} config.label - Display label text
 * @param {number} config.min - Minimum slider value
 * @param {number} config.max - Maximum slider value
 * @param {number} config.step - Increment step size
 * @param {number} config.value - Initial value
 * @param {Function} config.onChange - Callback when value changes, receives new value
 * @returns {HTMLElement} Complete control group div
 */
function createSlider({ id, label, min, max, step, value, onChange }) {
  const group = document.createElement("div");
  group.className = "control-group";

  const labelEl = document.createElement("label");
  labelEl.htmlFor = id;
  labelEl.textContent = label;
  group.appendChild(labelEl);

  // Container for slider + number input
  const inputRow = document.createElement("div");
  inputRow.style.display = "flex";
  inputRow.style.gap = "8px";
  inputRow.style.alignItems = "center";

  // Slider
  const slider = document.createElement("input");
  slider.type = "range";
  slider.id = id;
  slider.min = min;
  slider.max = max;
  slider.step = step;
  slider.value = value;
  slider.style.flex = "1";

  // Number input
  const numberInput = document.createElement("input");
  numberInput.type = "number";
  numberInput.id = `${id}Number`;
  numberInput.min = min;
  numberInput.max = max;
  numberInput.step = step;
  numberInput.value = value;
  numberInput.style.width = "60px";

  // Sync slider → number input
  slider.addEventListener("input", (e) => {
    const val = parseFloat(e.target.value);
    numberInput.value = val;
    onChange(val);
  });

  // Sync number input → slider
  numberInput.addEventListener("input", (e) => {
    let val = parseFloat(e.target.value);
    if (isNaN(val)) return;
    // Clamp to valid range
    val = Math.max(min, Math.min(max, val));
    slider.value = val;
    onChange(val);
  });

  inputRow.appendChild(slider);
  inputRow.appendChild(numberInput);
  group.appendChild(inputRow);
  return group;
}

/**
 * Creates a color picker control.
 * @param {Object} config - Color picker configuration
 * @param {string} config.id - HTML id for the input element
 * @param {string} config.label - Display label text
 * @param {string} config.value - Initial color (hex string)
 * @param {Function} config.onChange - Callback when color changes, receives new hex string
 * @returns {HTMLElement} Complete control group div
 */
function createColorPicker({ id, label, value, onChange }) {
  const group = document.createElement("div");
  group.className = "control-group";

  const labelEl = document.createElement("label");
  labelEl.htmlFor = id;
  labelEl.textContent = label;
  group.appendChild(labelEl);

  const input = document.createElement("input");
  input.type = "color";
  input.id = id;
  input.value = value;

  input.addEventListener("input", (e) => {
    onChange(e.target.value);
  });

  group.appendChild(input);
  return group;
}

/**
 * Creates a dropdown select control.
 * @param {Object} config - Dropdown configuration
 * @param {string} config.id - HTML id for the select element
 * @param {string} config.label - Display label text
 * @param {Array} config.options - Array of {value, label} objects
 * @param {string} config.value - Initial selected value
 * @param {Function} config.onChange - Callback when selection changes
 * @returns {HTMLElement} Complete control group div
 */
function createDropdown({ id, label, options, value, onChange }) {
  const group = document.createElement("div");
  group.className = "control-group";

  const labelEl = document.createElement("label");
  labelEl.htmlFor = id;
  labelEl.textContent = label;
  group.appendChild(labelEl);

  const select = document.createElement("select");
  select.id = id;

  options.forEach((opt) => {
    const option = document.createElement("option");
    option.value = opt.value;
    option.textContent = opt.label;
    select.appendChild(option);
  });

  select.value = value;

  select.addEventListener("change", (e) => {
    onChange(e.target.value);
  });

  group.appendChild(select);
  return group;
}
