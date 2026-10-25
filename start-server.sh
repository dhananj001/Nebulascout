#!/usr/bin/env bash

# Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP="127.0.0.1"
fi

echo -e "${CYAN}====================================================${NC}"
echo -e "${CYAN}  NebulaScout — 24/7 Background Wi-Fi Server Mode  ${NC}"
echo -e "${CYAN}====================================================${NC}"
echo -e "${YELLOW}Mode:${NC} Production (Optimized, Low RAM, Background Daemon)"
echo -e "${GREEN}Open on this PC:${NC}     http://localhost:3000"
echo -e "${GREEN}Open on any Phone/PC:${NC} http://${LOCAL_IP}:3000"
echo ""

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Ensure production bundle is built
if [ ! -d "$ROOT_DIR/frontend/.next" ]; then
    echo -e "${CYAN}Building frontend for production...${NC}"
    cd "$ROOT_DIR/frontend" && npm run build
fi

# Kill any existing instances
pkill -f "artisan serve" 2>/dev/null || true
pkill -f "next-server" 2>/dev/null || true
pkill -f "next start" 2>/dev/null || true

# Start Laravel backend on 0.0.0.0 in background
nohup php "$ROOT_DIR/backend/artisan" serve --host=0.0.0.0 --port=8000 > "$ROOT_DIR/backend.log" 2>&1 &
BACKEND_PID=$!

# Start Next.js on 0.0.0.0 in background
cd "$ROOT_DIR/frontend"
nohup npm start -- -H 0.0.0.0 -p 3000 > "$ROOT_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!

echo -e "${GREEN}✓ NebulaScout is running continuously in the background!${NC}"
echo -e "Backend PID:  $BACKEND_PID"
echo -e "Frontend PID: $FRONTEND_PID"
echo -e "Logs: ${ROOT_DIR}/backend.log & frontend.log"
echo ""
echo -e "To stop the background server anytime, run: ${YELLOW}./stop-server.sh${NC}"
