import test from 'node:test';
import assert from 'node:assert/strict';
import { validateBlockRange, readConfig } from '../src/monitor.mjs';

test('accepts a valid inclusive block range', () => {
  assert.deepEqual(validateBlockRange(100, 120), {
    fromBlock: 100n,
    toBlock: 120n,
  });
});

test('rejects negative or unsafe block numbers', () => {
  assert.throws(() => validateBlockRange(-1, 10), /FROM_BLOCK/);
  assert.throws(() => validateBlockRange(1, Number.MAX_SAFE_INTEGER + 1), /TO_BLOCK/);
});

test('rejects a reversed block range', () => {
  assert.throws(() => validateBlockRange(20, 10), /greater than or equal/);
});

test('requires a valid contract address', () => {
  assert.throws(
    () => readConfig({ CONTRACT_ADDRESS: 'not-an-address', FROM_BLOCK: '1', TO_BLOCK: '2' }),
    /valid EVM contract address/,
  );
});

test('parses a valid monitor configuration', () => {
  const config = readConfig({
    CONTRACT_ADDRESS: '0x0000000000000000000000000000000000000001',
    FROM_BLOCK: '100',
    TO_BLOCK: '105',
  });
  assert.equal(config.fromBlock, 100n);
  assert.equal(config.toBlock, 105n);
  assert.equal(config.eventAbi.length, 1);
});
