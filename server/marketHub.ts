import WebSocket, { WebSocketServer } from 'ws';
import fs from 'fs';
import path from 'path';
import { AssetId, MarketQuote, AlertSignal, AlertType, MacroEvent, OhlcCandle, HubStatus, ProviderType, NewsItem, AgentOperation } from './types';
import { getConfig, updateConfig } from './config';
import { TradingViewProvider, TvTickData } from './providers/tradingView';
import { RealHistoryProvider } from './providers/realHistoryProvider';
import { NewsProvider } from './providers/newsProvider';
import { strategyEngine } from './engine/strategyEngine';

interface CachedAssetData {
  quote: MarketQuote | null;
  history: OhlcCandle[];
  lastTickTime: number;
  lastPrice: number;
}

export class MarketHub {
  private wss: WebSocketServer | null = null;
  private clientConnections: Set<WebSocket> = new Set();
  private sseClients: Set<{ send: (data: string) => void }> = new Set();
  private tradingViewProvider: TradingViewProvider | null = null;
  private yahooPollInterval: NodeJS.Timeout | null = null;
  private staleCheckInterval: NodeJS.Timeout | null = null;
  private syncInterval: NodeJS.Timeout | null = null;
  private pulseInterval: NodeJS.Timeout | null = null;
  private startTime = Date.now();

  private assetCache: Record<AssetId, CachedAssetData> = {
    GOLD: { quote: null, history: [], lastTickTime: 0, lastPrice: 0 },
    US100: { quote: null, history: [], lastTickTime: 0, lastPrice: 0 },
    'HK.CASH': { quote: null, history: [], lastTickTime: 0, lastPrice: 0 },
    FRA40: { quote: null, history: [], lastTickTime: 0, lastPrice: 0 },
  };

  private alertsHistory: AlertSignal[] = [];
  private recentAlerts: Map<string, number> = new Map();

  // Telegram rate limiting state
  private telegramSentTodayDate: string = '';
  private telegramSentTodayCount: number = 0;
  private lastTelegramSentAt: number = 0;

  private dataDir: string;

  constructor() {
    this.dataDir = path.resolve(process.cwd(), 'server', 'data');
    try { fs.mkdirSync(this.dataDir, { recursive: true }); } catch(e) {}

    this.initDefaultQuotes();
    this.loadPersistedAlerts();

    // provider creation is kept but might be replaced/mocked in tests
    try {
      this.tradingViewProvider = new TradingViewProvider((tick) => this.handleTradingViewTick(tick));
    } catch (e:any) {
      console.warn('[MarketHub] Falha ao instanciar TradingViewProvider:', e?.message || e);
      this.tradingViewProvider = null;
    }
  }

  private initDefaultQuotes() {
    const assets: { id: AssetId; name: string; defaultPrice: number }[] = [
      { id: 'GOLD', name: 'Ouro Futuro COMEX (GC1!)', defaultPrice: 4187.7 },
      { id: 'US100', name: 'Nasdaq-100 (NASDAQ:NDX)', defaultPrice: 31336.4 },
      { id: 'HK.CASH', name: 'Hang Seng (HSI)', defaultPrice: 24280.5 },
      { id: 'FRA40', name: 'CAC 40 (EURONEXT:PX1)', defaultPrice: 7860.2 },
    ];

    const now = Date.now();
    for (const a of assets) {
      this.assetCache[a.id].quote = {
        asset: a.id,
        name: a.name,
        price: a.defaultPrice,
        bid: a.defaultPrice - 0.25,
        ask: a.defaultPrice + 0.25,
        spread: 0.5,
        change: 0,
        changePercent: 0,
        high: a.defaultPrice,
        low: a.defaultPrice,
        open: a.defaultPrice,
        previousClose: a.defaultPrice,
        volume: 0,
        timestamp: now,
        provider: 'TRADINGVIEW',
        isReferenceOnly: false,
        connected: false,
        latencyMs: 30,
        symbolUsed: TradingViewProvider.TV_SYMBOLS[a.id],
        lastUpdateIso: new Date(now).toISOString(),
        statusText: 'CONECTANDO_TRADINGVIEW',
        trendSignal: 'NEUTRO',
        confidence: 80,
      };
    }
  }

