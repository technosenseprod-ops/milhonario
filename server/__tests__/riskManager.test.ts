import { describe, it, expect } from 'vitest';
import { RiskManager } from '../../server/engine/riskManager';

describe('RiskManager', () => {
  it('calculates reasonable lot sizes', () => {
    const rm = new RiskManager({ accountBalance: 100000, riskPerTradePercent: 0.005, maxExposurePercent: 0.05 });
    const entry = 4200;
    const stop = 4170; // 30 points
    const multiplier = 100; // GOLD
    const lot = rm.calculateLotSize(entry, stop, multiplier);
    // riskPerTrade = 100000 * 0.005 = 500 USD; lossPerLot = 30*100 = 3000 -> rawLots = 0.166 -> floor to 0.1
    expect(lot).toBeGreaterThanOrEqual(0);
    expect(lot).toBe(0.1);
  });
});
