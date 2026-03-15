# docx-viewer

Simple client-side viewer for .docx Word documents, built with [Vue 3](https://vuejs.org/) and [docx-preview](https://github.com/VolodymyrBaydalka/docxjs).

## Features

- Fullscreen drag-and-drop file selector
- Click anywhere to open a file browser dialog
- Supports `.docx` files only
- Renders documents using docx-preview — no server required

## Requirements

- [Node.js](https://nodejs.org/) 18 or later
- [pnpm](https://pnpm.io/) 8 or later

## Getting started

### Install dependencies

```bash
pnpm install
```

### Run in development mode

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```bash
pnpm build
```

The compiled output is placed in the `dist/` directory and can be served by any static file server.

### Preview the production build

```bash
pnpm preview
```
