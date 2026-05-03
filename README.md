# AlgoVision

AlgoVision is a Visual Studio Code extension that helps students, instructors, and developers understand algorithm behavior by visualizing variable state changes during debugging.

## Features

- Visualizes common structures (primitive values, arrays, 2D arrays, objects, linked lists).
- Updates visuals on debugger stop events.
- Supports guided stepping with in-panel auto-play.
- Highlights changed values between debugger steps.

## Development setup

### Prerequisites

- Node.js 22+
- npm 10+

### Install

```bash
npm ci
npm --prefix webview-ui ci
```

### Build

```bash
npm run build:all
```

This compiles the extension (`out/`) and builds the webview bundle (`webview-dist/`).

### Run in VS Code

1. Run `npm run build:all`.
2. Press `F5` in VS Code to launch the Extension Development Host.
3. Start a JavaScript/TypeScript debug session in the host window.
4. Run `AlgoVision: Visualize JavaScript Code` from the Command Palette.

## Quality checks

```bash
npm run lint
npm test
```

## Contributing

Pull requests are welcome. For major changes, open an issue first to discuss your proposal.

