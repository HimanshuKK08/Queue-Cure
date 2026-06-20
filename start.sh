#!/bin/bash
# Queue Cure – start both server and client

echo "🏥  Queue Cure – Starting up..."
echo ""

# Start server in background
echo "Starting backend server on port 3001..."
cd server && npm install --silent && node index.js &
SERVER_PID=$!

sleep 2

# Start client
echo "Starting React app on port 3000..."
cd ../client && npm install --silent && npm start

# If client exits, kill server too
kill $SERVER_PID
