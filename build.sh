#!/bin/bash
set -e

echo "🚀 Starting ReachMAI build process..."

# Check Node.js version
echo "📍 Node.js version: $(node --version)"
echo "📍 npm version: $(npm --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the application
echo "🔨 Building application..."
npm run build

echo "✅ Build completed successfully!"
echo "📁 Build artifacts created in dist/ directory"

# List the contents of dist to verify
if [ -d "dist" ]; then
    echo "📂 Contents of dist directory:"
    ls -la dist/
else
    echo "❌ ERROR: dist directory not found after build!"
    exit 1
fi