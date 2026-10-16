import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { 
  AssetId, 
  MarketQuote, 
  AlertSignal, 
  HubStatus, 
  ServerConfig, 
  OhlcCandle,
  PageTab,
  Position,
  TradeRecord,
  AgentOperation,
  NewsItem
} from '../types/market';
import { playAlertSound, setAudioArmed as setAudioServiceArmed, getIsAudioArmed } from '../services/audioAlerts';

interface RaptorContextType {
  // Navegação
  activeTab: PageTab;
  setActiveTab: (tab: PageTab) => void;

  // Cotações e Ativos
  quotes: Record<AssetId, MarketQuote | null>;
  liveCandles: Record<AssetId, OhlcCandle | null>;
  selectedAsset: AssetId;
  setSelectedAsset: (asset: AssetId) => void;

  // Sinais e Alertas
  alerts: AlertSignal[];
  agentOperations: AgentOperation[];
  news: NewsItem[];
  activeOverlayAlert: AlertSignal | null;
  dismissOverlayAlert: () => void;
  acknowledgeAlert: (id: string) => Promise<void>;
  triggerTestAlert: (asset: AssetId, type: string) => Promise<void>;
  approveAgentOperation: (op: AgentOperation) => void;

  // Posições e Carteira
  positions: Position[];
  tradeJournal: TradeRecord[];
  openPosition: (asset: AssetId, side: 'BUY' | 'SELL', lotSize?: number, targetPrice?: number, stopLossPrice?: number) => void;
  closePosition: (id: string, reason?: string) => void;
  partialClosePosition: (id: string) => void;
  executeSignalOrder: (signal: AlertSignal, lotSize?: number) => void;

  // Servidor & Telemetria
  status: HubStatus | null;
  config: ServerConfig | null;
  updateServerConfig: (partial: Partial<ServerConfig>) => Promise<boolean>;
  sendTelegramTest: () => Promise<boolean>;
  wsConnected: boolean;
  latencyMs: number;
  audioArmed: boolean;
  toggleAudioArmed: () => void;
  rawWsLogs: Array<{ time: string; event: string; detail: string }>;
  fetchHistory: (asset: AssetId) => Promise<OhlcCandle[]>;
}

const RaptorContext = createContext<RaptorContextType | null>(null);

