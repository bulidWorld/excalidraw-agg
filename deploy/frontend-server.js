const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.FRONTEND_PORT || 18800;
const API_URL = process.env.API_URL || 'http://localhost:18801';

// Serve static files
const BUILD_DIR = path.join(__dirname, '../excalidraw/excalidraw-app/build');
app.use(express.static(BUILD_DIR));

// Inject API URL into index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(BUILD_DIR, 'index.html'));
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(BUILD_DIR, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║     Excalidraw Frontend Server Started                    ║');
  console.log(`║     URL:  http://0.0.0.0:${PORT}                               ║`);
  console.log(`║     API:  ${API_URL}`.padEnd(59) + '║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
});
