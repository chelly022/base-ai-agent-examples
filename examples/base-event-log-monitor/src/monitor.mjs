import {
  createPublicClient,
  http,
  isAddress,
  parseAbi,
  formatUnits,
} from 'viem';
import { base } from 'viem/chains';

export function validateBlockRange(fromBlock, toBlock) {
  if (!Number.isSafeInteger(fromBlock) || fromBlock < 0) {
    throw new Error('FROM_BLOCK must be a non-negative safe integer');
  }
  if (!Number.isSafeInteger(toBlock) || toBlock < 0) {
    throw new Error('TO_BLOCK must be a non-negative safe integer');
  }
  if (toBlock < fromBlock) {
    throw new Error('TO_BLOCK must be greater than or equal to FROM_BLOCK');
  }
  return { fromBlock: BigInt(fromBlock), toBlock: BigInt(toBlock) };
}

export function readConfig(env = process.env) {
  const contractAddress = env.CONTRACT_ADDRESS;
  if (!contractAddress || !isAddress(contractAddress)) {
    throw new Error('Set CONTRACT_ADDRESS to a valid EVM contract address');
  }

  const fromBlock = Number(env.FROM_BLOCK);
  const toBlock = Number(env.TO_BLOCK);
  const range = validateBlockRange(fromBlock, toBlock);

  const eventSignature =
    env.EVENT_ABI || 'event Transfer(address indexed from, address indexed to, uint256 value)';

  return {
    contractAddress,
    ...range,
    eventAbi: parseAbi([eventSignature]),
  };
}

export async function monitorBaseEvents(env = process.env) {
  const config = readConfig(env);
  const rpcUrl = env.BASE_RPC_URL || 'https://mainnet.base.org';
  const client = createPublicClient({
    chain: base,
    transport: http(rpcUrl),
  });

  const chainId = await client.getChainId();
  if (chainId !== base.id) {
    throw new Error(`Wrong network: received chain ID ${chainId}, expected ${base.id}`);
  }

  const logs = await client.getLogs({
    address: config.contractAddress,
    events: config.eventAbi,
    fromBlock: config.fromBlock,
    toBlock: config.toBlock,
  });

  console.log(`Found ${logs.length} matching event(s) on Base.`);
  for (const log of logs) {
    console.log({
      blockNumber: log.blockNumber?.toString(),
      transactionHash: log.transactionHash,
      eventName: log.eventName,
      args: log.args,
    });
  }
  return logs;
}

if (import.meta.url === new URL(process.argv[1], 'file:').href) {
  monitorBaseEvents().catch((error) => {
    console.error('Base event monitor failed:', error.message);
    process.exitCode = 1;
  });
}
