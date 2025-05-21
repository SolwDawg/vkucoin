
# VKU Coin

A blockchain-based reward system for VKU (Van Lang University) students built on Ethereum technology. This project includes a custom ERC20 token smart contract, a .NET backend API, and a Next.js frontend application.

## 📋 Project Description

VKU Coin is a digital token system designed to reward students for their academic achievements and participation in university activities. The platform allows administrators to distribute tokens to students, which can be viewed and managed through a user-friendly web interface.

## ✨ Features

- **Custom ERC20 Token**: VKU Coin implemented as an Ethereum-compatible token
- **Wallet Integration**: Connect and manage Ethereum wallets
- **Real-time Balance Updates**: View token balances with real-time updates
- **Admin Dashboard**: Administrative tools for token distribution
- **Student Rewards**: Issue tokens to students based on academic performance or participation
- **Secure Authentication**: JWT-based authentication system
- **Responsive UI**: Mobile-friendly web interface built with modern technologies

## 🛠️ Technologies Used

### Smart Contract

- Solidity
- Hardhat
- OpenZeppelin Contracts
- Ethereum

### Backend

- .NET 9.0
- Entity Framework Core
- SQL Server
- JWT Authentication
- Nethereum (for blockchain integration)
- ASP.NET Core Web API

### Frontend

- Next.js 15
- React 19
- TailwindCSS
- Web3Modal
- Wagmi (Ethereum hooks)
- React Query

## 🚀 Setup Instructions

### Prerequisites

- Node.js (v18 or later)
- .NET 9.0 SDK
- SQL Server (LocalDB or Express edition for development)
- Git

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/your-username/vkucoin.git
   cd vkucoin
   ```

2. Automated Setup (Windows)
   ```bash
   run-local.bat
   ```
   This will set up all components and start the application.

### Manual Setup

If you prefer to set up components manually, or are using a non-Windows system:

1. **Smart Contract Setup**

   ```bash
   cd smartContract
   npm install
   npx hardhat node
   npx hardhat run scripts/deploy.ts --network localhost
   ```

2. **Backend Setup**

   ```bash
   cd backend
   # Configure your connection string in appsettings.Development.json
   dotnet build
   dotnet run --environment Development --urls=http://localhost:5000
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## ⚙️ Environment Configuration

### Backend Configuration

Create or update the `appsettings.Development.json` file in the backend directory:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "ConnectionStrings": {
    "DefaultConnection": "Server=(LocalDB)\\MSSQLLocalDB;Database=BlockchainVku;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true"
  },
  "JWT": {
    "Secret": "your-secret-key-here",
    "ValidIssuer": "http://localhost:5000",
    "ValidAudience": "http://localhost:5000"
  }
}
```

## 📝 Usage

### For Students

1. Connect your Ethereum wallet to the application
2. View your VKU Coin balance
3. Track your reward history

### For Administrators

1. Access the admin dashboard
2. Search for students by ID or wallet address
3. Allocate VKU Coins to students based on achievements
4. Monitor token distribution history

## 🌐 API Documentation

API documentation is available at `http://localhost:5000/swagger` when running the backend locally.

## 🗂️ Project Structure

```
vkucoin/
├── frontend/            # Next.js web application
├── backend/             # .NET API server
├── smartContract/       # Solidity smart contracts
└── run-local.bat        # Automated setup script
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Submit a pull request