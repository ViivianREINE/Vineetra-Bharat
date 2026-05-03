@echo off
REM Vineetra Elite Deployment Script for Windows
REM This script helps deploy both backend and frontend to production

echo 🚀 Vineetra Elite Deployment Script
echo ==================================

REM Colors for output (Windows CMD doesn't support ANSI colors well, so we'll use plain text)

echo Checking dependencies...

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed. Please install Node.js 20+ first.
    pause
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed. Please install npm first.
    pause
    exit /b 1
)

where git >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Git is not installed. Please install Git first.
    pause
    exit /b 1
)

echo ✓ All dependencies are installed

echo Checking environment files...

if not exist "backend\.env" (
    echo ERROR: backend\.env not found. Please copy backend\.env.example to backend\.env and fill in your API keys.
    pause
    exit /b 1
)

echo ✓ Environment files are configured

echo Testing backend...

cd backend
call npm install

REM Basic syntax check
node -c src\server.js
if %errorlevel% neq 0 (
    echo ✗ Backend has syntax errors
    cd ..
    pause
    exit /b 1
)

echo ✓ Backend syntax is valid
cd ..

echo Testing frontend...

cd frontend
call npm install
call npm run build

if %errorlevel% neq 0 (
    echo ✗ Frontend build failed
    cd ..
    pause
    exit /b 1
)

echo ✓ Frontend builds successfully
cd ..

echo Deploying to GitHub...

REM Check if git is initialized
if not exist ".git" (
    echo ERROR: Git repository not initialized. Please run 'git init' first.
    pause
    exit /b 1
)

REM Check if remote is set
git remote get-url origin >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Git remote 'origin' not set. Please set it with 'git remote add origin ^<url^>'
    pause
    exit /b 1
)

REM Add all files
git add .

REM Commit changes
git commit -m "Deploy: Update Vineetra Elite %date%" 2>nul || echo No changes to commit

REM Push to main branch
git push origin main 2>nul || git push origin master 2>nul

if %errorlevel% neq 0 (
    echo ERROR: Failed to push to GitHub
    pause
    exit /b 1
)

echo ✓ Code pushed to GitHub

echo.
echo Deployment completed!
echo.
echo 🌐 Frontend (Vercel): Check your Vercel dashboard for the URL
echo 🔧 Backend (Render): Check your Render dashboard for the URL
echo.
echo 📖 Deployment Guide: deployment\DEPLOYMENT_GUIDE.md
echo.
echo 🎉 Deployment preparation complete!
echo Your services should auto-deploy via GitHub Actions.
echo Monitor the deployment status in your Render and Vercel dashboards.

pause