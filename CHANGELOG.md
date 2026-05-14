# Change Log

All notable changes to the "algovision" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.0.0] - 2026-05-12

### Added (Phase 5 - Polish & graduation)

- Added brand logo (`logo.svg`) in the webview header.
- Added Vitest unit tests for enrichers: `ArrayEnricher`, `MatrixEnricher`, `LinkedListEnricher`, `TreeEnricher`, `GraphEnricher`, and object/primitive enrichers; plus `src/test/enrichers.unit.test.ts` for array/list/object parsing.
- Added `README.md` with architecture overview and usage aligned with the implementation.
- Packaged as a `.vsix` for distribution.

### Added (Phase 4 - Advanced data structures)

- **Graph visualizer:** React Flow panel plus Dagre layout for adjacency-style objects (`GraphEnricher`); highlights new nodes/edges compared to the previous snapshot.
- **Linked list visualizer:** Linear layout from walking `head` / `next` with a **100-node traversal cap** to limit runaway chains.
- **Diff highlighting:** Arrays, matrices, lists, trees, graphs, and objects show changes vs the prior snapshot where supported.

### Added (Phase 3 - Playback & history)

- **State:** Zustand store for variable snapshots and playback UI state.
- **Step Back / Step Forward:** Navigate stored snapshots (does not rewind the debuggee).
- **Playback bar:** Auto-Play, Pause, Step Forward (history or debugger step-over), and Restart debug session.
- **Setting:** `algovision.playbackSpeedMs` in `package.json` contributes the default auto-play interval; webview exposes Fast/Normal/Slow presets for the current session.

### Changed (Phase 2 - UI/UX & brand)

- **Design tokens:** Shared CSS variables for surfaces, borders, and accents.
- **Visualizer cards:** Shared `VisualizerCard` wrapper for structured types.
- **Binary tree UI:** React Flow with a custom layered layout and placeholder (“ghost”) nodes for missing children.
- **Webview:** TypeScript React app (strict TS in the webview sources).
- **Empty & loading states:** Skeleton cards and copy for no session / no locals.

### Fixed (Phase 1 - Backend hardening)

- Fixed globally mutable `nodeId` leak in tree generation.
- Fixed runaway behavior in `fetchRawVariables` handling.
- Split 2D arrays into `MatrixEnricher` before `ArrayEnricher` to avoid misclassification.
- ESLint + Prettier for the extension `src` tree.
