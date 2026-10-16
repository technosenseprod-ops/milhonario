import React from 'react';
import { useRaptor } from '../../context/RaptorContext';
import { ShieldCheck, Wifi, Radio } from 'lucide-react';

export const InstitutionalComplianceNotice: React.FC = () => {
  const { selectedAsset, quotes, wsConnected, latencyMs } = useRaptor();
  const quote = quotes[selectedAsset];

  return (
    <div className="bg-white border-t border-slate-200 px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-slate-500">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="flex items-center gap-1.5 text-blue-700 font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>RAPTOR v3.1 INSTITUCIONAL</span>
        </span>
        <span className="text-slate-300">•</span>
        <span className="text-slate-600">
          ATIVOS OFICIAIS: <strong className="text-slate-900">GOLD</strong>, <strong className="text-slate-900">US100</strong>, <strong className="text-slate-900">HK.CASH</strong>, <strong className="text-slate-900">FRA40</strong>
        </span>
        <span className="text-slate-300">•</span>
        <span className="text-emerald-700 font-medium flex items-center gap-1">
          <Radio className="w-3 h-3 text-emerald-600" />
          FEED EXCLUSIVO TRADINGVIEW (100% AUTOMÁTICO)
        </span>
        <span className="text-slate-300">•</span>
        <span className="text-slate-500">
          GESTÃO DE LUCRO ASSIMÉTRICO (1:2.5)
        </span>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">ATIVO ATUAL:</span>
          <span className="text-blue-700 font-bold">{selectedAsset}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600">
          <Wifi className="w-3 h-3 text-emerald-600" />
          <span>{latencyMs}ms</span>
        </div>
      </div>
    </div>
  );
};
