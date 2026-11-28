# Base Network Health Check

A small, read-only Node.js example that checks connectivity to Base Mainnet or Base Sepolia with [viem](https://viem.sh/).

It verifies the connected chain ID before reporting the latest block. This is useful as a preflight check before running an agent, wallet integration, or deployment script.

## Requirements

- Node.js 22 or newer
- npm

## Setup

From this directory, install viem:

```bash
npm init -y
npm pkg set type=module
npm install viem
```

Save the script below as `index.mjs`.

## Run

Base Mainnet:

```bash
BASE_NETWORK=base node index.mjs
```

Base Sepolia:

```bash
BASE_NETWORK=base-sepolia node index.mjs
```

PowerShell examples:

```powershell
$env:BASE_NETWORK = "base"
node .\index.mjs

$env:BASE_NETWORK = "base-sepolia"
node .\index.mjs
```

You can override the default RPC endpoint with `BASE_RPC_URL`. Use a trusted provider for production workloads; Base's public RPC endpoints are rate-limited and intended for development and light usage.

## Script

```js
import { createPublicClient, http } from "viem";
import { base, baseSepolia } from "viem/chains";

const networks = {
  base: {
    chain: base,
    rpcUrl: "https://mainnet.base.org",
  },
  "base-sepolia": {
    chain: baseSepolia,
    rpcUrl: "https://sepolia.base.org",
  },
};

async function main() {
  const networkName = process.env.BASE_NETWORK ?? "base-sepolia";
  const network = networks[networkName];

  if (!network) {
    throw new Error(
      'BASE_NETWORK must be "base" or "base-sepolia".'
    );
  }

  const rpcUrl = process.env.BASE_RPC_URL ?? network.rpcUrl;

  if (!rpcUrl.startsWith("https://")) {
    throw new Error("BASE_RPC_URL must use HTTPS.");
  }

  const client = createPublicClient({
    chain: network.chain,
    transport: http(rpcUrl),
  });

  const actualChainId = await client.getChainId();

  if (actualChainId !== network.chain.id) {
    throw new Error(
      `Wrong network: expected chain ID ${network.chain.id}, received ${actualChainId}.`
    );
  }

  const [blockNumber, latestBlock] = await Promise.all([
    client.getBlockNumber(),
    client.getBlock(),
  ]);

  console.log(
    JSON.stringify(
      {
        status: "ok",
        network: networkName,
        chainId: actualChainId,
        rpcUrl,
        latestBlockNumber: blockNumber.toString(),
        latestBlockHash: latestBlock.hash,
        timestamp: new Date(
          Number(latestBlock.timestamp) * 1000
        ).toISOString(),
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error("Base network check failed:", error.message);
  process.exitCode = 1;
});
```

## Security notes

- This example only reads public chain data; it does not request a wallet connection or sign transactions.
- Never put private keys, seed phrases, or provider API keys in source control.
- Do not treat a successful RPC response as proof that a transaction is safe to sign.
- Public Base RPC endpoints are rate-limited. Use a dedicated node provider or your own node for production applications.

## Network references

| Network | Chain ID | Default RPC | Explorer |
| --- | ---: | --- | --- |
| Base Mainnet | 8453 | `https://mainnet.base.org` | [BaseScan](https://basescan.org) |
| Base Sepolia | 84532 | `https://sepolia.base.org` | [BaseScan Sepolia](https://sepolia.basescan.org) |

See the [official Base network information](https://docs.base.org/base-chain/quickstart/connecting-to-base) before deploying or changing network configuration.
