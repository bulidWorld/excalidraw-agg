# Excalidraw Aggregation - Deployment Guide

## ✅ Deployment Complete

Excalidraw Aggregation has been deployed with a **unified single-port architecture**!

---

## 📍 Installation Location

- **Root Directory:** `/opt/apps/excalidraw-agg`
- **Frontend Build:** `/opt/apps/excalidraw-agg/excalidraw/excalidraw-app/build`
- **Server:** `/opt/apps/excalidraw-agg/server`
- **Data Storage:** `/opt/apps/excalidraw-agg/data`

---

## 🌐 Access URLs

| Service | Port | URL |
|---------|------|-----|
| **Frontend + API** | 10514 | http://0.0.0.0:10514 |
| **Health Check** | 10514 | http://localhost:10514/api/health |

---

## 🚀 Architecture

```
┌─────────────────────────────────────────────────────┐
│           Unified Server (Port 10514)               │
│           IP Binding: 0.0.0.0                       │
│                                                     │
│  ┌───────────────────┐     ┌─────────────────────┐ │
│  │  Static Files     │     │   API Endpoints     │ │
│  │  (Frontend)       │     │   (File Storage)    │ │
│  │  /                │     │   /api/*            │ │
│  └───────────────────┘     └─────────────────────┘ │
│                    │                    │           │
│                    ▼                    ▼           │
│           ┌─────────────────────────────────┐      │
│           │      Data Storage               │      │
│           │ /opt/apps/excalidraw-agg/data   │      │
│           └─────────────────────────────────┘      │
└─────────────────────────────────────────────────────┘
                     ▲
                     │
              Users access via
         http://server-ip:10514
```

**Request Routing:**
- `/api/*` → API handlers (file storage)
- `/*` → Static files (frontend) + SPA fallback

---

## 🔧 Starting the Server

### Quick Start
```bash
cd /opt/apps/excalidraw-agg/server
node server.js &
```

### With Custom Port
```bash
cd /opt/apps/excalidraw-agg/server
PORT=9000 node server.js &
```

### With Custom Storage Directory
```bash
cd /opt/apps/excalidraw-agg/server
STORAGE_DIR=/custom/path node server.js &
```

---

## 🛑 Stopping the Server

```bash
# Stop by pattern
pkill -f "excalidraw-agg/server"

# Or by port
lsof -ti:18888 | xargs kill -9

# Or find PID manually
ps aux | grep "node server.js" | grep -v grep | awk '{print $2}' | xargs kill
```

---

## 🔧 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `10514` | Port for the unified server |
| `STORAGE_DIR` | `/opt/apps/excalidraw-agg/data` | Directory for saved diagrams |

---

## 📁 Project Structure

```
/opt/apps/excalidraw-agg/
├── data/                          # Saved diagrams storage
├── deploy/
│   └── frontend-server.js         # (Deprecated - old frontend server)
├── excalidraw/                    # Frontend source (git submodule)
│   └── excalidraw-app/
│       └── build/                 # Production build
└── server/                        # Unified server
    ├── server.js                  # Main server (API + Static)
    └── package.json
```

---

## 🔌 API Endpoints

All API endpoints are prefixed with `/api/`:

### Health Check
```bash
GET http://localhost:10514/api/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-03-24T05:56:00.554Z",
  "frontend": "/opt/apps/excalidraw-agg/excalidraw/excalidraw-app/build",
  "storage": "/opt/apps/excalidraw-agg/data"
}
```

### Save Diagram
```bash
POST http://localhost:10514/api/save
Content-Type: application/json

{
  "name": "my-diagram",
  "folder": "projects",
  "data": { /* excalidraw scene data */ }
}
```

### List Folders & Files
```bash
GET http://localhost:10514/api/folders?path=projects
```

### Create Folder
```bash
POST http://localhost:10514/api/folders
Content-Type: application/json

{
  "name": "new-folder",
  "parentPath": "projects"
}
```

### Load Diagram
```bash
GET http://localhost:10514/api/files/projects/my-diagram.excalidraw
```

### Delete Diagram
```bash
DELETE http://localhost:10514/api/files/projects/my-diagram.excalidraw
```

---

## 🛠️ Troubleshooting

### Check if server is running
```bash
# Check process
ps aux | grep "node server.js" | grep -v grep

# Check port
ss -tlnp | grep 10514
```

### Test API
```bash
curl http://localhost:10514/api/health
```

### Test Frontend
```bash
curl http://localhost:10514/ | head -5
```

### Port in use error
```bash
# Find what's using the port
lsof -i:10514

# Or use a different port
PORT=10515 node server.js &
```

---

## 📝 Key Features

### Single Port Architecture
- **Simplified deployment** - Only one port to manage
- **No CORS issues** - Frontend and API on same origin
- **Easy reverse proxy** - Single backend for nginx/traefik

### Static File Serving
- Express serves the Vite-built frontend
- All non-API routes return `index.html` for SPA routing

### Security
- Path traversal protection for file operations
- CORS enabled for cross-origin requests
- Input sanitization for file/folder names

---

## 🔄 Quick Restart Script

```bash
#!/bin/bash
# restart.sh

# Stop old instance
pkill -f "excalidraw-agg/server"
sleep 1

# Start new instance
cd /opt/apps/excalidraw-agg/server
nohup node server.js > /tmp/excalidraw.log 2>&1 &

# Verify
sleep 2
curl http://localhost:10514/api/health
```

---

## 📊 Comparison: Old vs New

| Aspect | Old (Dual Port) | New (Single Port) |
|--------|-----------------|-------------------|
| Ports | 2 (18800 + 18801) | 1 (10514) |
| Processes | 2 (frontend + backend) | 1 (unified) |
| CORS | Required | Not needed |
| Deployment | Complex | Simple |
| Memory | Higher | Lower |
| Reverse Proxy | 2 backends | 1 backend |

---

## 🎯 Production Deployment Example (nginx)

```nginx
server {
    listen 80;
    server_name excalidraw.example.com;

    location / {
        proxy_pass http://localhost:10514;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

**Last Updated:** 2026-03-24  
**Version:** 1.0 (Unified Architecture)
