# Read-only Base network agent

A minimal starting point for an AI agent or automation that needs to inspect Base
mainnet without being able to move funds. The example reads the latest block
number and, optionally, the ETH balance of a public address.

## Requirements

- Node.js 20 or newer
- A Base mainnet RPC endpoint (the public endpoint is suitable for light
  experimentation; use a provider endpoint for production workloads)

## Setup

```bash
mkdir base-read-only-agent
cd base-read-only-agent
npm init -y
npm pkg set type=module
npm install viem
```

Save the script below as `agent.mjs`.

## Example

```js
import { createPublicClient, http, isAddress, formatEther } from 'viem';
import { base } from 'viem/chains';

const rpcUrl = process.env.BASE_RPC_URL || 'https://mainnet.base.org';

const client = createPublicClient({
  chain: base,
  transport: http(rpcUrl),
});

async function inspectBase() {
  const chainId = await client.getChainId();

  if (chainId !== base.id) {
    throw new Error(`Unexpected chain ID: ${chainId}; expected Base mainnet (${base.id})`);
  }

  const blockNumber = await client.getBlockNumber();
  console.log(`Base mainnet block: ${blockNumber}`);

  const address = process.env.WALLET_ADDRESS;
  if (address) {
    if (!isAddress(address)) {
      throw new Error('WALLET_ADDRESS must be a valid EVM address');
    }

    const balance = await client.getBalance({ address });
    console.log(`ETH balance for ${address}: ${formatEther(balance)} ETH`);
  }
}

inspectBase().catch((error) => {
  console.error('Base inspection failed:', error);
  process.exitCode = 1;
});
```

Run it:

```bash
node agent.mjs
```

To inspect a wallet balance, set a public address first:

```bash
# macOS / Linux
WALLET_ADDRESS=0xYourPublicAddress node agent.mjs

# Windows PowerShell
$env:WALLET_ADDRESS="0xYourPublicAddress"; node agent.mjs

# Windows CMD
set WALLET_ADDRESS=0xYourPublicAddress && node agent.mjs
```

## How an AI agent can use this

Treat the script's output as read-only context for an agent: current chain ID,
latest block number, and (if configured) a public wallet balance. An agent can
summarize these values or use them to decide what public on-chain data to inspect
next.

## Safety notes

- This example uses Viem's `createPublicClient` and read methods only.
- It does not request, store, or use a private key, seed phrase, or wallet
  signature.
- Do not give an AI agent signing credentials just to read public chain data.
- Check the chain ID before relying on RPC results, and use a reputable RPC
  provider with suitable rate limits for production.
- Never commit API keys, private keys, seed phrases, or `.env` files.

## Possible extensions

Add a separate, explicitly reviewed module for event-log monitoring, contract
reads with a known ABI, or transaction simulation. Keep transaction signing and
broadcasting outside this read-only example.
