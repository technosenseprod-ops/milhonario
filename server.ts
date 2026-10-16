import http from 'http';
import express from 'express';
import { WebSocketServer } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import { marketHub } from './server/marketHub';
import { getConfig, updateConfig } from './server/config';
import { AssetId } from './server/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const port = 3000;

  app.use(express.json());

  // WebSocket Server on /ws
  const wss = new WebSocketServer({ server, path: '/ws' });
  marketHub.attachWebSocketServer(wss);

  // --- API Endpoints ---
  app.get('/api/health', (req, res) => {
    const status = marketHub.getStatus();
    res.json({
      status: 'UP',
      version: '3.1.0-RAPTOR',
      timestamp: Date.now(),
      ...status,
    });
  });

  app.get('/api/quotes', (req, res) => {
    res.json(marketHub.getAllQuotes());
  });

  app.get('/api/history/:asset', async (req, res) => {
    const asset = req.params.asset.toUpperCase() as AssetId;
    const history = await marketHub.getHistoryAsync(asset);
    res.json({
      asset,
      count: history.length,
      candles: history,
    });
  });

  app.get('/api/alerts', (req, res) => {
    res.json({
      alerts: marketHub.getAlerts(),
    });
  });

  app.get('/api/agents/operations', (req, res) => {
    res.json({
      operations: marketHub.getAgentOperations(),
    });
  });

  app.get('/api/news', async (req, res) => {
    const news = await marketHub.getNews();
    res.json({
      news,
      count: news.length,
      timestamp: Date.now(),
    });
  });

  // Server-Sent Events (SSE) para streaming garantido em proxies, iframes e navegadores
  app.get('/api/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const client = {
      send: (data: string) => {
        try {
          res.write(`data: ${data}\n\n`);
        } catch (e) {}
      },
    };

    marketHub.addSseClient(client);

    req.on('close', () => {
      marketHub.removeSseClient(client);
    });
  });

  app.post('/api/alerts/ack', (req, res) => {
    const { id } = req.body;
    const ok = marketHub.acknowledgeAlert(id);
    res.json({ success: ok });
  });

  app.post('/api/alerts/test', (req, res) => {
    const { asset, type, reason } = req.body;
    const price = req.body.price || 4153.5;
    const titlePt =
      type === 'BUY'
        ? `🟢 SINAL DE COMPRA CONFIRMADO NO ${asset || 'GOLD'}`
        : type === 'SELL'
        ? `🔴 SINAL DE VENDA CONFIRMADO NO ${asset || 'GOLD'}`
        : type === 'TARGET'
        ? `🎯 ALVO 1 ATINGIDO NO ${asset || 'GOLD'}`
        : type === 'WEAKENING'
        ? `⚠️ ENFRAQUECIMENTO DO FLUXO NO ${asset || 'GOLD'}`
        : type === 'STOP'
        ? `🛑 STOP LOSS TÉCNICO NO ${asset || 'GOLD'}`
        : `⚡ ALERTA DE TRADING NO ${asset || 'GOLD'}`;

    marketHub.triggerAlert({
      asset: asset || 'GOLD',
      type: type || 'BUY',
      price,
      targetPrice: type === 'BUY' ? price * 1.008 : price * 0.992,
      stopLossPrice: type === 'BUY' ? price * 0.996 : price * 1.004,
      riskReward: '1:2.0',
      timeframe: 'M5',
      confidence: 88,
      titlePt,
      reason: reason || 'Disparo de teste operacional emitido pelo usuário.',
      strategyStage: 'ENTRADA',
      severity: type === 'DATA_STALE' || type === 'STOP' ? 'CRITICAL' : 'WARNING',
    });
    res.json({ success: true });
  });

  app.get('/api/calendar', (req, res) => {
    res.json({
      events: marketHub.getCalendarEvents(),
    });
  });

  app.get('/api/config', (req, res) => {
    res.json(getConfig());
  });

  app.post('/api/config', (req, res) => {
    const updated = updateConfig(req.body);
    res.json({ success: true, config: updated });
  });

  app.post('/api/telegram/test', async (req, res) => {
    const text = req.body.text || '🔔 RAPTOR v3.1: Teste de alerta de trading recebido com sucesso.';
    const ok = await marketHub.sendTelegramNotification(text);
    res.json({ success: ok });
  });

  // Inicia os feeds do TradingView em segundo plano
  await marketHub.start();

  // Vite Integration
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(port, '0.0.0.0', () => {
    console.log(`[RAPTOR] Server listening on http://0.0.0.0:${port}`);
    console.log(`[RAPTOR] WebSocket ready at ws://0.0.0.0:${port}/ws`);
  });
}

startServer().catch((err) => {
  console.error('[RAPTOR] Startup error:', err);
  process.exit(1);
});
