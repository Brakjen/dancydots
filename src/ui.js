import { CONFIG, FIELD_INFO } from "./config.js";
import { refresh } from "./canvas.js";
import { downloadExport } from "./export.js";

/**
 * Initializes all UI controls and binds them to CONFIG.
 */
export function initUI() {
  // Initialize all sections
  initRefreshButton();
  initExportButton();
  initFullscreenToggle();
  initCollapsibleSections();
  initGlobalControls();
  initFieldDropdown();
  initGridControls();
  initLayerControls();
  initFieldControls();

  // Update visibility based on current mode
  updateModeVisibility();
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
// Fullscreen Toggle
// ============================================

function initFullscreenToggle() {
  const btn = document.getElementById("fullscreenToggle");
  
  btn.addEventListener("click", () => {
    document.body.classList.toggle("fullscreen");
  });

  // Escape key exits fullscreen
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.body.classList.contains("fullscreen")) {
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
    refresh();
  });

  // FPS slider
  const fps = document.getElementById("fps");
  const fpsValue = document.getElementById("fpsValue");
  fps.value = CONFIG.fps;
  fpsValue.textContent = CONFIG.fps;
  fps.addEventListener("input", (e) => {
    CONFIG.fps = parseInt(e.target.value, 10);
    fpsValue.textContent = CONFIG.fps;
    refresh();
  });
}

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
    refresh();
  });

  // Radius
  const radius = document.getElementById("gridRadius");
  const radiusValue = document.getElementById("gridRadiusValue");
  radius.value = CONFIG.grid.radius;
  radiusValue.textContent = CONFIG.grid.radius;
  radius.addEventListener("input", (e) => {
    CONFIG.grid.radius = parseFloat(e.target.value);
    radiusValue.textContent = CONFIG.grid.radius;
    refresh();
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

    // Count
    controls.appendChild(
      createSlider({
        id: `layer${index}Count`,
        label: "Count",
        min: 0,
        max: 500,
        step: 1,
        value: layer.count,
        onChange: (val) => {
          CONFIG.layers[index].count = val;
          refresh();
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
          refresh();
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
          refresh();
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
        refresh();
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

/**
 * Creates a slider control with label and value display.
 */
function createSlider({ id, label, min, max, step, value, onChange }) {
  const group = document.createElement("div");
  group.className = "control-group";

  const labelEl = document.createElement("label");
  labelEl.htmlFor = id;
  labelEl.innerHTML = `${label} <span id="${id}Value">${value}</span>`;
  group.appendChild(labelEl);

  const input = document.createElement("input");
  input.type = "range";
  input.id = id;
  input.min = min;
  input.max = max;
  input.step = step;
  input.value = value;

  input.addEventListener("input", (e) => {
    const val = parseFloat(e.target.value);
    document.getElementById(`${id}Value`).textContent = val;
    onChange(val);
  });

  group.appendChild(input);
  return group;
}

/**
 * Creates a color picker control.
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
