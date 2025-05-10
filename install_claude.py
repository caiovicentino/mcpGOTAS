"""
Installs the Gotas Commerce MCP server in Claude Desktop.

This script automatically installs the MCP server in Claude Desktop,
making it available for use with the Claude AI assistant.
"""

import subprocess
import os
import sys

def install_in_claude():
    """Install the MCP server in Claude Desktop."""
    print("Installing Gotas Commerce MCP server in Claude Desktop...")
    
    try:
        # Make sure dependencies are installed
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], check=True)
        
        # Install the MCP server in Claude Desktop
        subprocess.run([
            sys.executable, "-m", "mcp", "install", 
            os.path.join("src", "gotas_mcp_server.py"),
            "--name", "Gotas Commerce",
            "-f", ".env"
        ], check=True)
        
        print("\nSuccessfully installed Gotas Commerce MCP server in Claude Desktop!")
        print("You can now use it in your conversations with Claude.")
        
    except subprocess.CalledProcessError as e:
        print(f"\nError during installation: {e}")
        sys.exit(1)

if __name__ == "__main__":
    install_in_claude()
