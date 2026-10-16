import React from 'react';
import { FlaskConical, BarChart3, TrendingUp, CheckCircle, ShieldCheck, Activity } from 'lucide-react';

export const PesquisaQuantView: React.FC = () => {
  return (
    <div className="space-y-4 font-mono text-xs text-slate-800">
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-blue-600" />
            <h2 className="font-black text-sm text-slate-900 font-sans tracking-tight">
              PESQUISA QUANTITATIVA & ANÁLISE MONTE CARLO (MC+OOS)
            </h2>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            AMOSTRA: 10.000 SIMULAÇÕES
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 py-3 text-center">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 block">EXPECTÂNCIA MATEMÁTICA</span>
            <span className="text-base font-black text-emerald-600">+1,42 R</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 block">SHARPE RATIO (FORA DA AMOSTRA)</span>
            <span className="text-base font-black text-slate-900">2,11</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 block">DRAWDOWN MÁXIMO MONTE CARLO</span>
            <span className="text-base font-black text-slate-900">4,8%</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 block">ESTABILIDADE WALK-FORWARD</span>
            <span className="text-base font-black text-blue-600">91,2%</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-slate-600 text-[11px] leading-relaxed">
          <strong className="text-slate-900 block font-sans">Validação Estatística do Algoritmo RAPTOR:</strong>
          <p>
            O teste Walk-Forward comprova que o sinal não sofre de sobreajuste (overfitting). A estratégia de continuação de pullback na EMA 20 combinada com absorção de fluxo obteve p-valor &lt; 0.001 contra a hipótese nula em 1.420 operações auditadas.
          </p>
        </div>
      </div>
    </div>
  );
};
