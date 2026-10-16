import React, { useState } from 'react';
import { useRaptor } from '../../context/RaptorContext';
import { 
  Briefcase, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  ShieldAlert, 
  Calculator, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  Layers,
  DollarSign
} from 'lucide-react';

export const RiskPortfolioManager: React.FC = () => {
  const { positions, tradeJournal, closePosition, partialClosePosition, selectedAsset, quotes } = useRaptor();

  // Estado da Calculadora de Risco
  const [accountBalance, setAccountBalance] = useState<number>(10000);
  const [riskPercent, setRiskPercent] = useState<number>(1.0);
  const [stopPoints, setStopPoints] = useState<number>(10.0);

  // Cálculo da calculadora de lote
  const riskAmount = (accountBalance * riskPercent) / 100;
  const calculatedLots = parseFloat((riskAmount / (stopPoints * 100)).toFixed(2)) || 0.1;

  // Estatísticas do Portfólio
  const totalOpenPnl = positions.reduce((acc, p) => acc + p.pnl, 0);
  const totalClosedPnl = tradeJournal.reduce((acc, t) => acc + t.pnl, 0);
  const winningTrades = tradeJournal.filter((t) => t.result === 'WIN').length;
  const winRate = tradeJournal.length > 0 ? ((winningTrades / tradeJournal.length) * 100).toFixed(1) : '100.0';

  return (
    <div className="space-y-4 font-sans text-slate-800">
      {/* 1. Header com Métricas do Portfólio */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-mono">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase font-sans tracking-tight">
              GESTÃO DE RISCO & CARTEIRA DE OPERAÇÕES
            </h2>
            <p className="text-[11px] text-slate-500 font-sans">
              Controle de posições abertas, trailing stop de breakeven e dimensionamento de lote institucional
            </p>
          </div>
        </div>

        {/* Resumo de Lucro */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-right">
            <span className="text-[9px] text-slate-400 block">PNL FLUTUANTE (ABERTO)</span>
            <span className={`text-xs font-black ${totalOpenPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {totalOpenPnl >= 0 ? '+' : ''}${totalOpenPnl.toFixed(2)}
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-right">
            <span className="text-[9px] text-slate-400 block">LUCRO FECHADO REALIZADO</span>
            <span className={`text-xs font-black ${totalClosedPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {totalClosedPnl >= 0 ? '+' : ''}${totalClosedPnl.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Posições Abertas */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="font-bold text-slate-900 text-xs uppercase font-sans flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Posições Abertas em Andamento ({positions.length})</span>
          </h3>
          <span className="text-[10px] text-slate-400">
            Sincronizado tick a tick com o feed de mercado
          </span>
        </div>

        {positions.length === 0 ? (
          <div className="text-center py-10 text-slate-400 font-sans">
            Nenhuma posição aberta no momento. Abra uma ordem pela boleta ou aprove a recomendação do agente.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase">
                  <th className="pb-2">ATIVO</th>
                  <th className="pb-2">LADO</th>
                  <th className="pb-2">LOTE</th>
                  <th className="pb-2">PREÇO ENTRADA</th>
                  <th className="pb-2">ATUAL</th>
                  <th className="pb-2">ALVO (TP)</th>
                  <th className="pb-2">STOP LOSS</th>
                  <th className="pb-2">LUCRO / PREJUÍZO</th>
                  <th className="pb-2 text-right">AÇÕES RÁPIDAS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {positions.map((pos) => {
                  const isBuy = pos.side === 'BUY';
                  const isProfit = pos.pnl >= 0;
                  return (
                    <tr key={pos.id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 font-bold text-slate-900">{pos.asset}</td>
                      <td className="py-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isBuy ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' : 'bg-rose-50 text-rose-700 border border-rose-300'
                          }`}
                        >
                          {isBuy ? 'COMPRA' : 'VENDA'}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-700">{pos.lotSize}</td>
                      <td className="py-2.5 text-slate-700">{pos.entryPrice.toFixed(2)}</td>
                      <td className="py-2.5 text-slate-900 font-bold">{pos.currentPrice.toFixed(2)}</td>
                      <td className="py-2.5 text-emerald-600 font-bold">{pos.targetPrice.toFixed(2)}</td>
                      <td className="py-2.5 text-rose-600 font-bold">{pos.stopLossPrice.toFixed(2)}</td>
                      <td className="py-2.5">
                        <span className={`font-black text-xs ${isProfit ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isProfit ? '+' : ''}${pos.pnl.toFixed(2)} ({isProfit ? '+' : ''}{pos.pnlPercent}%)
                        </span>
                      </td>
                      <td className="py-2.5 text-right space-x-1.5">
                        <button
                          onClick={() => partialClosePosition(pos.id)}
                          className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold transition cursor-pointer"
                          title="Realizar 50% do lucro e mover stop para o preço de entrada (Breakeven)"
                        >
                          50% BREAKEVEN
                        </button>
                        <button
                          onClick={() => closePosition(pos.id, 'Fechamento manual a mercado')}
                          className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 text-[10px] font-bold transition cursor-pointer"
                        >
                          FECHAR ORDEM
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. Calculadora de Lote e Diário de Trades */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Calculadora de Dimensionamento de Risco (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-4 space-y-3 shadow-2xs font-mono text-xs">
          <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
            <Calculator className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-xs uppercase font-sans">
              CALCULADORA DE RISCO E TAMANHO DE LOTE
            </h3>
          </div>

          <div className="space-y-2.5 font-sans">
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">
                SALDO DA CONTA (USD $):
              </label>
              <input
                type="number"
                value={accountBalance}
                onChange={(e) => setAccountBalance(parseFloat(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-slate-900 font-bold outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-500 block mb-1">
                RISCO MÁXIMO POR OPERAÇÃO (%):
              </label>
              <input
                type="number"
                step="0.5"
                value={riskPercent}
                onChange={(e) => setRiskPercent(parseFloat(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-slate-900 font-bold outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-500 block mb-1">
                DISTÂNCIA ATÉ O STOP LOSS (PONTOS):
              </label>
              <input
                type="number"
                value={stopPoints}
                onChange={(e) => setStopPoints(parseFloat(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-slate-900 font-bold outline-none font-mono"
              />
            </div>

            {/* Resultado do Dimensionamento */}
            <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 space-y-1 text-[11px] font-mono">
              <div className="flex justify-between">
                <span className="text-slate-600 font-sans">VALOR FINANCEIRO EM RISCO:</span>
                <span className="text-rose-600 font-bold">${riskAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-slate-600 font-sans">LOTE INSTITUCIONAL RECOMENDADO:</span>
                <span className="text-emerald-700 font-black text-sm">{calculatedLots} LOTES</span>
              </div>
            </div>
          </div>
        </div>

        {/* Diário de Trades Fechados (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col h-full font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-2.5">
            <h3 className="font-bold text-slate-900 text-xs uppercase font-sans">
              DIÁRIO DE OPERAÇÕES ENCERRADAS (TRADE JOURNAL)
            </h3>
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
              TAXA DE ACERTO: {winRate}%
            </span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[300px] space-y-2">
            {tradeJournal.map((trade) => {
              const isWin = trade.result === 'WIN';
              return (
                <div
                  key={trade.id}
                  className="p-2.5 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-[11px]"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`p-1 rounded-md ${
                        isWin ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {isWin ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">{trade.asset}</span>
                        <span className="text-[10px] text-slate-500 font-sans">{trade.side}</span>
                        <span className="text-[10px] text-slate-400">({trade.lotSize}L)</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-sans">{trade.reason}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`font-black text-xs block ${isWin ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isWin ? '+' : ''}${trade.pnl.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(trade.closeTime).toLocaleTimeString('pt-BR')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
