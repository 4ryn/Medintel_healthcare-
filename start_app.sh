#!/bin/bash

# MedIntel Healthcare - Start All Services with tmux split panes
# This script starts both backend and frontend in tmux split panes

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
SESSION_NAME="medintel"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if tmux is installed
if ! command -v tmux &> /dev/null; then
    echo -e "${RED}❌ tmux is not installed${NC}"
    echo ""
    echo "Please install tmux first:"
    echo -e "${YELLOW}  brew install tmux${NC}"
    echo ""
    exit 1
fi

# Kill existing session if it exists
tmux kill-session -t $SESSION_NAME 2>/dev/null

# Kill any processes on the ports
echo -e "${YELLOW}🧹 Cleaning up existing processes...${NC}"
lsof -ti:8000 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null
sleep 1

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║           MedIntel Healthcare - Starting Services          ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Create a new tmux session with the backend pane
tmux new-session -d -s $SESSION_NAME -n "MedIntel" -c "$PROJECT_DIR/backend"

# Send the backend start command to the first pane
tmux send-keys -t $SESSION_NAME "echo '🚀 Starting Backend...' && source venv/bin/activate 2>/dev/null; uvicorn main:app --reload --host 0.0.0.0 --port 8000" C-m

# Split the window vertically (left/right)
tmux split-window -h -t $SESSION_NAME -c "$PROJECT_DIR/frontend"

# Send the frontend start command to the second pane
tmux send-keys -t $SESSION_NAME "echo '🚀 Starting Frontend...' && npm run dev" C-m

# Select the top pane (backend) by default
tmux select-pane -t $SESSION_NAME:0.0

# Set pane titles (requires tmux 2.6+)
tmux select-pane -t $SESSION_NAME:0.0 -T "Backend (localhost:8000)"
tmux select-pane -t $SESSION_NAME:0.1 -T "Frontend (localhost:3000)"

# Enable mouse support for easy pane switching
tmux set-option -t $SESSION_NAME mouse on

# Show status bar with useful info
tmux set-option -t $SESSION_NAME status on
tmux set-option -t $SESSION_NAME status-style "bg=blue,fg=white"
tmux set-option -t $SESSION_NAME status-left "[MedIntel] "
tmux set-option -t $SESSION_NAME status-right "App: localhost:3000 | API: localhost:8000 | Docs: localhost:8000/docs"
tmux set-option -t $SESSION_NAME status-right-length 80

echo -e "${GREEN}✅ Services starting in tmux session '${SESSION_NAME}'${NC}"
echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗"
echo "║                    Services Running                        ║"
echo "╠═══════════════════════════════════════════════════════════╣"
echo "║  🌐 App:      http://localhost:3000                       ║"
echo "║  🔌 API:      http://localhost:8000                       ║"
echo "║  📚 API Docs: http://localhost:8000/docs                  ║"
echo "╠═══════════════════════════════════════════════════════════╣"
echo "║  tmux commands:                                           ║"
echo "║    Switch panes:  Ctrl+B then Arrow Keys (or click)       ║"
echo "║    Detach:        Ctrl+B then D                           ║"
echo "║    Reattach:      tmux attach -t medintel                 ║"
echo "║    Kill session:  tmux kill-session -t medintel           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Attach to the tmux session
tmux attach-session -t $SESSION_NAME
