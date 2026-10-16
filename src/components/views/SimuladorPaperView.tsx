import React from 'react';
import { useRaptor } from '../../context/RaptorContext';
import { OrderTicket } from '../terminal/OrderTicket';
import { RiskPortfolioManager } from '../portfolio/RiskPortfolioManager';
import { PlayCircle, ShieldCheck, Zap } from 'lucide-react';

export const SimuladorPaperView: React.FC = () => {
  return (
    <div className="space-y-4 font-mono text-xs text-slate-800">
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PlayCircle className="w-5 h-5 text-amber-600" />
          <h2 className="font-black text-sm text-slate-900 font-sans tracking-tight">
            SIMULADOR INSTITUCIONAL & EXECUÇÃO EM PAPEL (PAPER TRADING)
          </h2>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-300">
          AMBIENTE SEGURO • SLIPPAGE REALISTA
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-4">
          <OrderTicket />
        </div>
        <div className="lg:col-span-8">
          <RiskPortfolioManager />
        </div>
      </div>
    </div>
  );
};
