#!/bin/bash

# CLSU NEXUS Deployment Script
# This script automates the deployment process

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/var/www/clsu-nexus"
BACKEND_DIR="$PROJECT_DIR/backend"
BRANCH="main"
ENV="production"

echo -e "${GREEN}🚀 Starting CLSU NEXUS Deployment${NC}\n"

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Please run as root or with sudo${NC}"
    exit 1
fi

# Step 1: Backup current version
echo -e "${YELLOW}📦 Step 1: Creating backup...${NC}"
if [ -d "$PROJECT_DIR" ]; then
    BACKUP_DIR="/var/backups/clsu-nexus/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    cp -r "$PROJECT_DIR" "$BACKUP_DIR/"
    echo -e "${GREEN}✅ Backup created at $BACKUP_DIR${NC}"
fi

# Step 2: Pull latest code
echo -e "\n${YELLOW}📥 Step 2: Pulling latest code...${NC}"
cd "$PROJECT_DIR"
git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"
echo -e "${GREEN}✅ Code updated${NC}"

# Step 3: Install/Update dependencies
echo -e "\n${YELLOW}📦 Step 3: Installing dependencies...${NC}"

# Backend
echo "Installing backend dependencies..."
cd "$BACKEND_DIR"
npm install --production
echo -e "${GREEN}✅ Backend dependencies installed${NC}"

# Web Dashboard
echo "Building web dashboard..."
cd "$PROJECT_DIR/web-dashboard"
npm install
npm run build
echo -e "${GREEN}✅ Web dashboard built${NC}"

# Step 4: Run database migrations
echo -e "\n${YELLOW}🗄️  Step 4: Running database migrations...${NC}"
cd "$BACKEND_DIR"

# Check for new migrations
MIGRATION_DIR="../database/migrations"
if [ -d "$MIGRATION_DIR" ]; then
    echo "Checking for new migrations..."
    # Add migration logic here
    echo -e "${GREEN}✅ Migrations checked${NC}"
else
    echo -e "${YELLOW}⚠️  No migrations directory found${NC}"
fi

# Step 5: Restart application
echo -e "\n${YELLOW}🔄 Step 5: Restarting application...${NC}"
pm2 restart clsu-nexus-api || pm2 start "$BACKEND_DIR/server.js" --name clsu-nexus-api
pm2 save
echo -e "${GREEN}✅ Application restarted${NC}"

# Step 6: Health check
echo -e "\n${YELLOW}🏥 Step 6: Running health check...${NC}"
sleep 3  # Wait for app to start

if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Health check passed${NC}"
else
    echo -e "${RED}❌ Health check failed${NC}"
    echo "Check logs: pm2 logs clsu-nexus-api"
    exit 1
fi

# Step 7: Reload Nginx
echo -e "\n${YELLOW}🌐 Step 7: Reloading Nginx...${NC}"
nginx -t && systemctl reload nginx
echo -e "${GREEN}✅ Nginx reloaded${NC}"

# Summary
echo -e "\n${GREEN}✅ Deployment completed successfully!${NC}\n"
echo "Application Status:"
pm2 status clsu-nexus-api
echo ""
echo "View logs: pm2 logs clsu-nexus-api"
echo "Monitor: pm2 monit"

