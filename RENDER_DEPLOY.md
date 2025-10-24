# ReachMAI - Render Deployment Configuration

## Render Settings

When setting up on Render, use these configurations:

### Web Service Settings:
- **Build Command**: `npm ci && npm run build`
- **Start Command**: `npm start`
- **Node Version**: `18` (or latest LTS)
- **Port**: `3000` (or auto-detect from environment)

### Alternative: Static Site (Frontend Only - Current Setup):
- **Build Command**: `npm ci && npm run build`
- **Publish Directory**: `dist`
- **Start Command**: Leave empty (not needed for static sites)
- **Node Version**: `18` (or latest LTS)

### Environment Variables:
```
NODE_ENV=production
```

### Custom Headers (Optional):
For better PWA support, add these headers in Render:
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
```

### Redirects:
For SPA routing, add this redirect rule:
```
/*  /index.html  200
```

## Deployment Options:

### Option 1: Web Service (Recommended for Full Platform)
**Use this for:** Student enrollment, admin controls, scheduling, payments, user management

1. Create **Web Service** on Render
2. Build Command: `npm ci && npm run build`
3. Start Command: `npm start`
4. The Express server will serve the built React app and handle all routes

### Option 2: Static Site (Frontend Demo Only)
**Use this for:** Showcasing UI/UX, testing mobile features, demonstrations

1. Create **Static Site** on Render  
2. Build Command: `npm ci && npm run build`
3. Publish Directory: `dist`

## Build Process (Web Service):
1. Render detects this as a Node.js project
2. Runs `npm ci` to install dependencies (including Express)
3. Runs `npm run build` to create the production React build  
4. Runs `npm start` to launch the Express server
5. Express serves the React app and handles all routing

## Performance:
- Built bundle size: ~720KB (minified + gzipped: ~198KB)
- Optimized for mobile-first experience
- Progressive Web App capabilities included

## Features Available:
✅ Mobile-responsive design
✅ Real-time notifications (WebSocket simulation)
✅ Offline-first architecture
✅ Progressive Web App
✅ Multi-user profiles
✅ Mobile check-in system