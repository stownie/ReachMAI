# ReachMAI - Render Deployment Configuration

## Render Settings

When setting up on Render, use these configurations:

### Static Site Settings:
- **Build Command**: `npm ci && npm run build`
- **Publish Directory**: `dist`
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

## Build Process:
1. Render will automatically detect this as a Node.js project
2. It will run `npm ci` to install dependencies
3. Then run `npm run build` to create the production build
4. Finally serve the static files from the `dist` directory

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