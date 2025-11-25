#!/bin/bash
# Start both backend and frontend
export EXPO_PACKAGER_PROXY_URL=https://$REPLIT_DEV_DOMAIN
export REACT_NATIVE_PACKAGER_HOSTNAME=$REPLIT_DEV_DOMAIN

# Start backend in background on port 8000
echo "Starting FastAPI backend on port 8000..."
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend (this will run in foreground)
echo "Starting Expo frontend..."
npm run dev

# Clean up on exit
trap "kill $BACKEND_PID" EXIT
