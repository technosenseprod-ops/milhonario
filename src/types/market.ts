export type AssetId = 'GOLD' | 'US100' | 'HK.CASH' | 'FRA40';

export type ProviderType = 
  | 'TRADINGVIEW' 
  | 'YAHOO_REFERENCE' 
  | 'NONE';

export type PageTab = 
  | 'SALA_OPERACOES' 
  | 'PAINEL_ATIVO' 
  | 'SCANNER_OPORTUNIDADES' 
  | 'CONSELHO_AGENTES' 
  | 'PESQUISA_QUANT' 
  | 'RISCO_LIMITES' 
  | 'SIMULADOR_PAPER' 
  | 'DIARIO_TRADES' 
  | 'EVENTOS_MACRO' 
  | 'CONFIGURACOES_APIS';

export interface MarketQuote {
  asset: AssetId;
  name: string;
  price: number;
  bid: number;
  ask: number;
  spread: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  volume: number;
  timestamp: number;
  provider: ProviderType;
  isReferenceOnly: boolean;
  connected: boolean;
  latencyMs: number;
  symbolUsed: string;
  lastUpdateIso: string;
  statusText: string;
  trendSignal?: 'COMPRA' | 'VENDA' | 'NEUTRO';
  confidence?: number;
}

export interface OhlcCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export type AlertType = 
  | 'BUY' 
  | 'SELL' 
  | 'WEAKENING' 
  | 'EXIT' 
  | 'REVERSAL' 
  | 'STOP' 
  | 'TARGET' 
  | 'DATA_STALE';

export interface AgentOperation {
  id: string;
  agentName: string;
  agentCodename: string;
  asset: AssetId;
  side: 'BUY' | 'SELL';
  entryPrice: number;
  currentPrice: number;
  targetPrice1: number;
  targetPrice2: number;
  stopLossPrice: number;
  lotSize: number;
  pnlUsd: number;
  pnlPercent: number;
  status: 'ABERTA' | 'PARCIAL_BREAKEVEN' | 'ALVO_ATINGIDO' | 'STOP_EXECUTADO';
  openTime: number;
  closeTime?: number;
  timeframe: string; // 'M15'
  confluenceScore: number;
  entryReason: string;
  exitReason?: string;
}

export interface AlertSignal {
  id: string;
  asset: AssetId;
  type: AlertType;
  price: number;
  targetPrice?: number;     // Alvo de Lucro (Take Profit)
  stopLossPrice?: number;   // Stop Loss Técnico
  riskReward?: string;      // Relação Risco:Retorno (ex: 1:2.5)
  timeframe?: string;       // Tempo gráfico analisado (ex: M5 / M15)
  confidence?: number;      // Convicção institucional % (ex: 88%)
  titlePt: string;          // Título em linguagem natural de trading
  reason: string;           // Racional operacional completo em português
  strategyStage?: 'ENTRADA' | 'PROGRESSAO' | 'PROTECAO' | 'ENCERRAMENTO';
  timestamp: number;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  acknowledged: boolean;
  referenceOnly: boolean;
  triggeredValue?: string;
}

export interface Position {
  id: string;
  asset: AssetId;
  side: 'BUY' | 'SELL';
  entryPrice: number;
  currentPrice: number;
  lotSize: number;
  targetPrice: number;
  stopLossPrice: number;
  pnl: number;
  pnlPercent: number;
  openTime: number;
  status: 'OPEN' | 'PARTIAL' | 'CLOSED';
}

export interface TradeRecord {
  id: string;
  asset: AssetId;
  side: 'BUY' | 'SELL';
  entryPrice: number;
  exitPrice: number;
  lotSize: number;
  pnl: number;
  result: 'WIN' | 'LOSS';
  openTime: number;
  closeTime: number;
  reason: string;
}

export interface MacroEvent {
  id: string;
  country: string;
  event: string;
  date: string;
  time: string;
  actual: string | null;
  forecast: string | null;
  previous: string | null;
  importance: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface AssetSymbolConfig {
  tradingView: string;
  yahoo: string;
  description: string;
}

export interface ServerConfig {
  autoConnectTradingView: boolean;
  minConfidenceFilter: number;
  timeframe: string;
  symbols: Record<AssetId, AssetSymbolConfig>;
  openApiKeys?: {
    finnhub?: string;
    alphaVantage?: string;
    twelveData?: string;
    providerPreference?: 'AUTO' | 'TRADINGVIEW_YAHOO' | 'FINNHUB' | 'ALPHAVANTAGE' | 'TWELVEDATA';
  };
  telegram: {
    botToken: string;
    chatId: string;
    enabled: boolean;
  };
}

export interface HubStatus {
  online: boolean;
  uptimeSeconds: number;
  activeClientsCount: number;
  providers: {
    tradingView: { connected: boolean; status: string; lastPing: number };
    yahoo: { active: boolean; lastPoll: number };
  };
  assets: Record<AssetId, {
    connected: boolean;
    provider: ProviderType;
    price: number;
    lastTickAgeMs: number;
    stale: boolean;
    signal?: 'COMPRA' | 'VENDA' | 'NEUTRO';
    confidence?: number;
  }>;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  url?: string;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  relatedAsset: AssetId;
}
