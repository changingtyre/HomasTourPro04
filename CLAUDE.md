# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Homas Tour Pro is a client-side cycling board game result tracking system. It manages races, riders, teams, and calculates World Tour Points using the UCI 1997 point system. The UI and all user-facing text is in Danish.

## Running the Application

Must be served via a web server (localStorage doesn't work with `file://`):

```bash
python -m http.server 8000
# Then open http://localhost:8000
```

## Architecture

No build tools, no dependencies, no frameworks — 100% vanilla JavaScript with direct DOM manipulation. All state persists in browser localStorage under the key `cyclingTourData`.

### File Structure

- **`index.html`** — Single HTML page entry point, loads scripts in order
- **`app.js`** — Bootstrap: tests localStorage, initializes `DataManager` and `UI`
- **`data.js`** — `DataManager` singleton: all CRUD operations, localStorage read/write, point recalculation
- **`points.js`** — `PointsCalculator` static object: UCI 1997 point tables and calculation logic
- **`ui.js`** — `UI` singleton: all rendering (innerHTML), event binding, navigation state
- **`styles.css`** — All styling

### Data Flow

User interaction → `UI` event handler → `DataManager` method (load → modify → save to localStorage) → `UI` re-render

### Data Model (localStorage: `cyclingTourData`)

Hierarchy: Game → Players/Teams/Riders/Races. Each game contains its own players, teams (with riders), races (one-day or stage races), and standings. IDs are timestamp-based (e.g., `player-1645123456789`).

### Race Types & Point System

- **One-day races**: Monuments (80-4 pts), World Cup Major (50-3 pts), World Cup Other (40-2 pts)
- **Stage races**: Tour de France (GC 130-8, stage 21-7, jersey 21-11, yellow bonus 8/day), Giro/Vuelta (GC 85-1, stage 18-6, jersey 18-10, yellow bonus 6/day)

Stage races have multi-stage support with automatic general/points/mountain/team classification calculation.

## Conventions

- Danish variable names, comments, and UI strings throughout
- camelCase method names
- `alert()` for user-facing errors, `console.log` for debug output
- No test framework — manual testing via browser
