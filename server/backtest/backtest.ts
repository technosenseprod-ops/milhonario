import { OhlcCandle } from '../types';
import { InstitutionalStrategyEngine } from '../engine/strategyEngine';

export interface BacktestResult {
  totalTrades: number;
  wins: number;
  losses: number;
  profitUsd: number;
  returnsPercent: number;
}

/**
 * Simple backtester that runs the strategy engine on a historical sequence of candles
 * and simulates entries/exits using the AgentOperation logic in strategyEngine.
 */
export async function runSimpleBacktest(candles: OhlcCandle[], initialBalance = 100000) : Promise<BacktestResult> {
  const engine = new InstitutionalStrategyEngine();
  // set up a simulated market by feeding price points sequentially
  let balance = initialBalance;
  let trades = 0;
  let wins = 0;
  let losses = 0;
  let profit = 0;

  // Use closes as price sweep
  for (let i = 0; i < candles.length; i++) {
    const price = candles[i].close;
    // analyze per asset - we'll use GOLD for the simple backtest
    const res = engine.analyze('GOLD' as any, price, candles.slice(0, i + 1));

    if (res.hasSignal && res.signal) {
      trades++;
      // naive PnL: if EXIT or TARGET or STOP, consider profit as target - entry
      if (res.signal.type === 'EXIT' || res.signal.type === 'TARGET') {
        profit += (res.signal.targetPrice || price) - price;
        wins++;
      } else if (res.signal.type === 'STOP') {
        profit -= (res.signal.stopLossPrice || price) - price;
        losses++;
      } else if (res.signal.type === 'BUY' || res.signal.type === 'SELL') {
        // treat entry as zero immediate pnl
      }
    }
  }

  const returns = (profit / initialBalance) * 100;
  return {
    totalTrades: trades,
    wins,
    losses,
    profitUsd: parseFloat(profit.toFixed(2)),
    returnsPercent: parseFloat(returns.toFixed(2)),
  };
}
