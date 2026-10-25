#!/usr/bin/env bash

# Colors for terminal output
CYAN='\033[0;36m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN} Starting NebulaScout Development Stack ${NC}"
echo -e "${CYAN}========================================${NC}"
echo -e "${GREEN}Backend API:${NC}  http://127.0.0.1:8000"
echo -e "${GREEN}Frontend Web:${NC} http://localhost:3000"
echo -e "Press ${CYAN}Ctrl + C${NC} to stop both servers."
echo ""

# Ensure all child background processes are killed on exit or Ctrl+C
cleanup() {
    echo -e "\n${CYAN}Shutting down NebulaScout servers...${NC}"
    kill $(jobs -p) 2>/dev/null || true
}
trap cleanup SIGINT SIGTERM EXIT

# Start Laravel backend in the background
php backend/artisan serve &

# Start Next.js frontend in the foreground
npm --prefix frontend run dev
