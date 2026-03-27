# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an **Excalidraw Aggregation** deployment that wraps the Excalidraw whiteboard application with a custom file storage backend. The project uses git submodules to manage the frontend and backend code separately.

## Architecture

```
/opt/apps/excalidraw-agg/
├── excalidraw/          # Git submodule: Frontend (forked from excalidraw/excalidraw)
│   └── excalidraw-app/  # Main application
│       └── build/       # Production build output (served by server)
├── server/              # Git submodule: Express backend for file storage
│   └── server.js        # Unified server (API + static files)
└── data/                # Saved diagrams storage
```

**Key Architecture Decision**: Single-port unified server (port 10514) that serves both the frontend static files and the API endpoints. No CORS issues since everything is on the same origin.

## Development Commands

### Running the Application

```bash
# Start the unified server (production mode)
cd /opt/apps/excalidraw-agg/server && node server.js

# Start with custom port
PORT=9000 node server/server.js

# Start with custom storage directory
STORAGE_DIR=/custom/path node server/server.js
```

### Frontend Development (excalidraw submodule)

```bash
cd excalidraw

# Install dependencies
yarn install

# Start development server (port 3000)
yarn start

# Build for production
yarn build

# Run tests
yarn test:all

# Type checking
yarn test:typecheck

# Auto-fix linting/formatting
yarn fix
```

### Running Single Tests

```bash
cd excalidraw
yarn test path/to/file.test.tsx    # Run specific test file
yarn test:app                       # Run tests in watch mode
yarn test:update                    # Update snapshots
```

## Server API Endpoints

All endpoints prefixed with `/api/`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/folders?path=...` | List folders and files |
| POST | `/api/folders` | Create folder |
| POST | `/api/save` | Save diagram (JSON body: `{name, data, folder}`) |
| GET | `/api/files/:path` | Load diagram |
| DELETE | `/api/files/:path` | Delete diagram |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `10514` | Server port |
| `STORAGE_DIR` | `/opt/apps/excalidraw-agg/data` | Diagram storage directory |

## Submodule Notes

The `excalidraw/` directory is a git submodule pointing to a forked repository. It contains its own CLAUDE.md with detailed frontend development guidance. Key paths:

- `excalidraw/packages/excalidraw/` - Core React component library
- `excalidraw/excalidraw-app/` - Full web application
- `excalidraw/packages/` - Core packages: `common`, `element`, `math`, `utils`

The frontend is a Yarn monorepo using React 19, Vite 5, TypeScript, and Jotai for state management.

## Deployment

Refer to [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions including nginx configuration, process management, and troubleshooting.