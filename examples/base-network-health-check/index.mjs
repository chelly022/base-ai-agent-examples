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
    throw new Error('BASE_NETWORK must be "base" or "base-sepolia".');
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
