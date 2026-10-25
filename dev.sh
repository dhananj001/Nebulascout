#!/usr/bin/env bash

# Colors for terminal output
CYAN='\033[0;36m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP="127.0.0.1"
fi

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN} Starting NebulaScout Development Stack ${NC}"
echo -e "${CYAN}========================================${NC}"
echo -e "${GREEN}Local System:${NC} http://localhost:3000"
echo -e "${GREEN}Wi-Fi LAN URL:${NC} http://${LOCAL_IP}:3000"
echo -e "Any device on your Wi-Fi (phone, laptop, iPad) can open the Wi-Fi URL!"
echo -e "Press ${CYAN}Ctrl + C${NC} to stop both servers."
echo ""

# Free ports 8000 and 3000 if previous/stale instances are still clinging to them
fuser -k 8000/tcp 2>/dev/null || true
fuser -k 3000/tcp 2>/dev/null || true

# Ensure all child background processes are killed on exit or Ctrl+C
cleanup() {
    echo -e "\n${CYAN}Shutting down NebulaScout servers...${NC}"
    kill $(jobs -p) 2>/dev/null || true
    fuser -k 8000/tcp 2>/dev/null || true
    fuser -k 3000/tcp 2>/dev/null || true
}
trap cleanup SIGINT SIGTERM EXIT

# Start Laravel backend bound to all network interfaces (0.0.0.0)
php backend/artisan serve --host=0.0.0.0 --port=8000 &

# Start Next.js frontend bound to all network interfaces (0.0.0.0)
npm --prefix frontend run dev -- -H 0.0.0.0
