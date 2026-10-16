import { describe, it, expect, beforeEach } from 'vitest';
import { marketHub } from '../../server/marketHub';

describe('MarketHub basic behaviors', () => {
  beforeEach(() => {
    // reset alerts for deterministic tests
    // @ts-ignore
    marketHub.alertsHistory = [];
    // @ts-ignore
    marketHub.recentAlerts = new Map();
  });

  it('should dedupe identical alerts within window', () => {
    const params = {
      asset: 'GOLD' as any,
      type: 'BUY' as any,
      price: 100,
      titlePt: 'test',
      reason: 'unit test',
    };

    // trigger twice quickly
    marketHub.triggerAlert(params as any);
    marketHub.triggerAlert(params as any);

    const alerts = marketHub.getAlerts();
    expect(alerts.length).toBeGreaterThanOrEqual(1);
    // second should be deduped so length should be 1
    expect(alerts.length).toBe(1);
  });
});
