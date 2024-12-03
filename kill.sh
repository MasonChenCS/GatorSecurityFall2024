#!/bin/bash

# Stop on any error
set -e

# Kill Node.js process on port 3000
echo "Checking for Node process on port 3000..."
PID_3000=$(lsof -t -i:3000 -sTCP:LISTEN -a -c node)
if [ -n "$PID_3000" ]; then
  echo "Killing Node process $PID_3000 on port 3000..."
  kill -9 $PID_3000
else
  echo "No Node process found on port 3000."
fi

# Kill Node.js process on port 5000
echo "Checking for Node process on port 5000..."
PID_5000=$(lsof -t -i:5000 -sTCP:LISTEN -a -c node)
if [ -n "$PID_5000" ]; then
  echo "Killing Node process $PID_5000 on port 5000..."
  kill -9 $PID_5000
else
  echo "No Node process found on port 5000."
fi

echo "Kill script completed."
