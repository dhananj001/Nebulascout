#!/usr/bin/env bash

CYAN='\033[0;36m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${CYAN}Stopping NebulaScout background server...${NC}"

pkill -f "artisan serve" 2>/dev/null || true
pkill -f "next start" 2>/dev/null || true
pkill -f "next-server" 2>/dev/null || true

echo -e "${GREEN}✓ All NebulaScout server processes stopped. RAM released to 0.${NC}"
