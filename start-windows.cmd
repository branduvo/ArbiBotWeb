@echo off
echo Starting Cryptocurrency Arbitrage Trading Bot...
echo.
echo Checking if dependencies are installed...
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if errorlevel 1 (
        echo Failed to install dependencies!
        pause
        exit /b 1
    )
)

echo.
echo Starting development server...
echo Visit http://localhost:5000 in your browser
echo Press Ctrl+C to stop the server
echo.

npx cross-env NODE_ENV=development tsx server/index.ts

if errorlevel 1 (
    echo.
    echo Failed to start server. Trying alternative method...
    set NODE_ENV=development
    tsx server/index.ts
)

pause