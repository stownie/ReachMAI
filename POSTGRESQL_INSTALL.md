# PostgreSQL Client Installation Guide

## Option 1: Install PostgreSQL with Client Tools (Complete)

### Windows (Recommended)
1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer and include "pgAdmin 4" and "Command Line Tools"
3. Add PostgreSQL bin directory to PATH: `C:\Program Files\PostgreSQL\16\bin`

### Using Chocolatey (if you have it)
```powershell
choco install postgresql
```

### Using Scoop (if you have it)  
```powershell
scoop install postgresql
```

## Option 2: Install Only psql Client (Lightweight)

### Using npm (Node.js package)
```bash
npm install -g pg-cli
```

## Option 3: Use Docker (if you have Docker)
```bash
docker run -it --rm postgres:16 psql postgresql://user:pass@host:port/db
```

## After Installation

Restart your terminal/PowerShell and test:
```bash
psql --version
```

## Connection Commands

Once psql is installed, you can connect using:

### Method 1: Connection String
```bash
psql "postgresql://username:password@hostname:port/database"
```

### Method 2: Individual Parameters
```bash
psql -h hostname -p port -U username -d database
```

### Method 3: Using Environment Variables
Set DATABASE_URL in your .env file, then:
```bash
psql $env:DATABASE_URL
```