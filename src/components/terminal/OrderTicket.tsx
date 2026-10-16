import React, { useState } from 'react';
import { useRaptor } from '../../context/RaptorContext';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  ShieldAlert, 
  Target, 
  Zap, 
  CheckCircle,
  Cpu
} from 'lucide-react';

export const OrderTicket: React.FC = () => {
  const { selectedAsset, quotes, openPosition, alerts } = useRaptor();
  const [lotSize, setLotSize] = useState<number>(1.0);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  const quote = quotes[selectedAsset];
  const price = quote?.price || (selectedAsset === 'GOLD' ? 4160.0 : selectedAsset === 'US100' ? 30800.0 : selectedAsset === 'HK.CASH' ? 23980.0 : 7830.0);

  // Último sinal do agente para este ativo
  const lastSignal = alerts.find((a) => a.asset === selectedAsset);

  // Distância proporcional
  const dist = selectedAsset === 'GOLD' ? 12.0 : selectedAsset === 'US100' ? 65.0 : selectedAsset === 'HK.CASH' ? 80.0 : 18.0;

  const suggestedTarget = lastSignal?.targetPrice || (quote?.trendSignal === 'COMPRA' ? price + dist * 1.5 : price - dist * 1.5);
  const suggestedStop = lastSignal?.stopLossPrice || (quote?.trendSignal === 'COMPRA' ? price - dist : price + dist);

  const [customTarget, setCustomTarget] = useState<number>(suggestedTarget);
  const [customStop, setCustomStop] = useState<number>(suggestedStop);

  const handleBuy = () => {
    openPosition(selectedAsset, 'BUY', lotSize, customTarget || suggestedTarget, customStop || suggestedStop);
    setOrderSuccess(`COMPRA de ${lotSize} lotes executada em ${selectedAsset} @ ${price.toFixed(2)}`);
    setTimeout(() => setOrderSuccess(null), 3500);
  };

  const handleSell = () => {
    openPosition(selectedAsset, 'SELL', lotSize, customTarget || suggestedTarget, customStop || suggestedStop);
    setOrderSuccess(`VENDA de ${lotSize} lotes executada em ${selectedAsset} @ ${price.toFixed(2)}`);
    setTimeout(() => setOrderSuccess(null), 3500);
  };

  const loadAgentSetup = () => {
    if (lastSignal) {
      if (lastSignal.targetPrice) setCustomTarget(lastSignal.targetPrice);
      if (lastSignal.stopLossPrice) setCustomStop(lastSignal.stopLossPrice);
      setOrderSuccess(`Parâmetros do Agente carregados: Alvo ${lastSignal.targetPrice} | Stop ${lastSignal.stopLossPrice}`);
      setTimeout(() => setOrderSuccess(null), 3500);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg flex flex-col h-full overflow-hidden shadow-2xs font-mono text-xs">
      {/* Cabeçalho da Boleta */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-blue-50 border border-blue-200 text-blue-700">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-xs font-sans">BOLETA DE EXECUÇÃO</h4>
            <span className="text-[10px] text-slate-500 block">
              Execução assistida e envio de ordens institucionais
            </span>
          </div>
        </div>

        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
          FEED ATIVO
        </span>
      </div>

      {/* Conteúdo da Boleta */}
      <div className="p-3 space-y-3 flex-1 overflow-y-auto">
        {/* Preço de Cotação Atual */}
        <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block">PREÇO DE MERCADO</span>
            <span className="text-base font-black text-slate-900">{price.toFixed(2)}</span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">SPREAD REAL</span>
            <span className="text-emerald-600 font-bold text-xs">{quote?.spread.toFixed(2) || '0.25'} pts</span>
          </div>
        </div>

        {/* Seleção de Tamanho de Lote */}
        <div>
          <div className="flex items-center justify-between mb-1 text-[10px]">
            <span className="text-slate-500">TAMANHO DO LOTE (CONTRATOS):</span>
            <span className="text-slate-900 font-bold">{lotSize} Lotes</span>
          </div>
          <div className="grid grid-cols-5 gap-1">
            {[0.1, 0.5, 1.0, 2.0, 5.0].map((sz) => (
              <button
                key={sz}
                onClick={() => setLotSize(sz)}
                className={`py-1 rounded border text-[11px] font-bold transition cursor-pointer ${
                  lotSize === sz
                    ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>

        {/* Níveis de Alvo e Stop Loss */}
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div className="p-2 rounded bg-emerald-50/50 border border-emerald-200">
            <div className="flex items-center gap-1 text-emerald-800 font-bold mb-1">
              <Target className="w-3 h-3 text-emerald-600" />
              <span>ALVO (TP)</span>
            </div>
            <input
              type="number"
              step="0.01"
              value={customTarget || suggestedTarget.toFixed(2)}
              onChange={(e) => setCustomTarget(parseFloat(e.target.value))}
              className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-emerald-700 font-bold outline-none"
            />
          </div>

          <div className="p-2 rounded bg-rose-50/50 border border-rose-200">
            <div className="flex items-center gap-1 text-rose-800 font-bold mb-1">
              <ShieldAlert className="w-3 h-3 text-rose-600" />
              <span>STOP LOSS</span>
            </div>
            <input
              type="number"
              step="0.01"
              value={customStop || suggestedStop.toFixed(2)}
              onChange={(e) => setCustomStop(parseFloat(e.target.value))}
              className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-rose-700 font-bold outline-none"
            />
          </div>
        </div>

        {/* Botão para Carregar Setup do Agente */}
        {lastSignal && (
          <button
            onClick={loadAgentSetup}
            className="w-full py-1.5 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition flex items-center justify-center gap-1.5 text-[10px] cursor-pointer"
          >
            <Cpu className="w-3 h-3 text-blue-600" />
            <span>SINCRONIZAR COM O SINAL DO AGENTE</span>
          </button>
        )}

        {/* Botões Grandes de Compra e Venda */}
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <button
            onClick={handleBuy}
            className="py-2.5 px-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-xs flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-95"
          >
            <div className="flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" />
              <span>COMPRA (BUY)</span>
            </div>
            <span className="text-[10px] opacity-90">{quote?.ask.toFixed(2) || price.toFixed(2)}</span>
          </button>

          <button
            onClick={handleSell}
            className="py-2.5 px-2 rounded-md bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-xs flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-95"
          >
            <div className="flex items-center gap-1">
              <ArrowDownRight className="w-4 h-4" />
              <span>VENDA (SELL)</span>
            </div>
            <span className="text-[10px] opacity-90">{quote?.bid.toFixed(2) || price.toFixed(2)}</span>
          </button>
        </div>

        {/* Notificação de Sucesso */}
        {orderSuccess && (
          <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
            <span>{orderSuccess}</span>
          </div>
        )}
      </div>
    </div>
  );
};
