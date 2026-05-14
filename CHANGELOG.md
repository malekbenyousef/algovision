# Change Log

All notable changes to the "algovision" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [1.0.0] - 2026-05-12

### Added (Phase 5 - Polish & Graduation)
- Added new brand logo (logo.svg) to webview header.
- Added comprehensive unit tests for GraphEnricher (100% pipeline coverage).
- Added formal `README.md` with system architecture and full documentation.
- Packaged as a `.vsix` ready for academic submission.

### Added (Phase 4 - Advanced Data Structures & Features)
- **Graph Visualizer**: Added dynamic ReactFlow visualization for adjacency list graphs (`GraphEnricher`).
- **Graph Shortest Path Demo**: Added interactive BFS demonstration in the test suite.
- **Pointer Overlays**: Added active index tracking (e.g. `lo`, `hi`, `mid`) overlaying `ArrayVisualizer` and `LinkedListVisualizer`.
- **Cycle Detection**: Added infinite loop prevention and cyclic graph detection to LinkedLists.

### Added (Phase 3 - Playback & History)
- **State Management**: Migrated state to `Zustand` for seamless history tracking.
- **Step Back**: Implemented fully functional "Step Back" capability using history snapshots.
- **Playback Controls**: Complete debug panel with Auto-Play, Pause, Step Forward, and Restart.
- **Configurable Speed**: Added `algovision.playbackSpeedMs` to VS Code settings.

### Changed (Phase 2 - UI/UX Overhaul & Brand Identity)
- **Design System**: Implemented AlgoVision CSS framework (brand colors, surface variables, responsive typography).
- **Visual Consistency**: All visualizers now use a shared `VisualizerCard` wrapper.
- **Tree Visualization**: Maintained `ReactFlow` specifically for interactive Binary Tree layouts.
- **TypeScript**: Migrated the entire webview React application from JavaScript to strict TypeScript.
- **Empty States**: Added explicit loading skeletons and empty view states.

### Fixed (Phase 1 - Backend Hardening)
- Fixed globally mutable `nodeId` memory leak in Tree generation.
- Fixed dead-loop execution on `fetchRawVariables`.
- Abstracted 2D arrays into a distinct `MatrixEnricher` to prevent false positive matches.
- Unified codebase with strict ESLint and Prettier formatting rules.