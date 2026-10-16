import React, { useEffect, useState } from 'react';
import { useRaptor } from '../../context/RaptorContext';
import { AssetId, MarketQuote } from '../../types/market';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  ShieldCheck, 
  Radio,
  Target,
  Zap
} from 'lucide-react';

const ASSET_DESCRIPTIONS: Record<AssetId, { label: string; sub: string; contract: string }> = {
  GOLD: { label: 'OURO SPOT (USD)', sub: 'Metal Precioso Internacional', contract: 'OANDA:XAUUSD' },
  US100: { label: 'NASDAQ-100 (EUA)', sub: 'Índice de Tecnologia dos EUA', contract: 'NASDAQ:NDX' },
  'HK.CASH': { label: 'HANG SENG (HK)', sub: 'Bolsa de Hong Kong', contract: 'HSI:HSI' },
  FRA40: { label: 'CAC 40 (PARIS)', sub: 'Euronext Paris', contract: 'EURONEXT:PX1' },
};

export const AssetCards: React.FC = () => {
  const { quotes, selectedAsset, setSelectedAsset } = useRaptor();
  const assets: AssetId[] = ['GOLD', 'US100', 'HK.CASH', 'FRA40'];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {assets.map((asset) => (
        <AssetCardItem
          key={asset}
          asset={asset}
          quote={quotes[asset]}
          isSelected={selectedAsset === asset}
          onSelect={() => setSelectedAsset(asset)}
        />
      ))}
    </div>
  );
};

interface AssetCardItemProps {
  asset: AssetId;
  quote: MarketQuote | null;
  isSelected: boolean;
  onSelect: () => void;
}

const AssetCardItem: React.FC<AssetCardItemProps> = ({ asset, quote, isSelected, onSelect }) => {
  const [flash, setFlash] = useState<'UP' | 'DOWN' | null>(null);
  const [lastPrice, setLastPrice] = useState<number>(quote?.price || 0);

  useEffect(() => {
    if (!quote?.price) return;
    if (quote.price > lastPrice && lastPrice !== 0) {
      setFlash('UP');
      const timer = setTimeout(() => setFlash(null), 700);
      setLastPrice(quote.price);
      return () => clearTimeout(timer);
    } else if (quote.price < lastPrice && lastPrice !== 0) {
      setFlash('DOWN');
      const timer = setTimeout(() => setFlash(null), 700);
      setLastPrice(quote.price);
      return () => clearTimeout(timer);
    }
    setLastPrice(quote.price);
  }, [quote?.price, lastPrice]);

  const meta = ASSET_DESCRIPTIONS[asset];
  const isUp = (quote?.change ?? 0) >= 0;

  const formatPrice = (val?: number) => {
    if (val === undefined || isNaN(val)) return '--.--';
    return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getSignalBadge = () => {
    const signal = quote?.trendSignal || 'NEUTRO';
    const confidence = quote?.confidence || 80;
    if (signal === 'COMPRA') {
      return {
        label: `COMPRA (${confidence}%)`,
        style: 'bg-emerald-950 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-500/20',
      };
    }
    if (signal === 'VENDA') {
      return {
        label: `VENDA (${confidence}%)`,
        style: 'bg-rose-950 text-rose-300 border-rose-500/50 shadow-sm shadow-rose-500/20',
      };
    }
    return {
      label: 'MONITORANDO',
      style: 'bg-slate-900 text-slate-400 border-slate-700',
    };
  };

  const signalBadge = getSignalBadge();

  return (
    <div
      onClick={onSelect}
      className={`relative cursor-pointer rounded-xl border p-3.5 transition-all duration-200 select-none overflow-hidden ${
        isSelected
          ? 'bg-slate-900/95 border-emerald-500/80 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/40'
          : 'bg-slate-950/80 border-slate-800/80 hover:bg-slate-900/60 hover:border-slate-700'
      } ${
        flash === 'UP'
          ? 'ring-1 ring-emerald-500/80 bg-emerald-950/30'
          : flash === 'DOWN'
          ? 'ring-1 ring-rose-500/80 bg-rose-950/30'
          : ''
      }`}
    >
      {/* Cabeçalho do Card */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono font-bold tracking-wider text-slate-100">
              {meta.label}
            </span>
            {isSelected && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            )}
          </div>
          <span className="text-[10px] text-slate-400 block font-mono">
            {meta.contract}
          </span>
        </div>

        {/* Badge do Sinal do Agente */}
        <span
          className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold border ${signalBadge.style}`}
        >
          {signalBadge.label}
        </span>
      </div>

      {/* Preço de Cotação em Tempo Real */}
      <div className="flex items-baseline justify-between my-2 font-mono">
        <span
          className={`text-xl font-black tracking-tight transition-colors duration-150 ${
            flash === 'UP'
              ? 'text-emerald-400 scale-105'
              : flash === 'DOWN'
              ? 'text-rose-400 scale-105'
              : 'text-slate-100'
          }`}
        >
          {formatPrice(quote?.price)}
        </span>

        <div
          className={`flex items-center gap-1 text-xs font-bold ${
            isUp ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          <span>
            {isUp ? '+' : ''}
            {quote?.changePercent ? quote.changePercent.toFixed(2) : '0.00'}%
          </span>
        </div>
      </div>

      {/* Métricas do Livro & Conexão TradingView */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
        <div className="flex items-center gap-1">
          <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span className="text-emerald-300 font-semibold">TRADINGVIEW AO VIVO</span>
        </div>

        <div>
          <span>MÁX: </span>
          <span className="text-slate-300">{formatPrice(quote?.high)}</span>
        </div>
      </div>
    </div>
  );
};
