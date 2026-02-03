# 🎯 DancyDots

**Animated dot-field backgrounds for presentations and websites.**

Create mesmerizing, flowing topographic-style animations with zero dependencies. Configure visually, export self-contained code.

[**🚀 Try it live →**](https://brakjen.github.io/dancydots/)

---

## ✨ Features

- **Live preview** — See changes instantly as you tweak settings
- **Multiple field types** — Waves, curl noise, vortices, and more
- **Two modes** — Uniform grid or layered depth with soft gradients
- **One-click export** — Download standalone HTML, paste anywhere
- **URL sharing** — Link directly to any configuration
- **Zero dependencies** — Generated code is pure vanilla JS

---

## 🌊 Field Types

| Field                                                                                       | Description                     | Preview |
| ------------------------------------------------------------------------------------------- | ------------------------------- | ------- |
| [**Wave**](https://brakjen.github.io/dancydots/?mode=grid&field=wave)                       | Horizontal traveling wave       | _GIF_   |
| [**Standing Wave**](https://brakjen.github.io/dancydots/?mode=grid&field=standingWave)      | Oscillating wave pattern        | _GIF_   |
| [**Curl Noise**](https://brakjen.github.io/dancydots/?mode=grid&field=curlNoise)            | Fluid-like swirling motion      | _GIF_   |
| [**Multi-Wave**](https://brakjen.github.io/dancydots/?mode=grid&field=multiWave)            | Superposition of multiple waves | _GIF_   |
| [**Vortex Lattice**](https://brakjen.github.io/dancydots/?mode=layered&field=vortexLattice) | Grid of rotating vortices       | _GIF_   |
| [**Cellular Flow**](https://brakjen.github.io/dancydots/?mode=grid&field=cellular)          | Cell-based rotating regions     | _GIF_   |
| [**Random Walk**](https://brakjen.github.io/dancydots/?mode=layered&field=randomWalk)       | Independent wandering dots      | _GIF_   |
| [**Shiver**](https://brakjen.github.io/dancydots/?mode=grid&field=shiver)                   | Jittery motion with restoration | _GIF_   |

---

## 🎨 Modes

### Grid Mode

Uniform spacing, single color. Clean and minimal.

```
?mode=grid&field=wave
```

### Layered Mode

Multiple depth layers with:

- Different sizes and colors per layer
- Soft Gaussian gradients
- Parallax-like speed differences
- Collision detection

```
?mode=layered&field=curlNoise
```

---

## 📦 Usage

### For Quarto / RevealJS

1. Configure your animation at [dancydots](https://brakjen.github.io/dancydots/)
2. Click **Export** to download `dancydots_<mode>_<field>.html`
3. In your Quarto YAML:

```yaml
format:
  revealjs:
    include-after-body: dancydots_grid_wave.html
```

### For any website

Just paste the exported HTML anywhere in your page. It's fully self-contained.

---

## 🔗 URL Parameters

Share configurations with URL parameters:

| Parameter | Values                                     | Example            |
| --------- | ------------------------------------------ | ------------------ |
| `mode`    | `grid`, `layered`                          | `?mode=grid`       |
| `field`   | `wave`, `curlNoise`, `vortexLattice`, etc. | `?field=curlNoise` |

**Examples:**

- [Grid + Wave](https://brakjen.github.io/dancydots/?mode=grid&field=wave)
- [Layered + Curl Noise](https://brakjen.github.io/dancydots/?mode=layered&field=curlNoise)
- [Layered + Vortex Lattice](https://brakjen.github.io/dancydots/?mode=layered&field=vortexLattice)

---

## 🛠️ Development

```bash
# Clone and serve locally
git clone https://github.com/Brakjen/dancydots.git
cd dancydots
npx serve .
```

No build step required — it's vanilla ES modules.

---

## 📄 License

MIT
