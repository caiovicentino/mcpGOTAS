#!/bin/bash

# Simple script to start a single MCP server
# Usage: ./start.sh [server_script] [port]

SERVER_SCRIPT=${1:-"server.js"}
PORT=${2:-3000}

export NODE_ENV=development
export PORT=$PORT

echo "Starting $SERVER_SCRIPT on port $PORT..."

# Start the server in foreground
node $SERVER_SCRIPT