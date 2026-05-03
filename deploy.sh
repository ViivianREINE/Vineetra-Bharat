#!/bin/bash

# Vineetra Elite Deployment Script
# This script helps deploy both backend and frontend to production

set -e

echo "🚀 Vineetra Elite Deployment Script"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if required tools are installed
check_dependencies() {
    echo -e "${YELLOW}Checking dependencies...${NC}"

    if ! command -v node &> /dev/null; then
        echo -e "${RED}Node.js is not installed. Please install Node.js 20+ first.${NC}"
        exit 1
    fi

    if ! command -v npm &> /dev/null; then
        echo -e "${RED}npm is not installed. Please install npm first.${NC}"
        exit 1
    fi

    if ! command -v git &> /dev/null; then
        echo -e "${RED}Git is not installed. Please install Git first.${NC}"
        exit 1
    fi

    echo -e "${GREEN}✓ All dependencies are installed${NC}"
}

# Check if .env files exist
check_env_files() {
    echo -e "${YELLOW}Checking environment files...${NC}"

    if [ ! -f "backend/.env" ]; then
        echo -e "${RED}backend/.env not found. Please copy backend/.env.example to backend/.env and fill in your API keys.${NC}"
        exit 1
    fi

    echo -e "${GREEN}✓ Environment files are configured${NC}"
}

# Test backend
test_backend() {
    echo -e "${YELLOW}Testing backend...${NC}"

    cd backend
    npm install

    # Basic syntax check
    node -c src/server.js

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Backend syntax is valid${NC}"
    else
        echo -e "${RED}✗ Backend has syntax errors${NC}"
        exit 1
    fi

    cd ..
}

# Test frontend
test_frontend() {
    echo -e "${YELLOW}Testing frontend...${NC}"

    cd frontend
    npm install
    npm run build

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Frontend builds successfully${NC}"
    else
        echo -e "${RED}✗ Frontend build failed${NC}"
        exit 1
    fi

    cd ..
}

# Deploy to GitHub
deploy_github() {
    echo -e "${YELLOW}Deploying to GitHub...${NC}"

    # Check if git is initialized
    if [ ! -d ".git" ]; then
        echo -e "${RED}Git repository not initialized. Please run 'git init' first.${NC}"
        exit 1
    fi

    # Check if remote is set
    if ! git remote get-url origin &> /dev/null; then
        echo -e "${RED}Git remote 'origin' not set. Please set it with 'git remote add origin <url>'${NC}"
        exit 1
    fi

    # Add all files
    git add .

    # Commit changes
    git commit -m "Deploy: Update Vineetra Elite $(date)" || true

    # Push to main branch
    git push origin main || git push origin master

    echo -e "${GREEN}✓ Code pushed to GitHub${NC}"
}

# Show deployment URLs
show_urls() {
    echo -e "${GREEN}Deployment completed!${NC}"
    echo ""
    echo "🌐 Frontend (Vercel): Check your Vercel dashboard for the URL"
    echo "🔧 Backend (Render): Check your Render dashboard for the URL"
    echo ""
    echo "📖 Deployment Guide: deployment/DEPLOYMENT_GUIDE.md"
}

# Main deployment flow
main() {
    check_dependencies
    check_env_files
    test_backend
    test_frontend
    deploy_github
    show_urls

    echo ""
    echo -e "${GREEN}🎉 Deployment preparation complete!${NC}"
    echo "Your services should auto-deploy via GitHub Actions."
    echo "Monitor the deployment status in your Render and Vercel dashboards."
}

# Run main function
main "$@"