import React, { useState } from 'react';
import { useRaptor } from '../../context/RaptorContext';
import { AssetId } from '../../types/market';
import { OrderTicket } from '../terminal/OrderTicket';
import { DepthOfMarket } from '../terminal/DepthOfMarket';
import { TradingViewChart } from '../terminal/TradingViewChart';
import { 
  BarChart3, 
  Activity, 
  Layers, 
  TrendingUp, 
  ShieldCheck, 
  Radio, 
  Zap,
  Clock
} from 'lucide-react';

export const PainelAtivoView: React.FC = () => {
  const { selectedAsset, setSelectedAsset, quotes } = useRaptor();
  const quote = quotes[selectedAsset];
  const price = quote?.price || (selectedAsset === 'GOLD' ? 4187.7 : selectedAsset === 'US100' ? 31336.4 : selectedAsset === 'HK.CASH' ? 24280.5 : 7860.2);

  const assetsList: { id: AssetId; label: string; contract: string }[] = [
    { id: 'GOLD', label: 'OURO (COMEX:GC1!)', contract: 'COMEX:GC1!' },
    { id: 'US100', label: 'NASDAQ-100 (NDX)', contract: 'NASDAQ:NDX' },
    { id: 'HK.CASH', label: 'HANG SENG (HSI)', contract: 'HSI:HSI' },
    { id: 'FRA40', label: 'CAC 40 (PX1)', contract: 'EURONEXT:PX1' },
  ];

  return (
    <div className="space-y-3.5 font-sans text-slate-800">
      {/* Asset Selector Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs font-mono">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h2 className="font-black text-sm text-slate-900 tracking-tight">
              PAINEL DO ATIVO & MICROESTRUTURA (4/4)
            </h2>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-md">
            {assetsList.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelectedAsset(a.id)}
                className={`px-3 py-1 rounded text-xs font-bold transition ${
                  selectedAsset === a.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Chart + Order Ticket & DOM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        <div className="lg:col-span-8 flex flex-col space-y-3.5">
          <TradingViewChart />

          {/* Tape / Fluxo em Tempo Real */}
          <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <strong className="text-slate-900 font-sans">FITA DE NEGÓCIOS (TIME & SALES / TAPE)</strong>
              <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                STREAM TRADINGVIEW
              </span>
            </div>

            <div className="grid grid-cols-4 text-[10px] text-slate-400 py-1 border-b border-slate-100">
              <span>HORÁRIO</span>
              <span>PREÇO</span>
              <span>VOLUME</span>
              <span className="text-right">AGRESSOR</span>
            </div>

            <div className="space-y-1 pt-1 max-h-36 overflow-y-auto text-[11px]">
              {[
                { t: '14:32:18', p: price.toFixed(2), v: '12.5 L', agg: 'COMPRA', col: 'text-emerald-600 font-bold' },
                { t: '14:32:16', p: (price - 0.05).toFixed(2), v: '5.0 L', agg: 'COMPRA', col: 'text-emerald-600 font-bold' },
                { t: '14:32:14', p: (price - 0.10).toFixed(2), v: '8.2 L', agg: 'VENDA', col: 'text-rose-600 font-bold' },
                { t: '14:32:11', p: (price + 0.05).toFixed(2), v: '20.0 L', agg: 'COMPRA (BLOCO)', col: 'text-emerald-600 font-black' },
                { t: '14:32:08', p: price.toFixed(2), v: '2.0 L', agg: 'VENDA', col: 'text-rose-600 font-bold' },
              ].map((trade, i) => (
                <div key={i} className="grid grid-cols-4 items-center py-0.5">
                  <span className="text-slate-400">{trade.t}</span>
                  <span className="font-bold text-slate-900">{trade.p}</span>
                  <span className="text-slate-600">{trade.v}</span>
                  <span className={`text-right ${trade.col}`}>{trade.agg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col space-y-3.5">
          <div className="h-[280px]">
            <OrderTicket />
          </div>

          <div className="h-[260px]">
            <DepthOfMarket />
          </div>
        </div>
      </div>
    </div>
  );
};
