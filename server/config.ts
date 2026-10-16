import dotenv from 'dotenv';
import { ServerConfig } from './types';

dotenv.config();

export const DEFAULT_CONFIG: ServerConfig = {
  autoConnectTradingView: true,
  minConfidenceFilter: 70, // Filtro de qualidade: alertas apenas com convicção >= 70%
  timeframe: 'M5',
  symbols: {
    GOLD: {
      tradingView: 'COMEX:GC1!',
      yahoo: 'GC=F',
      description: 'Ouro Futuro COMEX / USD (Contrato Contínuo)',
    },
    US100: {
      tradingView: 'NASDAQ:NDX',
      yahoo: '^NDX',
      description: 'Nasdaq-100 (Índice de Tecnologia dos EUA)',
    },
    'HK.CASH': {
      tradingView: 'HSI:HSI',
      yahoo: '^HSI',
      description: 'Hang Seng (Índice de Hong Kong)',
    },
    FRA40: {
      tradingView: 'EURONEXT:PX1',
      yahoo: '^FCHI',
      description: 'CAC 40 (Bolsa de Paris / Euronext)',
    },
  },
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    chatId: process.env.TELEGRAM_CHAT_ID || '',
    enabled: Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
  },
};

let currentConfig: ServerConfig = { ...DEFAULT_CONFIG };

export function getConfig(): ServerConfig {
  return currentConfig;
}

export function updateConfig(partial: Partial<ServerConfig>): ServerConfig {
  currentConfig = {
    ...currentConfig,
    ...partial,
    symbols: {
      ...currentConfig.symbols,
      ...(partial.symbols || {}),
    },
    telegram: {
      ...currentConfig.telegram,
      ...(partial.telegram || {}),
    },
  };
  return currentConfig;
}
