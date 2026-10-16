import { describe, it, expect } from 'vitest';
import { runSimpleBacktest } from '../../server/backtest/backtest';

function makeSyntheticCandles(count: number, startPrice = 4000) {
  const arr = [];
  for (let i = 0; i < count; i++) {
    const p = startPrice + Math.sin(i / 5) * 20 + (i * 0.1);
    arr.push({ time: Date.now() + i * 900000, open: p - 2, high: p + 5, low: p - 5, close: p, volume: 1000 });
  }
  return arr;
}

describe('backtester', () => {
  it('runs without throwing and returns metrics', async () => {
    const candles = makeSyntheticCandles(200, 4100);
    const res = await runSimpleBacktest(candles);
    expect(res.totalTrades).toBeGreaterThanOrEqual(0);
    expect(typeof res.profitUsd).toBe('number');
  });
});
