#!/bin/bash

echo "🚀 Starting TourVoyage deployment..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login to Railway (if not already logged in)
echo "🔐 Checking Railway authentication..."
railway status || railway login

# Create new project or use existing
echo "📦 Setting up Railway project..."
railway init

# Add PostgreSQL plugin
echo "🗄️  Adding PostgreSQL database..."
railway add postgresql

# Set environment variables
echo "⚙️  Setting environment variables..."
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=$(openssl rand -base64 32)
railway variables set FRONTEND_URL=https://$(railway domain).railway.app

# Deploy application
echo "🌐 Deploying to Railway..."
railway up

echo "✅ Deployment completed!"
echo "📱 Your application is now live at: https://$(railway domain).railway.app"
