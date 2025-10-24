# Render Build Script for ReachMAI

# Install dependencies
npm ci

# Build the production version
npm run build

# Serve the built files (Render will use the dist folder)
echo "Build completed successfully!"
echo "Static files ready in dist/ directory"