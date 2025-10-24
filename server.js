import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Check if dist directory exists
const distPath = join(__dirname, 'dist');
if (!existsSync(distPath)) {
  console.error('❌ Error: dist directory not found!');
  console.error('Make sure to run "npm run build" before starting the server.');
  process.exit(1);
}

// Serve static files from the dist directory
app.use(express.static(distPath));

// Handle SPA routing - send all requests to index.html
app.get('*', (req, res) => {
  res.sendFile(join(distPath, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 ReachMAI server running on port ${port}`);
  console.log(`📁 Serving from: ${distPath}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});