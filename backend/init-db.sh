#!/bin/bash
set -e

# Wait for SQL Server to be available
until /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -Q "SELECT 1" &> /dev/null
do
  echo "Waiting for SQL Server to start..."
  sleep 2
done

echo "SQL Server started, creating database if it doesn't exist..."
/opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -Q "IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'BlockchainVku') CREATE DATABASE BlockchainVku"
echo "Database setup completed." 