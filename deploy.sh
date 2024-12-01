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

# Set up Nginx to proxy requests on port 80 to port 3000
echo "Configuring Nginx..."
sudo rm -f /etc/nginx/sites-enabled/default
echo "
server {
    listen 80;
    server_name gatorsecurity.org;  # Replace with your actual domain or IP address
    
    location / {
        proxy_pass http://localhost:3000;  # Forward traffic to port 3000 where React is running
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
" | sudo tee /etc/nginx/sites-available/default

# Restart Nginx to apply the changes
echo "Restarting Nginx..."
sudo systemctl restart nginx

# Check if frontend and backend are running
echo "Checking if services are responding..."
if ! curl -s http://localhost:80 >/dev/null; then
  echo "Error: Frontend is not responding on port 80."
  exit 1
fi

if ! curl -s http://localhost:5000 >/dev/null; then
  echo "Error: Backend is not responding on port 5000."
  exit 1
fi

echo "Services are running successfully."
