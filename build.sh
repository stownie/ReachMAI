#!/bin/bash
set -e

echo "🚀 Starting ReachMAI build process..."

# Check environment
echo "📍 Node.js version: $(node --version)"
echo "📍 npm version: $(npm --version)"
echo "📍 Current directory: $(pwd)"
echo "📁 Directory contents before build:"
ls -la || dir

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

echo "📦 Dependencies installed. Checking for build tools..."
npx tsc --version || echo "TypeScript not found"
npx vite --version || echo "Vite not found"

# Build the application
echo "🔨 Building application..."
echo "Running: tsc -b"
npx tsc -b

echo "Running: vite build"
npx vite build

echo "✅ Build completed!"
echo "📁 Checking for build artifacts..."

# Check current directory for dist
if [ -d "dist" ]; then
    echo "✅ Found dist directory in current location"
    echo "📂 Contents of dist directory:"
    ls -la dist/
    echo "📏 Size of key files:"
    du -h dist/* 2>/dev/null || echo "Could not measure file sizes"
else
    echo "❌ dist directory not found in current location"
    echo "🔍 Searching for dist directory..."
    find . -name "dist" -type d 2>/dev/null || echo "No dist directory found anywhere"
    echo "📁 Current directory contents:"
    ls -la
    exit 1
fi

echo "🎉 Build process completed successfully!"