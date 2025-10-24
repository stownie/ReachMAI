#!/bin/bash
# GitHub Setup Commands for ReachMAI
# Replace YOUR_USERNAME with your actual GitHub username

echo "Setting up GitHub repository for ReachMAI..."

# Add your GitHub repository as remote origin
# Repository: https://github.com/stownie/ReachMAI.git
git remote add origin https://github.com/stownie/ReachMAI.git

# Rename default branch to main (GitHub standard)
git branch -M main

# Push all commits to GitHub
git push -u origin main

echo "Repository pushed to GitHub successfully!"
echo ""
echo "Next steps:"
echo "1. Go to render.com"
echo "2. Connect your GitHub account"
echo "3. Create new Static Site from your ReachMAI repository"
echo "4. Use build command: npm ci && npm run build"
echo "5. Set publish directory to: dist"
echo "6. Deploy!"