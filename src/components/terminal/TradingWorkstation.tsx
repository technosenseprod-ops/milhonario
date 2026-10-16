import React from 'react';
import { useRaptor } from '../../context/RaptorContext';
import { AssetCards } from './AssetCards';
import { TradingViewChart } from './TradingViewChart';
import { OrderTicket } from './OrderTicket';
import { DepthOfMarket } from './DepthOfMarket';
import { AlertCommandCenter } from './AlertCommandCenter';
import { MacroCalendar } from './MacroCalendar';
import { ShieldCheck } from 'lucide-react';

export const TradingWorkstation: React.FC = () => {
  const { selectedAsset, quotes } = useRaptor();
  const quote = quotes[selectedAsset];

  return (
    <div className="space-y-3.5 flex flex-col flex-1">
      {/* 1. Matriz de Ativos Superiores */}
      <AssetCards />

      {/* 2. Área Central de Gráficos e Operações */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 flex-1">
        {/* Coluna Esquerda: Gráfico Interativo + Telemetria de Preço */}
        <div className="lg:col-span-8 flex flex-col space-y-3.5">
          <TradingViewChart />

          {/* Micro-Telemetria Institucional */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono">
            <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80">
              <span className="text-slate-500 text-[10px] block">MÁXIMA / MÍNIMA DO DIA</span>
              <span className="text-slate-200 font-bold">
                {quote?.high?.toFixed(2) || '--'} / {quote?.low?.toFixed(2) || '--'}
              </span>
            </div>

            <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80">
              <span className="text-slate-500 text-[10px] block">FECHAMENTO ANTERIOR</span>
              <span className="text-slate-200 font-bold">
                {quote?.previousClose?.toFixed(2) || '--'}
              </span>
            </div>

            <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80">
              <span className="text-slate-500 text-[10px] block">FONTE INSTITUCIONAL</span>
              <span className="text-emerald-400 font-bold truncate block">
                TRADINGVIEW DIRETO (0 CHAVES)
              </span>
            </div>

            <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80">
              <span className="text-slate-500 text-[10px] block">QUALIDADE DO FEED</span>
              <span className="text-slate-200 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% REAL</span>
              </span>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Boleta de Execução e Livro DOM Nível 2 */}
        <div className="lg:col-span-4 flex flex-col space-y-3.5">
          <div className="h-[280px]">
            <OrderTicket />
          </div>

          <div className="h-[240px]">
            <DepthOfMarket />
          </div>
        </div>
      </div>

      {/* 3. Linha Inferior: Central de Sinais dos Agentes e Calendário */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        <div className="lg:col-span-8 min-h-[300px]">
          <AlertCommandCenter />
        </div>
        <div className="lg:col-span-4 min-h-[300px]">
          <MacroCalendar />
        </div>
      </div>
    </div>
  );
};
