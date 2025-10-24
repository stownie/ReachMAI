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
console.log(`🔍 Looking for dist directory at: ${distPath}`);
console.log(`📁 Current working directory: ${process.cwd()}`);
console.log(`📂 Directory contents:`, existsSync(__dirname) ? require('fs').readdirSync(__dirname).slice(0, 10) : 'Directory not accessible');

if (!existsSync(distPath)) {
  console.error('❌ Error: dist directory not found!');
  console.error(`Expected location: ${distPath}`);
  console.error('This usually means the build step failed or the dist folder is in a different location.');
  console.error('Trying to find dist directory in current working directory...');
  
  const cwdDistPath = join(process.cwd(), 'dist');
  if (existsSync(cwdDistPath)) {
    console.log(`✅ Found dist directory at: ${cwdDistPath}`);
    console.log('Using dist directory from current working directory instead.');
    // Continue with the working path
  } else {
    console.error('❌ dist directory not found in current working directory either.');
    console.error('Make sure the build step completed successfully.');
    process.exit(1);
  }
}

// Determine the correct dist path
let finalDistPath = distPath;
if (!existsSync(distPath)) {
  const cwdDistPath = join(process.cwd(), 'dist');
  if (existsSync(cwdDistPath)) {
    finalDistPath = cwdDistPath;
  }
}

// Serve static files from the dist directory
app.use(express.static(finalDistPath));

// Handle SPA routing - send all requests to index.html
app.get('*', (req, res) => {
  res.sendFile(join(finalDistPath, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 ReachMAI server running on port ${port}`);
  console.log(`📁 Serving from: ${finalDistPath}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});