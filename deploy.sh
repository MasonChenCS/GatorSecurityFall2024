#!/bin/bash

# Stop on any error
set -e

# Check for port availability
if lsof -i:3000 >/dev/null; then
  echo "Error: Port 3000 is already in use. Exiting."
  exit 1
fi

if lsof -i:5000 >/dev/null; then
  echo "Error: Port 5000 is already in use. Exiting."
  exit 1
fi

# Start the frontend React app
echo "Starting the React app..."
(cd senior_project_dea-main && serve -s build --listen 3000 --no-clipboard > frontend.log 2>&1) &

# Wait for a second to avoid race conditions
sleep 1

# Set the environment to production and start the backend server
echo "Starting the backend server..."
(cd senior_project_dea-main/server && NODE_ENV=production npm start > backend.log 2>&1) &

# Wait for services to start
echo "Waiting for services to start..."
sleep 5
if ! curl -s http://localhost:3000 >/dev/null; then
  echo "Error: Frontend is not responding on port 3000."
  exit 1
fi

if ! curl -s http://localhost:5000 >/dev/null; then
  echo "Error: Backend is not responding on port 5000."
  exit 1
fi

echo "Services are running successfully."
