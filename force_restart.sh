#!/bin/bash
echo "Stopping existing server on port 5000..."
lsof -t -i:5000 | xargs kill -9 2>/dev/null || true
echo "Server stopped."
sleep 2
echo "Starting server..."
# We use nohup to ensure it keeps running
nohup npm run dev > server.log 2>&1 &
echo "Server started in background. PID: $!"