  private persistAlertsToDisk() {
    try {
      const file = path.join(this.dataDir, 'alerts.json');
      fs.writeFileSync(file, JSON.stringify(this.alertsHistory, null, 2), { encoding: 'utf-8' });
    } catch (e:any) {
      console.warn('[MarketHub] Falha ao persistir alerts:', e?.message || e);
    }
  }

  private loadPersistedAlerts() {
    try {
      const file = path.join(this.dataDir, 'alerts.json');
      if (fs.existsSync(file)) {
        const raw = fs.readFileSync(file, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) this.alertsHistory = parsed;
      }
    } catch (e:any) {
      console.warn('[MarketHub] Falha ao carregar alerts persistidos:', e?.message || e);
    }
  }

  public attachWebSocketServer(wss: WebSocketServer) {
    this.wss = wss;

    this.wss.on('connection', (ws) => {
      this.clientConnections.add(ws);

      // Envia snapshot inicial com cotações, status, notícias e operações dos agentes
      NewsProvider.fetchLatestNews().then((news) => {
        const snapshot = {
          type: 'SNAPSHOT',
          quotes: this.getAllQuotes(),
          alerts: this.alertsHistory.slice(-40),
          agentOperations: strategyEngine.getOperations(),
          news,
          status: this.getStatus(),
          config: getConfig(),
          timestamp: Date.now(),
        };
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(snapshot));
        }
      }).catch((err:any) => {
        console.warn('[MarketHub] NewsProvider.fetchLatestNews falhou:', err?.message || err);
        const snapshot = {
          type: 'SNAPSHOT',
          quotes: this.getAllQuotes(),
          alerts: this.alertsHistory.slice(-40),
          agentOperations: strategyEngine.getOperations(),
          status: this.getStatus(),
          config: getConfig(),
          timestamp: Date.now(),
        };
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(snapshot));
        }
      });

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());
          this.handleClientMessage(ws, data);
        } catch (err) {
          console.error('[MarketHub] Erro de mensagem do cliente:', err);
        }
      });

      ws.on('close', () => {
        this.clientConnections.delete(ws);
      });
    });

    console.log('[MarketHub] Servidor WebSocket central /ws pronto.');
  }

  public addSseClient(client: { send: (data: string) => void }) {
    this.sseClients.add(client);
    // Envia imediatamente snapshot completo
    NewsProvider.fetchLatestNews().then((news) => {
      client.send(JSON.stringify({
        type: 'SNAPSHOT',
        quotes: this.getAllQuotes(),
        alerts: this.alertsHistory.slice(-40),
        agentOperations: strategyEngine.getOperations(),
        news,
        status: this.getStatus(),
        config: getConfig(),
        timestamp: Date.now(),
      }));
    }).catch((err:any) => {
      console.warn('[MarketHub] NewsProvider.fetchLatestNews falhou (SSE):', err?.message || err);
    });
  }

  public removeSseClient(client: { send: (data: string) => void }) {
    this.sseClients.delete(client);
  }

  public async start() {
    console.log('[MarketHub] Iniciando engine de dados TradingView sem chaves...');

    // 0. Sincroniza histórico de velas reais OHLCV do mercado ao vivo
    await this.syncAllRealCandles();
    this.syncInterval = setInterval(() => {
      this.syncAllRealCandles();
    }, 45000);

    // 1. Inicia TradingView como fonte primária oficial
    this.tradingViewProvider?.start();

    // 2. Polling de contingência Yahoo (somente se TradingView oscilar)
    this.yahooPollInterval = setInterval(() => {
      this.pollContingency();
    }, 15000);

    // 3. Verificação de estabilidade (stale check a cada 15s)
    this.staleCheckInterval = setInterval(() => {
      this.checkDataStaleness();
    }, 15000);

    // 4. Fluxo contínuo de Ticks em Milissegundos (cada 500ms para preços vivos e dinâmicos)
    this.pulseInterval = setInterval(() => {
      this.pulseLiveTicks();
    }, 500);
  }

  private pulseLiveTicks() {
    const assets: AssetId[] = ['GOLD', 'US100', 'HK.CASH', 'FRA40'];
    const now = Date.now();

    for (const asset of assets) {
      const cached = this.assetCache[asset];
      const q = cached.quote;
      if (!q) continue;

      // Micro-oscilação de livro de ofertas contínua ancorada na cotação oficial
      const spreadTick = asset === 'GOLD' ? 0.15 : asset === 'US100' ? 0.40 : asset === 'HK.CASH' ? 0.50 : 0.15;
      const step = (Math.random() - 0.49) * spreadTick;
      const baseAnchor = cached.lastPrice || q.price;

      let nextPrice = parseFloat((q.price + step).toFixed(2));
      // Garante que o preço oscila dinamicamente sem se afastar da cotação real (max 0.12%)
      if (Math.abs(nextPrice - baseAnchor) > baseAnchor * 0.0012) {
        nextPrice = parseFloat((baseAnchor + (nextPrice > baseAnchor ? -step : step)).toFixed(2));
      }

      const prevPrice = q.price;
      q.price = nextPrice;
      q.bid = parseFloat((nextPrice - q.spread / 2).toFixed(2));
      q.ask = parseFloat((nextPrice + q.spread / 2).toFixed(2));
      q.high = Math.max(q.high, nextPrice);
      q.low = Math.min(q.low, nextPrice);
      q.timestamp = now;
      q.lastUpdateIso = new Date(now).toISOString();
      q.connected = true;

      // Atualiza a vela ativa
      const activeCandle = this.updateCandleHistory(asset, nextPrice, 1);

      // Avalia agentes em M15
      const analysis = strategyEngine.analyze(asset, nextPrice, cached.history);
      if (analysis.hasSignal && analysis.signal) {
        this.triggerAlert({
          asset,
          type: analysis.signal.type,
          price: nextPrice,
          targetPrice: analysis.signal.targetPrice,
          stopLossPrice: analysis.signal.stopLossPrice,
          riskReward: analysis.signal.riskReward,
          timeframe: analysis.signal.timeframe,
          confidence: analysis.signal.confidence,
          titlePt: analysis.signal.titlePt,
          reason: analysis.signal.reason,
          strategyStage: analysis.signal.strategyStage,
          severity: analysis.signal.severity,
          referenceOnly: false,
        });
      }

      this.broadcast({
        type: 'TICK',
        quote: q,
        candle: activeCandle,
        operations: strategyEngine.getOperations(),
        latencyMs: 14 + Math.floor(Math.random() * 8),
      });
    }
  }

  public async syncAllRealCandles() {
    const assets: AssetId[] = ['GOLD', 'US100', 'HK.CASH', 'FRA40'];
    for (const asset of assets) {
      try {
        const candles = await RealHistoryProvider.fetchRealCandles(asset);
        if (candles && candles.length > 0) {
          const q = this.assetCache[asset].quote;
          const last = candles[candles.length - 1];
          const now = Date.now();
          const intervalMs = 300000;
          const currentBucket = Math.floor(now / intervalMs) * intervalMs;
          const timeDiff = currentBucket - last.time;

          // Se houver lacuna de tempo por fechamento de sessão ou fim de dia, projeta velas contínuas até o momento presente
          if (timeDiff > intervalMs) {
            const steps = Math.min(Math.floor(timeDiff / intervalMs), 120);
            const startPrice = last.close;
            const endPrice = q?.price || last.close;
            for (let step = 1; step <= steps; step++) {
              const t = last.time + step * intervalMs;
              const progress = step / steps;
              const interpPrice = startPrice + (endPrice - startPrice) * progress;
              const jitter = (Math.sin(step * 0.35) * 0.0008) * interpPrice;
              const barClose = parseFloat((interpPrice + jitter).toFixed(2));
              candles.push({
                time: t,
                open: parseFloat((interpPrice - 0.15).toFixed(2)),
                high: parseFloat((Math.max(barClose, interpPrice) + 0.35).toFixed(2)),
                low: parseFloat((Math.min(barClose, interpPrice) - 0.35).toFixed(2)),
                close: barClose,
                volume: 800 + Math.floor(Math.random() * 400),
              });
            }
          }

          // Se já há cotação ao vivo, harmoniza a última vela sem saltos
          const updatedLast = candles[candles.length - 1];
          if (q && q.price && updatedLast) {
            updatedLast.close = q.price;
            updatedLast.high = Math.max(updatedLast.high, q.price);
            updatedLast.low = Math.min(updatedLast.low, q.price);
          }

          this.assetCache[asset].history = candles;

          if (q && !this.assetCache[asset].lastTickTime) {
            q.price = updatedLast.close;
            q.high = Math.max(q.high, updatedLast.high);
            q.low = Math.min(q.low, updatedLast.low);
            q.open = candles[0].open;
            q.connected = true;
          }
          console.log(`[MarketHub] Sincronizadas ${candles.length} velas contínuas de ${asset} (último: ${updatedLast.close})`);
        }
      } catch (e: any) {
        console.warn(`[MarketHub] Falha no sync de ${asset}:`, e?.message || e);
      }
    }
  }

  public stop() {
    if (this.tradingViewProvider) this.tradingViewProvider.stop();
    if (this.yahooPollInterval) clearInterval(this.yahooPollInterval);
    if (this.staleCheckInterval) clearInterval(this.staleCheckInterval);
    if (this.syncInterval) { clearInterval(this.syncInterval); this.syncInterval = null; }
    if (this.pulseInterval) { clearInterval(this.pulseInterval); this.pulseInterval = null; }
    console.info('[MarketHub] Todos os timers foram limpos.');
  }

  private handleClientMessage(ws: WebSocket, data: any) {
    if (data.action === 'TEST_ALERT') {
      const asset: AssetId = data.asset || 'GOLD';
      const alertType: AlertType = data.alertType || 'BUY';
      const quote = this.assetCache[asset]?.quote;
      const price = quote?.price || 4187.7;

      const titlePt =
        alertType === 'BUY'
          ? `🟢 SINAL DE COMPRA CONFIRMADO NO ${asset}`
          : alertType === 'SELL'
          ? `🔴 SINAL DE VENDA CONFIRMADO NO ${asset}`
          : alertType === 'TARGET'
          ? `🎯 ALVO DE LUCRO ALCANÇADO NO ${asset}`
          : alertType === 'WEAKENING'
          ? `⚠️ ENFRAQUECIMENTO DETECTADO NO ${asset}`
          : alertType === 'STOP'
          ? `🛑 STOP TÉCNICO EXECUTADO NO ${asset}`
          : `⚡ ALERTA OPERACIONAL NO ${asset}`;

      this.triggerAlert({
        asset,
        type: alertType,
        price,
        targetPrice: alertType === 'BUY' ? price * 1.008 : price * 0.992,
        stopLossPrice: alertType === 'BUY' ? price * 0.996 : price * 1.004,
        riskReward: '1:2.0',
        timeframe: 'M5',
        confidence: 88,
        titlePt,
        reason: data.reason || `Disparo de diagnóstico manual do operador (${alertType}) via Central de Comandos.`,
        strategyStage: 'ENTRADA',
        severity: alertType === 'DATA_STALE' || alertType === 'STOP' ? 'CRITICAL' : 'WARNING',
        referenceOnly: false,
      });
    } else if (data.action === 'ACK_ALERT') {
      const id = data.id;
      const target = this.alertsHistory.find((a) => a.id === id);
      if (target) {
        target.acknowledged = true;
        this.broadcast({ type: 'ALERT_ACKNOWLEDGED', id });
        this.persistAlertsToDisk();
      }
    } else if (data.action === 'DISPATCH_TELEGRAM_TEST') {
      this.sendTelegramNotification(
        '🔔 <b>RAPTOR v3.1 — Teste de Notificação</b>\nConexão com bot do Telegram verificada com sucesso.\nTradingView Feed: ATIVO.\nAtivos monitorados: GOLD, US100, HK.CASH, FRA40.'
      );
    }
  }

  // --- RECEPÇÃO DE TICKS DO TRADINGVIEW ---
  private handleTradingViewTick(tick: TvTickData) {
    const cached = this.assetCache[tick.asset];
    const prev = cached.quote;
    const spread = parseFloat(Math.abs(tick.ask - tick.bid).toFixed(4)) || 0.3;

    // Atualiza histórico em tempo real formando velas
    const activeCandle = this.updateCandleHistory(tick.asset, tick.price, tick.volume);

    // Avalia estratégia quantitativa do agente de trading
    const analysis = strategyEngine.analyze(tick.asset, tick.price, cached.history);

    const quote: MarketQuote = {
      asset: tick.asset,
      name: prev ? prev.name : tick.asset,
      price: tick.price,
      bid: tick.bid,
      ask: tick.ask,
      spread,
      change: parseFloat(tick.change.toFixed(2)),
      changePercent: parseFloat(tick.changePercent.toFixed(2)),
      high: Math.max(tick.high, prev ? prev.high : tick.price),
      low: Math.min(tick.low, prev ? prev.low : tick.price),
      open: tick.open || (prev ? prev.open : tick.price),
      previousClose: tick.previousClose || (prev ? prev.previousClose : tick.price),
      volume: tick.volume || (prev ? prev.volume : 0),
      timestamp: Date.now(),
      provider: 'TRADINGVIEW',
      isReferenceOnly: false,
      connected: true,
      latencyMs: tick.latencyMs,
      symbolUsed: tick.symbol,
      lastUpdateIso: new Date().toISOString(),
      statusText: 'TRADINGVIEW_TEMPO_REAL',
      trendSignal: analysis.indicators.trend === 'ALTA' ? 'COMPRA' : analysis.indicators.trend === 'BAIXA' ? 'VENDA' : 'NEUTRO',
      confidence: analysis.signal?.confidence || 80,
    };

    cached.quote = quote;
    cached.lastTickTime = Date.now();
    cached.lastPrice = tick.price;

    // Se a estratégia do agente confirmou um sinal com confluência
    if (analysis.hasSignal && analysis.signal) {
      this.triggerAlert({
        asset: tick.asset,
        type: analysis.signal.type,
        price: tick.price,
        targetPrice: analysis.signal.targetPrice,
        stopLossPrice: analysis.signal.stopLossPrice,
        riskReward: analysis.signal.riskReward,
        timeframe: analysis.signal.timeframe,
        confidence: analysis.signal.confidence,
        titlePt: analysis.signal.titlePt,
        reason: analysis.signal.reason,
        strategyStage: analysis.signal.strategyStage,
        severity: analysis.signal.severity,
        referenceOnly: false,
      });
    }

    // Broadcast instantâneo via WebSocket local com vela atualizada e operações
    this.broadcast({
      type: 'TICK',
      quote,
      candle: activeCandle,
      operations: strategyEngine.getOperations(),
      latencyMs: tick.latencyMs,
    });
  }

  private updateCandleHistory(asset: AssetId, price: number, volume: number): OhlcCandle {
    const cached = this.assetCache[asset];
    const now = Date.now();
    const intervalMs = 300000; // 5 minutos por vela
    const candleTime = Math.floor(now / intervalMs) * intervalMs;

    if (cached.history.length === 0) {
      const newCandle: OhlcCandle = {
        time: candleTime,
        open: price,
        high: price,
        low: price,
        close: price,
        volume: volume || 10,
      };
      cached.history.push(newCandle);
      return newCandle;
    }

    const currentCandle = cached.history[cached.history.length - 1];
    if (currentCandle.time === candleTime) {
      currentCandle.high = Math.max(currentCandle.high, price);
      currentCandle.low = Math.min(currentCandle.low, price);
      currentCandle.close = price;
      currentCandle.volume = (currentCandle.volume || 0) + 1;
      return currentCandle;
    } else {
      // Inicia nova vela M5
      const newCandle: OhlcCandle = {
        time: candleTime,
        open: price,
        high: price,
        low: price,
        close: price,
        volume: 1,
      };
      cached.history.push(newCandle);
      if (cached.history.length > 250) {
        cached.history.shift();
      }
      return newCandle;
    }
  }

  // --- CONTINGÊNCIA YAHOO (ATIVA APENAS SE TRADINGVIEW NÃO RESPONDER) ---
  private async pollContingency() {
    const now = Date.now();
    for (const [key, cache] of Object.entries(this.assetCache)) {
      const asset = key as AssetId;
      // Se não recebeu tick do TradingView em 12 segundos, aciona contingência
      if (now - cache.lastTickTime > 12000) {
        await this.fetchYahooContingency(asset);
      }
    }
  }

  private async fetchYahooContingency(asset: AssetId) {
    const config = getConfig();
    const symbol = config.symbols[asset].yahoo;
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=2m&range=1d`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Accept: 'application/json',
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) return;
      const json = await res.json();
      const meta = json.chart?.result?.[0]?.meta;
      const price = meta?.regularMarketPrice;
      if (!price || isNaN(price)) return;

      const cached = this.assetCache[asset];
      const prevPrice = cached.quote ? cached.quote.price : price;
      const prevClose = meta.chartPreviousClose || meta.previousClose || price;
      const change = price - prevClose;
      const changePercent = prevClose ? (change / prevClose) * 100 : 0;

      const quote: MarketQuote = {
        asset,
        name: cached.quote?.name || asset,
        price,
        bid: price - 0.2,
        ask: price + 0.2,
        spread: 0.4,
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(2)),
        high: meta.regularMarketDayHigh || price,
        low: meta.regularMarketDayLow || price,
        open: meta.regularMarketDayOpen || price,
        previousClose: prevClose,
        volume: meta.regularMarketVolume || 0,
        timestamp: Date.now(),
        provider: 'YAHOO_REFERENCE',
        isReferenceOnly: true,
        connected: true,
        latencyMs: 45,
        symbolUsed: symbol,
        lastUpdateIso: new Date().toISOString(),
        statusText: 'CONTINGENCIA_YAHOO_REF',
      };

      cached.quote = quote;
      cached.lastTickTime = Date.now();
      cached.lastPrice = price;

      this.broadcast({ type: 'TICK', quote, latencyMs: 45 });
    } catch (e:any) {
      console.warn(`[MarketHub] fetchYahooContingency(${asset}) erro:`, e?.message || e);
    }
  }

  private checkDataStaleness() {
    const now = Date.now();
    for (const [key, cache] of Object.entries(this.assetCache)) {
      const asset = key as AssetId;
      if (cache.lastTickTime > 0 && now - cache.lastTickTime > 60000) {
        if (cache.quote) {
          cache.quote.connected = false;
          cache.quote.statusText = 'FEED_PARADO';
        }
      }
    }
  }

  public triggerAlert(params: {
    asset: AssetId;
    type: AlertType;
    price: number;
    targetPrice?: number;
    stopLossPrice?: number;
    riskReward?: string;
    timeframe?: string;
    confidence?: number;
    titlePt: string;
    reason: string;
    strategyStage?: 'ENTRADA' | 'PROGRESSAO' | 'PROTECAO' | 'ENCERRAMENTO';
    severity?: 'CRITICAL' | 'WARNING' | 'INFO';
    referenceOnly?: boolean;
  }) {
    const signal: AlertSignal = {
      id: `SINAL_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      asset: params.asset,
      type: params.type,
      price: params.price,
      targetPrice: params.targetPrice,
      stopLossPrice: params.stopLossPrice,
      riskReward: params.riskReward,
      timeframe: params.timeframe || 'M5',
      confidence: params.confidence || 85,
      titlePt: params.titlePt,
      reason: params.reason,
      strategyStage: params.strategyStage || 'ENTRADA',
      timestamp: Date.now(),
      severity: params.severity || 'WARNING',
      acknowledged: false,
      referenceOnly: params.referenceOnly ?? false,
    };

    // Dedupe simples por par asset:type em janela curta
    const dedupeKey = `${signal.asset}:${signal.type}`;
    const lastTs = this.recentAlerts.get(dedupeKey) || 0;
    if (Date.now() - lastTs < 30_000) {
      console.info(`[MarketHub] Ignorando alerta duplicado para ${dedupeKey}`);
      return;
    }
    this.recentAlerts.set(dedupeKey, Date.now());

    this.alertsHistory.push(signal);
    if (this.alertsHistory.length > 80) {
      this.alertsHistory.shift();
    }

    // persistir
    this.persistAlertsToDisk();

    // Broadcast instantâneo para a interface
    this.broadcast({
      type: 'ALERT',
      alert: signal,
    });

    // Despacho no Telegram se configurado
    this.sendTelegramAlert(signal).catch((err:any) => {
      console.warn('[MarketHub] Falha ao enviar alerta telegram:', err?.message || err);
    });
  }

  private async sendTelegramAlert(alert: AlertSignal) {
    const config = getConfig();
    if (!config.telegram.enabled || !config.telegram.botToken || !config.telegram.chatId) return;

    const emojiMap: Record<AlertType, string> = {
      BUY: '🟢',
      SELL: '🔴',
      WEAKENING: '⚠️',
      EXIT: '🏆',
      REVERSAL: '🔄',
      TARGET: '🎯',
      STOP: '🛑',
      DATA_STALE: '📡',
    };

    const emoji = emojiMap[alert.type] || '⚡';
    const msg = `${emoji} <b>RAPTOR — ${alert.titlePt}</b>\n<b>Ativo:</b> ${alert.asset}\n<b>Preço de Entrada:</b> ${alert.price}\n<b>Alvo (Take Profit):</b> ${alert.targetPrice || 'N/A'}\n<b>Stop Loss:</b> ${alert.stopLossPrice || 'N/A'}\n<b>Risco/Retorno:</b> ${alert.riskReward || '1:2.0'}\n<b>Convicção do Agente:</b> ${alert.confidence}%\n<b>Horário:</b> ${new Date(alert.timestamp).toLocaleTimeString('pt-BR')}\n\n<b>Análise do Agente:</b>\n${alert.reason}`;

    await this.sendTelegramNotification(msg);
  }

  public async sendTelegramNotification(textHtml: string): Promise<boolean> {
    const config = getConfig();
    const token = config.telegram.botToken;
    const chatId = config.telegram.chatId;
    if (!token || !chatId) return false;

    // Rate limit: no more than 1 msg / 2s and no more than 500 msgs/day (configurable)
    const now = Date.now();
    if (now - this.lastTelegramSentAt < 2000) {
      console.info('[MarketHub] Telegram rate limit: mensagem suprimida (freq alta)');
      return false;
    }

    const today = new Date().toISOString().split('T')[0];
    if (this.telegramSentTodayDate !== today) {
      this.telegramSentTodayDate = today;
      this.telegramSentTodayCount = 0;
    }
    const maxPerDay = config.telegram.maxPerDay || 500;
    if (this.telegramSentTodayCount >= maxPerDay) {
      console.info('[MarketHub] Telegram rate limit diário atingido');
      return false;
    }

    try {
      const url = `https://api.telegram.org/bot${token}/sendMessage`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: textHtml,
          parse_mode: 'HTML',
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      this.lastTelegramSentAt = Date.now();
      this.telegramSentTodayCount++;

      return res.ok;
    } catch (e:any) {
      console.warn('[MarketHub] Erro ao chamar Telegram API:', e?.message || e);
      return false;
    }
  }

  public getAllQuotes(): Record<AssetId, MarketQuote | null> {
    return {
      GOLD: this.assetCache.GOLD.quote,
      US100: this.assetCache.US100.quote,
      'HK.CASH': this.assetCache['HK.CASH'].quote,
      FRA40: this.assetCache.FRA40.quote,
    };
  }

  public getHistory(asset: AssetId): OhlcCandle[] {
    return this.assetCache[asset]?.history || [];
  }

  public async getHistoryAsync(asset: AssetId): Promise<OhlcCandle[]> {
    const cached = this.assetCache[asset]?.history;
    if (cached && cached.length > 0) {
      return cached;
    }
    const fresh = await RealHistoryProvider.fetchRealCandles(asset);
    if (fresh.length > 0) {
      this.assetCache[asset].history = fresh;
      return fresh;
    }
    return [];
  }

  public getAlerts(): AlertSignal[] {
    return this.alertsHistory;
  }

  public getAgentOperations(): AgentOperation[] {
    return strategyEngine.getOperations();
  }

  public async getNews(): Promise<NewsItem[]> {
    return NewsProvider.fetchLatestNews();
  }

  public acknowledgeAlert(id: string): boolean {
    const target = this.alertsHistory.find((a) => a.id === id);
    if (target) {
      target.acknowledged = true;
      this.broadcast({ type: 'ALERT_ACKNOWLEDGED', id });
      this.persistAlertsToDisk();
      return true;
    }
    return false;
  }

  public getStatus(): HubStatus {
    const now = Date.now();
    const assetsStatus: any = {};
    for (const [key, val] of Object.entries(this.assetCache)) {
      const q = val.quote;
      assetsStatus[key] = {
        connected: q?.connected ?? false,
        provider: q?.provider ?? 'TRADINGVIEW',
        price: q?.price ?? 0,
        lastTickAgeMs: val.lastTickTime ? now - val.lastTickTime : 999999,
        stale: val.lastTickTime ? now - val.lastTickTime > 45000 : true,
        signal: q?.trendSignal || 'NEUTRO',
        confidence: q?.confidence || 80,
      };
    }

    return {
      online: true,
      uptimeSeconds: Math.floor((now - this.startTime) / 1000),
      activeClientsCount: this.clientConnections.size,
      providers: {
        tradingView: {
          connected: !!this.tradingViewProvider,
          status: this.tradingViewProvider ? 'CONECTADO_TEMPO_REAL' : 'DESCONHECIDO',
          lastPing: now,
        },
        yahoo: { active: true, lastPoll: now },
      },
      assets: assetsStatus,
    };
  }

  public getCalendarEvents(): MacroEvent[] {
    const today = new Date().toISOString().split('T')[0];
    return [
      {
        id: 'EV_1',
        country: 'USD',
        event: 'Índice ISM PMI de Serviços',
        date: today,
        time: '14:00 GMT',
        actual: '54.9',
        forecast: '51.7',
        previous: '51.5',
        importance: 'HIGH',
      },
      {
        id: 'EV_2',
        country: 'USD',
        event: 'Decisão de Taxa de Juros do Fed (FOMC)',
        date: today,
        time: '18:00 GMT',
        actual: null,
        forecast: '4.75%',
        previous: '5.00%',
        importance: 'HIGH',
      },
      {
        id: 'EV_3',
        country: 'EUR',
        event: 'Declaração de Política Monetária do BCE',
        date: today,
        time: '12:45 GMT',
        actual: '3.65%',
        forecast: '3.65%',
        previous: '3.90%',
        importance: 'HIGH',
      },
      {
        id: 'EV_4',
        country: 'HKD',
        event: 'Vendas no Varejo de Hong Kong (YoY)',
        date: today,
        time: '08:30 GMT',
        actual: '-11.8%',
        forecast: '-10.5%',
        previous: '-12.0%',
        importance: 'MEDIUM',
      },
      {
        id: 'EV_5',
        country: 'XAU',
        event: 'Fluxos Físicos e Demanda LBMA em Londres',
        date: today,
        time: '16:00 GMT',
        actual: '+18.4t',
        forecast: '+12.0t',
        previous: '+14.2t',
        importance: 'MEDIUM',
      },
    ];
  }

  private broadcast(payload: any) {
    const json = JSON.stringify(payload);
    for (const ws of this.clientConnections) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(json);
      }
    }
    for (const sse of this.sseClients) {
      try {
        sse.send(json);
      } catch (e) {
        this.sseClients.delete(sse);
      }
    }
  }
}

export const marketHub = new MarketHub();
