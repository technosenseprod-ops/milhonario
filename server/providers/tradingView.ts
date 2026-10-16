import WebSocket from 'ws';
import { AssetId, MarketQuote, ProviderType } from '../types';

export interface TvTickData {
  asset: AssetId;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  volume: number;
  bid: number;
  ask: number;
  latencyMs: number;
}

export class TradingViewProvider {
  private ws: WebSocket | null = null;
  private isConnected = false;
  private pollInterval: NodeJS.Timeout | null = null;
  private onTickCallback: ((tick: TvTickData) => void) | null = null;

  // TradingView exact institutional ticker mappings
  public static readonly TV_SYMBOLS: Record<AssetId, string> = {
    GOLD: 'COMEX:GC1!',
    US100: 'NASDAQ:NDX',
    'HK.CASH': 'HSI:HSI',
    FRA40: 'EURONEXT:PX1',
  };

  constructor(onTick: (tick: TvTickData) => void) {
    this.onTickCallback = onTick;
  }

  public start() {
    console.log('[TradingView Provider] Starting zero-key public streaming engine...');
    // Immediate initial poll
    this.pollScannerQuotes();

    // High frequency polling (every 1.5 seconds for instant quote freshness with 0 keys)
    this.pollInterval = setInterval(() => {
      this.pollScannerQuotes();
    }, 1500);

    // Also attempt TradingView public WebSocket protocol
    this.connectTvWebSocket();
  }

  public stop() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    if (this.ws) this.ws.close();
  }

  // --- TRADINGVIEW PUBLIC SCANNER REST (0 KEYS REQUIRED) ---
  public async pollScannerQuotes(): Promise<void> {
    const start = Date.now();
    try {
      const tickers = Object.values(TradingViewProvider.TV_SYMBOLS);
      const res = await fetch('https://scanner.tradingview.com/global/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        body: JSON.stringify({
          symbols: { tickers },
          columns: ['close', 'change', 'change_abs', 'high', 'low', 'open', 'volume', 'bid', 'ask'],
        }),
      });

      if (!res.ok) return;

      const data = await res.json();
      if (!data || !Array.isArray(data.data)) return;

      const latencyMs = Date.now() - start;

      for (const item of data.data) {
        const symbol = item.s;
        const d = item.d;
        if (!d || d[0] === null || d[0] === undefined) continue;

        // Map symbol back to AssetId
        let asset: AssetId | null = null;
        for (const [key, val] of Object.entries(TradingViewProvider.TV_SYMBOLS)) {
          if (val === symbol) {
            asset = key as AssetId;
            break;
          }
        }

        if (!asset) continue;

        const price = parseFloat(d[0]);
        const changePercent = parseFloat(d[1] || '0');
        const changeAbs = parseFloat(d[2] || '0');
        const high = parseFloat(d[3] || price.toString());
        const low = parseFloat(d[4] || price.toString());
        const open = parseFloat(d[5] || price.toString());
        const volume = parseFloat(d[6] || '0');
        const bid = d[7] !== null ? parseFloat(d[7]) : price - 0.2;
        const ask = d[8] !== null ? parseFloat(d[8]) : price + 0.2;
        const prevClose = price - changeAbs;

        this.onTickCallback?.({
          asset,
          symbol,
          price,
          change: changeAbs,
          changePercent,
          high,
          low,
          open,
          previousClose: prevClose,
          volume,
          bid,
          ask,
          latencyMs,
        });
      }
    } catch (e: any) {
      // Handled silently
    }
  }

  // --- TRADINGVIEW WEBSOCKET PROTOCOL CLIENT (0 KEYS REQUIRED) ---
  private connectTvWebSocket() {
    try {
      const wsUrl = 'wss://data.tradingview.com/socket.io/websocket';
      this.ws = new WebSocket(wsUrl, {
        headers: { Origin: 'https://www.tradingview.com' },
      });

      this.ws.on('error', (err) => {
        this.isConnected = false;
        console.warn('[TradingView WS] Notice:', err.message);
      });

      const formatMessage = (msg: string) => `~m~${msg.length}~m~${msg}`;

      this.ws.on('open', () => {
        this.isConnected = true;
        console.log('[TradingView WS] Connected to TradingView zero-key public WebSocket');

        const sessionId = 'qs_' + Math.random().toString(36).substring(2, 12);

        this.ws?.send(formatMessage(JSON.stringify({ m: 'set_data_quality', p: [sessionId, 'low'] })));
        this.ws?.send(formatMessage(JSON.stringify({ m: 'quote_create_session', p: [sessionId] })));
        this.ws?.send(
          formatMessage(
            JSON.stringify({
              m: 'quote_set_fields',
              p: [
                sessionId,
                'lp',
                'bid',
                'ask',
                'ch',
                'chp',
                'volume',
                'high_price',
                'low_price',
                'open_price',
                'prev_close_price',
              ],
            })
          )
        );

        const tickers = Object.values(TradingViewProvider.TV_SYMBOLS);
        this.ws?.send(
          formatMessage(
            JSON.stringify({
              m: 'quote_add_symbols',
              p: [sessionId, ...tickers],
            })
          )
        );
      });

      this.ws.on('message', (raw) => {
        try {
          const str = raw.toString();
          // Heartbeat handling
          if (str.includes('~h~')) {
            this.ws?.send(str);
            return;
          }

          // Parse quote data
          if (str.includes('"qsd"') && str.includes('"v"')) {
            const parts = str.split('~m~');
            for (const part of parts) {
              if (part.startsWith('{') && part.includes('"qsd"')) {
                const json = JSON.parse(part);
                const payload = json.p?.[1];
                if (payload && payload.n && payload.v) {
                  const symbol = payload.n;
                  const v = payload.v;

                  let asset: AssetId | null = null;
                  for (const [key, val] of Object.entries(TradingViewProvider.TV_SYMBOLS)) {
                    if (val === symbol) {
                      asset = key as AssetId;
                      break;
                    }
                  }

                  if (asset && v.lp !== undefined) {
                    const price = parseFloat(v.lp);
                    this.onTickCallback?.({
                      asset,
                      symbol,
                      price,
                      change: parseFloat(v.ch || '0'),
                      changePercent: parseFloat(v.chp || '0'),
                      high: parseFloat(v.high_price || price.toString()),
                      low: parseFloat(v.low_price || price.toString()),
                      open: parseFloat(v.open_price || price.toString()),
                      previousClose: parseFloat(v.prev_close_price || price.toString()),
                      volume: parseFloat(v.volume || '0'),
                      bid: parseFloat(v.bid || (price - 0.2).toString()),
                      ask: parseFloat(v.ask || (price + 0.2).toString()),
                      latencyMs: 15,
                    });
                  }
                }
              }
            }
          }
        } catch (e) {}
      });

      this.ws.on('close', () => {
        this.isConnected = false;
        setTimeout(() => this.connectTvWebSocket(), 15000);
      });
    } catch (e: any) {
      console.warn('[TradingView WS] Init notice:', e.message);
    }
  }

  public getStatus() {
    return {
      connected: this.isConnected,
      activePolling: Boolean(this.pollInterval),
    };
  }
}
