#!/bin/bash

# Demo Setup Script for Q-Tech
# This script sets up the system with demo data for portfolio showcase

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🎬 Setting up Q-Tech Demo Environment${NC}\n"

# Check if .env exists
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠️  Creating .env file from template...${NC}"
    cp backend/.env.example backend/.env 2>/dev/null || echo "NODE_ENV=development\nPORT=3000" > backend/.env
    echo -e "${GREEN}✅ .env file created${NC}"
    echo -e "${YELLOW}⚠️  Please configure database credentials in backend/.env${NC}"
fi

# Load environment variables
export $(cat backend/.env | grep -v '^#' | xargs)

# Check database connection
echo -e "\n${YELLOW}📊 Checking database connection...${NC}"
cd backend
node -e "
const {query} = require('./config/database');
query('SELECT NOW()').then(() => {
  console.log('✅ Database connected');
  process.exit(0);
}).catch(e => {
  console.error('❌ Database connection failed:', e.message);
  console.error('Please check your database configuration in .env');
  process.exit(1);
});
"

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Database connection failed. Please configure database first.${NC}"
    exit 1
fi

# Run migrations
echo -e "\n${YELLOW}🗄️  Running database migrations...${NC}"
for migration in ../database/migrations/*.sql; do
    if [ -f "$migration" ]; then
        echo "Running $(basename $migration)..."
        psql -U "${DB_USER:-postgres}" -d "${DB_NAME:-clsu_nexus}" -f "$migration" 2>/dev/null || echo "Migration may have already been run"
    fi
done

# Seed demo data
echo -e "\n${YELLOW}🌱 Seeding demo data...${NC}"
psql -U "${DB_USER:-postgres}" -d "${DB_NAME:-clsu_nexus}" -f ../database/seeds/demo-data.sql

echo -e "\n${GREEN}✅ Demo setup completed!${NC}\n"
echo -e "Demo credentials are available in: database/seeds/demo-credentials.md"
echo -e "\nYou can now start the server:"
echo -e "  cd backend && npm run dev"
echo -e "\nDefault demo password for all accounts: demo123"

