import { AssetId, OhlcCandle } from '../types';

export class RealHistoryProvider {
  private static readonly YAHOO_SYMBOLS: Record<AssetId, string> = {
    GOLD: 'GC=F',
    US100: '^NDX',
    'HK.CASH': '^HSI',
    FRA40: '^FCHI',
  };

  /**
   * Obtém velas OHLCV reais de 5 minutos do mercado ao vivo
   */
  public static async fetchRealCandles(asset: AssetId): Promise<OhlcCandle[]> {
    const symbol = this.YAHOO_SYMBOLS[asset];
    if (!symbol) return [];

    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=5m&range=1d`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'application/json',
        },
      });

      if (!res.ok) {
        console.warn(`[RealHistoryProvider] Falha ao consultar ${asset} (${symbol}): status ${res.status}`);
        return [];
      }

      const json = await res.json();
      const result = json.chart?.result?.[0];
      if (!result || !result.timestamp || !result.indicators?.quote?.[0]) {
        return [];
      }

      const timestamps: number[] = result.timestamp;
      const quotes = result.indicators.quote[0];
      const candles: OhlcCandle[] = [];

      for (let i = 0; i < timestamps.length; i++) {
        const o = quotes.open[i];
        const h = quotes.high[i];
        const l = quotes.low[i];
        const c = quotes.close[i];
        const v = quotes.volume?.[i] || 100;

        // Pula velas nulas
        if (o === null || h === null || l === null || c === null || isNaN(c)) {
          continue;
        }

        candles.push({
          time: timestamps[i] * 1000,
          open: parseFloat(o.toFixed(2)),
          high: parseFloat(h.toFixed(2)),
          low: parseFloat(l.toFixed(2)),
          close: parseFloat(c.toFixed(2)),
          volume: Math.floor(v),
        });
      }

      return candles;
    } catch (e: any) {
      console.warn(`[RealHistoryProvider] Erro ao buscar velas para ${asset}:`, e.message);
      return [];
    }
  }

  /**
   * Tenta buscar velas de ouro (PAXG) na Binance como contingência aberta sem chave
   */
  public static async fetchBinanceGoldCandles(): Promise<OhlcCandle[]> {
    try {
      const res = await fetch('https://api.binance.com/api/v3/klines?symbol=PAXGUSDT&interval=5m&limit=100');
      if (!res.ok) return [];
      const data = await res.json();
      if (!Array.isArray(data)) return [];

      return data.map((k: any) => ({
        time: k[0],
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
        volume: parseFloat(k[5]),
      }));
    } catch (e) {
      return [];
    }
  }
}