export const RaptorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<PageTab>('SALA_OPERACOES');
  const [quotes, setQuotes] = useState<Record<AssetId, MarketQuote | null>>({
    GOLD: null,
    US100: null,
    'HK.CASH': null,
    FRA40: null,
  });
  const [liveCandles, setLiveCandles] = useState<Record<AssetId, OhlcCandle | null>>({
    GOLD: null,
    US100: null,
    'HK.CASH': null,
    FRA40: null,
  });
  const [selectedAsset, setSelectedAsset] = useState<AssetId>('GOLD');
  const [alerts, setAlerts] = useState<AlertSignal[]>([]);
  const [agentOperations, setAgentOperations] = useState<AgentOperation[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [activeOverlayAlert, setActiveOverlayAlert] = useState<AlertSignal | null>(null);
  const [status, setStatus] = useState<HubStatus | null>(null);
  const [config, setConfig] = useState<ServerConfig | null>(null);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [latencyMs, setLatencyMs] = useState<number>(25);
  const [audioArmed, setAudioArmedState] = useState<boolean>(false);
  const [rawWsLogs, setRawWsLogs] = useState<Array<{ time: string; event: string; detail: string }>>([]);

  // Posições abertas e histórico de operações
  const [positions, setPositions] = useState<Position[]>(() => {
    try {
      const saved = localStorage.getItem('raptor_positions');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [tradeJournal, setTradeJournal] = useState<TradeRecord[]>(() => {
    try {
      const saved = localStorage.getItem('raptor_trade_journal');
      return saved ? JSON.parse(saved) : [
        {
          id: 'TJ_1',
          asset: 'GOLD',
          side: 'BUY',
          entryPrice: 4142.10,
          exitPrice: 4165.50,
          lotSize: 1.0,
          pnl: 2340.0,
          result: 'WIN',
          openTime: Date.now() - 3600000 * 2,
          closeTime: Date.now() - 3600000,
          reason: 'Alvo 1 + Alvo 2 Atingido com Sucesso (1:2.5)',
        },
        {
          id: 'TJ_2',
          asset: 'US100',
          side: 'BUY',
          entryPrice: 30650.0,
          exitPrice: 30820.0,
          lotSize: 2.0,
          pnl: 3400.0,
          result: 'WIN',
          openTime: Date.now() - 3600000 * 5,
          closeTime: Date.now() - 3600000 * 4,
          reason: 'Rompimento de Resistência Nasdaq (M5)',
        },
      ];
    } catch (e) {
      return [];
    }
  });

  const wsRef = useRef<WebSocket | null>(null);

  // Persiste posições no localStorage
  useEffect(() => {
    try {
      localStorage.setItem('raptor_positions', JSON.stringify(positions));
    } catch (e) {}
  }, [positions]);

  useEffect(() => {
    try {
      localStorage.setItem('raptor_trade_journal', JSON.stringify(tradeJournal));
    } catch (e) {}
  }, [tradeJournal]);

  const addWsLog = useCallback((event: string, detail: string) => {
    const time = new Date().toLocaleTimeString('pt-BR');
    setRawWsLogs((prev) => [{ time, event, detail }, ...prev.slice(0, 49)]);
  }, []);

  const toggleAudioArmed = useCallback(() => {
    const next = !audioArmed;
    setAudioArmedState(next);
    setAudioServiceArmed(next);
  }, [audioArmed]);

  // Atualiza PnL flutuante das posições com base nos ticks do TradingView
  useEffect(() => {
    setPositions((prevPositions) => {
      if (prevPositions.length === 0) return prevPositions;
      return prevPositions.map((pos) => {
        const q = quotes[pos.asset];
        if (!q || !q.price) return pos;
        const currentPrice = q.price;
        const diff = pos.side === 'BUY' ? currentPrice - pos.entryPrice : pos.entryPrice - currentPrice;
        // PnL para lote padrão
        const multiplier = pos.asset === 'GOLD' ? 100 : pos.asset === 'US100' ? 20 : 10;
        const pnl = parseFloat((diff * pos.lotSize * multiplier).toFixed(2));
        const pnlPercent = parseFloat(((diff / pos.entryPrice) * 100).toFixed(2));

        return {
          ...pos,
          currentPrice,
          pnl,
          pnlPercent,
        };
      });
    });
  }, [quotes]);

  // Abre nova posição
  const openPosition = useCallback((
    asset: AssetId,
    side: 'BUY' | 'SELL',
    lotSize: number = 1.0,
    targetPrice?: number,
    stopLossPrice?: number
  ) => {
    const quote = quotes[asset];
    const currentPrice = quote?.price || 4153.5;
    const defaultTarget = side === 'BUY' ? currentPrice * 1.008 : currentPrice * 0.992;
    const defaultStop = side === 'BUY' ? currentPrice * 0.996 : currentPrice * 1.004;

    const newPos: Position = {
      id: `POS_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      asset,
      side,
      entryPrice: currentPrice,
      currentPrice,
      lotSize,
      targetPrice: targetPrice || parseFloat(defaultTarget.toFixed(2)),
      stopLossPrice: stopLossPrice || parseFloat(defaultStop.toFixed(2)),
      pnl: 0,
      pnlPercent: 0,
      openTime: Date.now(),
      status: 'OPEN',
    };

    setPositions((prev) => [newPos, ...prev]);
    addWsLog('ORDEM_EXECUTADA', `${side} ${lotSize} lotes em ${asset} @ ${currentPrice}`);
  }, [quotes, addWsLog]);

  // Executa ordem a partir de sinal do Agente
  const executeSignalOrder = useCallback((signal: AlertSignal, lotSize: number = 1.0) => {
    const side = signal.type === 'SELL' ? 'SELL' : 'BUY';
    openPosition(signal.asset, side, lotSize, signal.targetPrice, signal.stopLossPrice);
  }, [openPosition]);

  // Aprova operação recomendada pelo Agente
  const approveAgentOperation = useCallback((op: AgentOperation) => {
    openPosition(op.asset, op.side, op.lotSize, op.targetPrice1, op.stopLossPrice);
    addWsLog('OPERACAO_AGENTE_APROVADA', `Operação aprovada: ${op.side} ${op.lotSize}L em ${op.asset} @ ${op.currentPrice}`);
  }, [openPosition, addWsLog]);

  // Encerra posição a mercado
  const closePosition = useCallback((id: string, reason: string = 'Fechamento a mercado') => {
    setPositions((prev) => {
      const target = prev.find((p) => p.id === id);
      if (!target) return prev;

      // Adiciona ao diário de trades
      const record: TradeRecord = {
        id: `TR_${Date.now()}`,
        asset: target.asset,
        side: target.side,
        entryPrice: target.entryPrice,
        exitPrice: target.currentPrice,
        lotSize: target.lotSize,
        pnl: target.pnl,
        result: target.pnl >= 0 ? 'WIN' : 'LOSS',
        openTime: target.openTime,
        closeTime: Date.now(),
        reason,
      };

      setTradeJournal((journal) => [record, ...journal]);
      addWsLog('POSICAO_ENCERRADA', `${target.side} ${target.asset} encerrada com PnL: $${target.pnl}`);
      return prev.filter((p) => p.id !== id);
    });
  }, [addWsLog]);

  // Realização parcial de lucro (50%)
  const partialClosePosition = useCallback((id: string) => {
    setPositions((prev) => {
      return prev.map((pos) => {
        if (pos.id !== id) return pos;
        const closedLots = pos.lotSize / 2;
        const partialPnl = parseFloat((pos.pnl / 2).toFixed(2));

        const record: TradeRecord = {
          id: `TR_PARTIAL_${Date.now()}`,
          asset: pos.asset,
          side: pos.side,
          entryPrice: pos.entryPrice,
          exitPrice: pos.currentPrice,
          lotSize: closedLots,
          pnl: partialPnl,
          result: partialPnl >= 0 ? 'WIN' : 'LOSS',
          openTime: pos.openTime,
          closeTime: Date.now(),
          reason: 'Realização Parcial de 50% de Lucro (Alvo 1)',
        };

        setTradeJournal((journal) => [record, ...journal]);
        addWsLog('PARCIAL_REALIZADA', `50% realizado em ${pos.asset}. Stop movido para entrada (Breakeven).`);

        return {
          ...pos,
          lotSize: closedLots,
          stopLossPrice: pos.entryPrice, // move para breakeven
          status: 'PARTIAL',
        };
      });
    });
  }, [addWsLog]);

  // Conexão com o WebSocket central
  useEffect(() => {
    let reconnectTimeout: any = null;
    let isUnmounted = false;
    let eventSource: EventSource | null = null;

    const processIncomingMessage = (data: any) => {
      if (!data) return;

      if (data.type === 'SNAPSHOT') {
        if (data.quotes) setQuotes(data.quotes);
        if (data.alerts) setAlerts(data.alerts);
        if (data.agentOperations) setAgentOperations(data.agentOperations);
        if (data.news) setNews(data.news);
        if (data.status) setStatus(data.status);
        if (data.config) setConfig(data.config);
      } else if (data.type === 'TICK') {
        const quote: MarketQuote = data.quote;
        if (quote && quote.asset) {
          setQuotes((prev) => ({
            ...prev,
            [quote.asset]: quote,
          }));
          if (data.candle) {
            setLiveCandles((prev) => ({
              ...prev,
              [quote.asset]: data.candle,
            }));
          }
          if (data.operations) {
            setAgentOperations(data.operations);
          }
          if (data.latencyMs) setLatencyMs(data.latencyMs);
        }
      } else if (data.type === 'ALERT') {
        const signal: AlertSignal = data.alert;
        setAlerts((prev) => [signal, ...prev.slice(0, 79)]);
        setActiveOverlayAlert(signal);
        addWsLog('SINAL_AGENTE', `${signal.titlePt} @ ${signal.price}`);

        if (getIsAudioArmed()) {
          playAlertSound(signal.type);
        }
      } else if (data.type === 'ALERT_ACKNOWLEDGED') {
        setAlerts((prev) =>
          prev.map((a) => (a.id === data.id ? { ...a, acknowledged: true } : a))
        );
      }
    };

    // 1. Conexão Primária WebSocket
    function connectWs() {
      if (isUnmounted) return;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (isUnmounted) return;
          setWsConnected(true);
          addWsLog('CONECTADO_WS', 'Feed WebSocket TradingView institucional conectado');
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            processIncomingMessage(data);
          } catch (e: any) {
            console.error('[WebSocket] Erro ao processar:', e);
          }
        };

        ws.onclose = () => {
          if (isUnmounted) return;
          setWsConnected(false);
          reconnectTimeout = setTimeout(connectWs, 2500);
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch (e) {
        reconnectTimeout = setTimeout(connectWs, 2500);
      }
    }

    connectWs();

    // 2. Conexão Redundante Server-Sent Events (SSE) - Garante fluxo ao vivo mesmo com proxies/Cloud Run
    try {
      eventSource = new EventSource('/api/stream');
      eventSource.onopen = () => {
        if (!isUnmounted) setWsConnected(true);
      };
      eventSource.onmessage = (event) => {
        if (isUnmounted) return;
        try {
          const data = JSON.parse(event.data);
          processIncomingMessage(data);
          setWsConnected(true);
        } catch (e) {}
      };
      eventSource.onerror = () => {
        // O navegador reconecta SSE automaticamente
      };
    } catch (e) {
      console.warn('[SSE] EventSource não suportado:', e);
    }

    // 3. Fallback contínuo de alta frequência (1.5s)
    const pollInterval = setInterval(() => {
      fetch('/api/quotes')
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            setQuotes(data);
            setWsConnected(true);
          }
        })
        .catch(() => {});

      fetch('/api/agents/operations')
        .then((res) => res.json())
        .then((data) => {
          if (data.operations) setAgentOperations(data.operations);
        })
        .catch(() => {});

      fetch('/api/news')
        .then((res) => res.json())
        .then((data) => {
          if (data.news) setNews(data.news);
        })
        .catch(() => {});

      fetch('/api/health')
        .then((res) => res.json())
        .then((data) => setStatus(data))
        .catch(() => {});
    }, 1500);

    return () => {
      isUnmounted = true;
      clearInterval(pollInterval);
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (wsRef.current) wsRef.current.close();
      if (eventSource) eventSource.close();
    };
  }, [addWsLog]);

  const dismissOverlayAlert = useCallback(() => {
    setActiveOverlayAlert(null);
  }, []);

  const acknowledgeAlert = useCallback(async (id: string) => {
    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ action: 'ACK_ALERT', id }));
      } else {
        await fetch(`/api/alerts/${id}/ack`, { method: 'POST' });
      }
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
      );
    } catch (e) {
      console.error(e);
    }
  }, []);

  const triggerTestAlert = useCallback(async (asset: AssetId, type: string) => {
    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            action: 'TEST_ALERT',
            asset,
            alertType: type,
            reason: `Disparo de teste operacional manual em ${asset}`,
          })
        );
      } else {
        await fetch('/api/alerts/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ asset, type }),
        });
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const updateServerConfig = useCallback(async (partial: Partial<ServerConfig>): Promise<boolean> => {
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partial),
      });
      if (res.ok) {
        const data = await res.json();
        setConfig(data.config);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }, []);

  const sendTelegramTest = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/telegram/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🟢 <b>RAPTOR v3.1 — TESTE DE SINAL OPERACIONAL</b>\nVerificação de alerta instantâneo via Telegram.\nFeed TradingView: Ativo\nHorário: ${new Date().toLocaleTimeString('pt-BR')}`,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.success;
      }
      return false;
    } catch (e) {
      return false;
    }
  }, []);

  const fetchHistory = useCallback(async (asset: AssetId): Promise<OhlcCandle[]> => {
    try {
      const res = await fetch(`/api/history/${asset}`);
      if (res.ok) {
        const data = await res.json();
        return data.candles || [];
      }
      return [];
    } catch (e) {
      return [];
    }
  }, []);

  return (
    <RaptorContext.Provider
      value={{
        activeTab,
        setActiveTab,
        quotes,
        liveCandles,
        selectedAsset,
        setSelectedAsset,
        alerts,
        agentOperations,
        news,
        activeOverlayAlert,
        dismissOverlayAlert,
        acknowledgeAlert,
        triggerTestAlert,
        approveAgentOperation,
        positions,
        tradeJournal,
        openPosition,
        closePosition,
        partialClosePosition,
        executeSignalOrder,
        status,
        config,
        updateServerConfig,
        sendTelegramTest,
        wsConnected,
        latencyMs,
        audioArmed,
        toggleAudioArmed,
        rawWsLogs,
        fetchHistory,
      }}
    >
      {children}
    </RaptorContext.Provider>
  );
};

export const useRaptor = () => {
  const ctx = useContext(RaptorContext);
  if (!ctx) throw new Error('useRaptor must be used within RaptorProvider');
  return ctx;
};
