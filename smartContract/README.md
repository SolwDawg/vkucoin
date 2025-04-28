# VKU Token Smart Contract

This repository contains the VKU token, an ERC-20 compliant token with minting and burning capabilities.

## Contract Features

- Standard ERC-20 implementation with all required functions
- Minting capability (restricted to owner)
- Burning capability
- 1 million initial token supply

## Prerequisites

- Node.js (>=16.0.0)
- npm or yarn

## Setup

1. Install dependencies:

```bash
npm install
```

## Compile Contracts

```bash
npx hardhat compile
```

This will generate the TypeScript bindings in the `typechain-types` directory.

## Run Tests

```bash
npx hardhat test
```

## Deploy Contracts

### Local Development Network

1. Start a local Hardhat node:

```bash
npx hardhat node
```

2. In a separate terminal, deploy the contract:

```bash
npx hardhat run scripts/deploy.ts --network localhost
```

### Public Networks

To deploy to a public network (like Sepolia testnet or Ethereum mainnet), update the `hardhat.config.ts` file with your network settings and API keys, then run:

```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

## Contract Verification

After deploying to a public network, you can verify your contract on Etherscan:

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

For the VKU token, the command would be:

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <OWNER_ADDRESS>
```

## Security Considerations

- The contract uses OpenZeppelin's battle-tested implementations for security
- Owner privileges are limited to minting new tokens
- Always audit contracts before deploying to mainnet
- Consider adding functionality gradually and testing thoroughly between updates
