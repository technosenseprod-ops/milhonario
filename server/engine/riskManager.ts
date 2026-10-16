export interface RiskParams {
  accountBalance: number; // USD
  riskPerTradePercent: number; // e.g., 0.5 = 0.5%
  maxExposurePercent: number; // maximum % of account exposed to single asset
}

export class RiskManager {
  private params: RiskParams;

  constructor(params?: Partial<RiskParams>) {
    this.params = {
      accountBalance: process.env.RAPTOR_ACCOUNT_BALANCE ? parseFloat(process.env.RAPTOR_ACCOUNT_BALANCE) : 100000,
      riskPerTradePercent: 0.5 / 100, // default 0.5%
      maxExposurePercent: 5 / 100, // default 5%
      ...params,
    } as RiskParams;
  }

  /**
   * Calcula o tamanho de lote (lotSize) baseado em risco por trade e distância do stop (em preços).
   * multiplierPerPoint: valor USD por ponto/contrato (por ativo) - exemplo: GOLD -> 100, US100 -> 20
   */
  public calculateLotSize(entryPrice: number, stopLossPrice: number, multiplierPerPoint: number): number {
    const account = this.params.accountBalance;
    const riskPerTrade = account * this.params.riskPerTradePercent; // USD

    const stopDistance = Math.abs(entryPrice - stopLossPrice);
    if (stopDistance <= 0) return 0;

    // USD perda por lote = stopDistance * multiplierPerPoint
    const lossPerLot = stopDistance * multiplierPerPoint;
    if (lossPerLot <= 0) return 0;

    let rawLots = riskPerTrade / lossPerLot;

    // Enforce exposure cap: max USD exposure allowed
    const maxExposureUsd = account * this.params.maxExposurePercent;
    const maxLotsByExposure = Math.max(1, Math.floor(maxExposureUsd / (entryPrice * multiplierPerPoint)));

    // floor to sensible increments (0.1)
    const lot = Math.max(0, Math.min(maxLotsByExposure, Math.floor(rawLots * 10) / 10));
    return parseFloat(lot.toFixed(2));
  }

  public setAccountBalance(balance: number) {
    this.params.accountBalance = balance;
  }

  public setRiskPerTradePercent(percent: number) {
    this.params.riskPerTradePercent = percent;
  }

  public setMaxExposurePercent(percent: number) {
    this.params.maxExposurePercent = percent;
  }
}

export const defaultRiskManager = new RiskManager();
