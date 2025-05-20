@echo off
echo ===== VKUCOIN Project Local Setup =====

REM Check for required tools
echo Checking prerequisites...

REM Check for Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Node.js is not installed. Please install Node.js from https://nodejs.org/
    exit /b 1
)
echo Node.js is installed.

REM Check for .NET SDK
where dotnet >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo .NET SDK is not installed. Please install .NET 9.0 SDK from https://dotnet.microsoft.com/download
    exit /b 1
)
echo .NET SDK is installed.

REM Check for SQL Server LocalDB
sqlcmd -? >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo SQL Server tools not found. Please install SQL Server Express LocalDB from https://www.microsoft.com/en-us/sql-server/sql-server-downloads
    echo After installation, you may need to restart this script.
    pause
)

REM Install dependencies for the main project
echo Installing project dependencies...
call npm install

REM Setup and run smart contract
echo Setting up smart contract...
cd smartContract
call npm install

REM Start Hardhat node in background
echo Starting local blockchain node...
start cmd /k npx hardhat node

REM Wait for Hardhat node to start
timeout /t 5 /nobreak

REM Deploy contracts to local blockchain
echo Deploying smart contracts...
start cmd /k npx hardhat run scripts/deploy.ts --network localhost
cd ..

REM Setup and run backend
echo Setting up backend...
cd backend

REM Create or update local SQL database
echo Setting up database...
sqlcmd -S "(LocalDB)\MSSQLLocalDB" -Q "IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'BlockchainVku') CREATE DATABASE BlockchainVku"

REM Create or update appsettings.Development.json with local connection string
echo Creating local environment settings...
echo {> appsettings.Development.json
echo   "Logging": {>> appsettings.Development.json
echo     "LogLevel": {>> appsettings.Development.json
echo       "Default": "Information",>> appsettings.Development.json
echo       "Microsoft.AspNetCore": "Warning">> appsettings.Development.json
echo     }>> appsettings.Development.json
echo   },>> appsettings.Development.json
echo   "ConnectionStrings": {>> appsettings.Development.json
echo     "DefaultConnection": "Server=(LocalDB)\MSSQLLocalDB;Database=BlockchainVku;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true">> appsettings.Development.json
echo   },>> appsettings.Development.json
echo   "JWT": {>> appsettings.Development.json
echo     "Secret": "wbj2ojn2j3j23b4j234kb23kb4kj23bj43bj423bjk4b23j4b3k2j23b234234j23n4l23nl423nll2l4lk23",>> appsettings.Development.json
echo     "ValidIssuer": "http://localhost:5000",>> appsettings.Development.json
echo     "ValidAudience": "http://localhost:5000">> appsettings.Development.json
echo   }>> appsettings.Development.json
echo }>> appsettings.Development.json

REM Build and run backend
echo Building and running backend...
dotnet build
start cmd /k dotnet run --environment Development --urls=http://localhost:5000
cd ..

REM Setup and run frontend
echo Setting up frontend...
cd frontend
call npm install
echo Starting frontend...
start cmd /k npm run dev
cd ..

echo ===== Setup complete! =====
echo Frontend is running at http://localhost:3000
echo Backend API is running at http://localhost:5000
echo Local blockchain is running on http://127.0.0.1:8545

echo NOTE: The backend is configured to use a local SQL Server LocalDB instance.
echo If you need to use a different SQL Server instance, please update the connection string in backend/appsettings.Development.json 