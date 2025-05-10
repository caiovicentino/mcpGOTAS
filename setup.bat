@echo off
echo Installing Gotas Commerce MCP Server dependencies...
pip install -r requirements.txt

echo.
echo Setup complete! You can now run the server using one of these commands:
echo.
echo - Using FastAPI:
echo   uvicorn src.gotas_mcp_server:app --reload --host 0.0.0.0 --port 8000
echo.
echo - Using MCP CLI:
echo   mcp run src.gotas_mcp_server.py --transport streamable-http --host 0.0.0.0 --port 8000
echo.
echo - Install in Claude Desktop:
echo   mcp install src.gotas_mcp_server.py
echo.
echo To test the client:
echo   python test_client.py
echo.
pause
