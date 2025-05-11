#!/bin/bash

# Script to start MCP servers in WSL2 environment

# Set error handling
set -e

# Function to start a Node.js MCP server
start_node_server() {
  local script=$1
  local port=${2:-3000}
  
  echo "Starting $script on port $port..."
  node $script &
  sleep 2
  echo "$script started with PID $!"
}

# Function to start a Python MCP server
start_python_server() {
  local script=$1
  local port=${2:-8000}
  
  echo "Starting $script on port $port..."
  python $script &
  sleep 2
  echo "$script started with PID $!"
}

# Create necessary directories for logs
mkdir -p logs

echo "Starting MCP servers..."

# Start Node.js servers on different ports
start_node_server server.js 3000
start_node_server simple-mcp-server.js 3001
start_node_server smithery-mcp-server.js 3002
start_node_server basic-mcp-server.js 3003
start_node_server jsonrpc-mcp-server.js 3004

# Start Python-based MCP server if available
if [ -f "server.py" ]; then
  start_python_server server.py 8000
fi

echo "All MCP servers started!"
echo "Access them at the following URLs:"
echo "- http://localhost:3000/mcp"
echo "- http://localhost:3001/mcp"
echo "- http://localhost:3002/mcp"
echo "- http://localhost:3003/mcp"
echo "- http://localhost:3004/mcp"
if [ -f "server.py" ]; then
  echo "- http://localhost:8000/mcp"
fi

echo ""
echo "To stop all servers, run: pkill -f 'node|python'"

# Keep script running to maintain server processes
echo "Press Ctrl+C to stop all servers"
wait