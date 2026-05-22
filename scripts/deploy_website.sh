#!/bin/bash
set -e

echo "=== MedPup Website Deployment to GitHub Pages ==="

# Change to the website directory
cd /c/Users/camer/DEVNEW/AnimalAid/website

# Build the site
echo "Building website with Hugo..."
hugo --minify

# Check if the public directory exists
if [ ! -d "public" ]; then
  echo "Error: public directory not found after Hugo build"
  exit 1
fi

# Change to the public directory
cd public

# Initialize git if not already a git repository
if [ ! -d ".git" ]; then
  echo "Initializing git repository in public/"
  git init
  # Add the remote (assuming the main repo is the origin)
  # We assume the main repo is at /c/Users/camer/DEVNEW/AnimalAid
  git remote add origin /c/Users/camer/DEVNEW/AnimalAid
fi

# Configure git user if not set (use the global config or set to a default)
if [ -z "$(git config user.name)" ]; then
  echo "Setting git user.name to 'MedPup Bot'"
  git config user.name "MedPup Bot"
fi
if [ -z "$(git config user.email)" ]; then
  echo "Setting git user.email to 'medpup@example.com'"
  git config user.email "medpup@example.com"
fi

# Add all files
echo "Adding files to git..."
git add .

# Check if there are changes to commit
if ! git diff-index --quiet HEAD --; then
  # Commit the changes
  echo "Committing changes..."
  git commit -m "Deploy website: $(date '+%Y-%m-%d %H:%M:%S')"
else
  echo "No changes to commit."
fi

# Push to the gh-pages branch
echo "Pushing to gh-pages branch..."
# If the gh-pages branch doesn't exist, this will create it from the current commit
git push --force origin HEAD:gh-pages

echo "Deployment complete!"
echo "Your site should be available at: https://<username>.github.io/<repo>/ (if using project pages)"
echo "or https://<username>.github.io/ (if using user/organization pages)"