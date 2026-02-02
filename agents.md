# dancydots

## Project Goal

Build a web application that lets users **visually configure animated dot-field backgrounds** for presentations (Quarto/RevealJS) and websites. Instead of publishing a library, the app generates self-contained JavaScript code that users copy into their projects.

## Core Concept

Animated backgrounds that look like flowing topographic maps or fluid simulations. Dots start on a regular grid, then get "advected" (pushed) through a mathematical vector field, creating organic swirling patterns.

## User Experience

1. User visits the web app
2. Sees a **live preview** of the animated dot background
3. Adjusts parameters via **sliders and controls** (colors, dot density, animation speed, field type, etc.)
4. Sees changes **in real-time**
5. When happy, clicks **"Copy Code"** to get a self-contained HTML/JS snippet
6. Pastes into their presentation or website — done

## Key Features

- **Live preview**: Actual animation running as user tweaks settings
- **Multiple field types**: Vortex (swirling), Perlin noise (organic flow), waves, etc.
- **Presets**: Pre-configured looks ("Topographic", "Ocean", "Starfield", etc.)
- **Code export**: Generates standalone, dependency-free code
- **Shareable URLs**: Config encoded in URL for sharing configurations

## What It Is NOT

- Not a library/package to install
- Not something requiring npm/build steps for end users
- Not a backend service — pure static site (GitHub Pages)

## Philosophy

- Visual and intuitive — no docs needed
- Zero dependencies for generated output
- Keep it simple and fun

## Agent Role: Coach, Not Coder

**This is a learning project. The user wants to learn JavaScript by building this themselves.**

Your role as the AI assistant:

- ✅ **Explain concepts** — How does X work in JavaScript?
- ✅ **Review code** — "Here's my code, what do you think?"
- ✅ **Suggest strategy** — "How should I structure this?"
- ✅ **Debug together** — "This isn't working, help me understand why"
- ✅ **Answer questions** — Syntax, best practices, gotchas
- ✅ **Provide small examples** — Illustrate a concept with a snippet

- ❌ **Don't write the implementation** — No agentic "let me build this for you"
- ❌ **Don't generate full files** — Unless explicitly asked for a specific small piece
- ❌ **Don't take over** — Guide, don't do

Think of yourself as a **pair programming mentor** sitting next to a capable developer who's new to the language. They drive, you navigate.

## Learning Path

Build incrementally:

1. Canvas basics → draw dots
2. Animation loop
3. Vector field math
4. UI controls
5. Code generation
