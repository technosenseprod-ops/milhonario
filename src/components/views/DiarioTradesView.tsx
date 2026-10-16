import React from 'react';
import { useRaptor } from '../../context/RaptorContext';
import { BookOpen, ArrowUpRight, ArrowDownRight, CheckCircle, ShieldCheck } from 'lucide-react';

export const DiarioTradesView: React.FC = () => {
  const { tradeJournal } = useRaptor();
  const wins = tradeJournal.filter((t) => t.result === 'WIN').length;
  const winRate = tradeJournal.length > 0 ? ((wins / tradeJournal.length) * 100).toFixed(1) : '100.0';
  const totalPnl = tradeJournal.reduce((acc, t) => acc + t.pnl, 0);

  return (
    <div className="space-y-4 font-mono text-xs text-slate-800">
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-slate-600" />
            <h2 className="font-black text-sm text-slate-900 font-sans tracking-tight">
              DIÁRIO DE TRADES & AUDITORIA DE ORDENS (AUDIT TRAIL)
            </h2>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
            TOTAL: {tradeJournal.length} TRADES AUDITADOS
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-3 text-center">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 block">TAXA DE ASSERTIVIDADE</span>
            <span className="text-base font-black text-emerald-600">{winRate}% WINRATE</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 block">LUCRO LÍQUIDO REALIZADO</span>
            <span className={`text-base font-black ${totalPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 block">RELAÇÃO DE ASSIMETRIA MÉDIA</span>
            <span className="text-base font-black text-blue-600">1 : 2.50 R</span>
          </div>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase border-y border-slate-200">
              <tr>
                <th className="py-2 px-3">DATA / HORA</th>
                <th className="py-2 px-3">ATIVO</th>
                <th className="py-2 px-3">LADO</th>
                <th className="py-2 px-3">LOTE</th>
                <th className="py-2 px-3">ENTRADA</th>
                <th className="py-2 px-3">SAÍDA</th>
                <th className="py-2 px-3">RESULTADO (PNL)</th>
                <th className="py-2 px-3">RACIONAL TÉCNICO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tradeJournal.map((t) => {
                const isWin = t.result === 'WIN';
                return (
                  <tr key={t.id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 text-slate-500">{new Date(t.closeTime).toLocaleString('pt-BR')}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{t.asset}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        t.side === 'BUY' ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' : 'bg-rose-50 text-rose-700 border border-rose-300'
                      }`}>
                        {t.side}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">{t.lotSize}</td>
                    <td className="py-2.5 px-3 text-slate-700">{t.entryPrice.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-slate-700">{t.exitPrice.toFixed(2)}</td>
                    <td className="py-2.5 px-3">
                      <span className={`font-bold ${isWin ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isWin ? '+' : ''}${t.pnl.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-sans">{t.reason}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
