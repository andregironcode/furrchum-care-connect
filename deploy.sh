#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting deployment process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

echo "✅ Build completed successfully!"
echo "
📝 Deployment checklist:"
echo "1. Ensure all environment variables are set in Vercel"
echo "2. Verify database connections"
echo "3. Test all critical user flows"
echo "4. Check error tracking setup"

echo "
🚀 Ready to deploy to Vercel!"
