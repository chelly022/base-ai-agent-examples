# Base event log monitor

A read-only command-line example that queries smart-contract event logs on Base
mainnet using Viem. It checks the connected chain ID before querying and accepts
an explicit inclusive block range.

## Requirements

- Node.js 20 or newer
- A Base mainnet RPC endpoint (a provider endpoint is recommended for sustained use)

## Install

From this directory:

```bash
npm install
npm test
```

## Configure and run

Set the contract address and block range. By default, the monitor looks for
ERC-20 `Transfer` events.

Windows CMD:

```cmd
set CONTRACT_ADDRESS=0xYourContractAddress
set FROM_BLOCK=1000000
set TO_BLOCK=1000100
set BASE_RPC_URL=https://mainnet.base.org
npm start
```

PowerShell:

```powershell
$env:CONTRACT_ADDRESS="0xYourContractAddress"
$env:FROM_BLOCK="1000000"
$env:TO_BLOCK="1000100"
$env:BASE_RPC_URL="https://mainnet.base.org"
npm start
```

You can provide a different single-event ABI signature with `EVENT_ABI`, for
example:

```cmd
set EVENT_ABI=event Approval(address indexed owner, address indexed spender, uint256 value)
npm start
```

The event signature must be a valid Solidity event declaration supported by
Viem's `parseAbi`.

## What it does

1. Validates the contract address and block range.
2. Connects to the configured RPC endpoint using Base's chain definition.
3. Confirms the RPC reports Base mainnet (chain ID 8453).
4. Queries matching logs for the requested contract and block range.
5. Prints the block number, transaction hash, event name, and decoded arguments.

## Safety and limitations

- Uses a public client and `getLogs`; it does not sign or broadcast transactions.
- No private key, seed phrase, or wallet connection is required.
- The example performs a bounded historical query, not continuous live polling.
- Large block ranges may exceed an RPC provider's limits; reduce the range or use
  a provider with suitable log-query limits.
- Treat RPC results as untrusted input and independently verify important events.

Never commit API keys or other credentials. If a provider requires an API key,
store it in your local environment rather than source control.
