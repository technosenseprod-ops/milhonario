import React, { useEffect, useState } from 'react';
import { useRaptor } from '../../context/RaptorContext';
import { 
  Bell, 
  X, 
  Target, 
  ShieldAlert, 
  Check, 
  ArrowUpRight, 
  ArrowDownRight,
  Zap,
  Cpu
} from 'lucide-react';

export const InstitutionalAlertOverlay: React.FC = () => {
  const { activeOverlayAlert, dismissOverlayAlert, acknowledgeAlert, openPosition } = useRaptor();
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    if (activeOverlayAlert) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [activeOverlayAlert]);

  if (!visible || !activeOverlayAlert) return null;

  const handleDismiss = () => {
    setVisible(false);
    dismissOverlayAlert();
  };

  const handleAcknowledge = () => {
    acknowledgeAlert(activeOverlayAlert.id);
    handleDismiss();
  };

  const isBuy = activeOverlayAlert.type === 'BUY';
  const isSell = activeOverlayAlert.type === 'SELL';
  const isTarget = activeOverlayAlert.type === 'TARGET' || activeOverlayAlert.type === 'EXIT';
  const isStop = activeOverlayAlert.type === 'STOP';

  const handleExecute = () => {
    const side = isSell ? 'SELL' : 'BUY';
    openPosition(
      activeOverlayAlert.asset,
      side,
      0.5,
      activeOverlayAlert.targetPrice,
      activeOverlayAlert.stopLossPrice
    );
    handleAcknowledge();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-xl border border-slate-300 bg-white p-5 shadow-2xl relative flex flex-col font-sans text-slate-800">
        {/* Cabeçalho do Alerta */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-lg border ${
                isBuy || isTarget
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : isSell || isStop
                  ? 'bg-rose-50 border-rose-300 text-rose-700'
                  : 'bg-amber-50 border-amber-300 text-amber-700'
              }`}
            >
              {isBuy ? (
                <ArrowUpRight className="w-5 h-5" />
              ) : isSell ? (
                <ArrowDownRight className="w-5 h-5" />
              ) : isTarget ? (
                <Target className="w-5 h-5" />
              ) : isStop ? (
                <ShieldAlert className="w-5 h-5" />
              ) : (
                <Bell className="w-5 h-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black text-slate-900">
                  {activeOverlayAlert.asset}
                </span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold border ${
                    isBuy
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : isSell
                      ? 'bg-rose-50 text-rose-700 border-rose-300'
                      : 'bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  {activeOverlayAlert.type}
                </span>
                {activeOverlayAlert.confidence && (
                  <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    {activeOverlayAlert.confidence}% CONVICÇÃO
                  </span>
                )}
              </div>
              <h3 className="font-bold text-sm text-slate-900 mt-0.5">
                {activeOverlayAlert.titlePt}
              </h3>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="p-1 rounded text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Racional Operacional */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 mb-2.5 text-xs leading-relaxed text-slate-700">
          <strong className="block text-slate-900 font-semibold mb-0.5">Análise Técnica:</strong>
          {activeOverlayAlert.reason}
        </div>

        {/* Explicação Didática em Linguagem Simples */}
        <div className="p-3 rounded-lg bg-blue-50/80 border border-blue-200 mb-3 text-xs leading-relaxed text-blue-900">
          <strong className="block text-blue-950 font-semibold mb-0.5">💡 Em Linguagem Simples — O que fazer agora?</strong>
          {isBuy ? (
            <p>O robô detectou que o mercado está favorável para compra. Se você aprovar, uma ordem de compra será aberta. Ao atingir o <strong>Alvo 1</strong>, você garante metade do lucro e o risco vai para zero (0 a 0)!</p>
          ) : isSell ? (
            <p>O robô detectou que o mercado está sob forte pressão de queda. A ordem de venda buscará lucrar com o movimento de descida até os alvos planejados.</p>
          ) : isTarget ? (
            <p>Parabéns! O preço atingiu a meta planejada. O lucro foi realizado e o restante está protegido.</p>
          ) : isStop ? (
            <p>O mercado virou e o robô cortou a perda imediatamente no ponto exato planejado. Seu capital foi preservado para a próxima oportunidade.</p>
          ) : (
            <p>Atualização importante do monitoramento de ativos em tempo real.</p>
          )}
        </div>

        {/* Preços e Projeções */}
        <div className="grid grid-cols-3 gap-2 text-xs mb-4">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 text-[10px] block font-medium">Preço de Entrada</span>
            <strong className="text-slate-900 text-sm tabular-nums">{activeOverlayAlert.price.toFixed(2)}</strong>
          </div>

          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
            <span className="text-emerald-800 text-[10px] block font-bold">Alvo de Lucro (TP)</span>
            <strong className="text-emerald-700 text-sm tabular-nums">
              {activeOverlayAlert.targetPrice?.toFixed(2) || '--'}
            </strong>
          </div>

          <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200">
            <span className="text-rose-800 text-[10px] block font-bold">Stop Loss (Proteção)</span>
            <strong className="text-rose-700 text-sm tabular-nums">
              {activeOverlayAlert.stopLossPrice?.toFixed(2) || '--'}
            </strong>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-slate-100">
          <button
            onClick={handleDismiss}
            className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer"
          >
            Descartar
          </button>

          {(isBuy || isSell) && (
            <button
              onClick={handleExecute}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Aprovar Ordem Paper (1-Clique)</span>
            </button>
          )}

          {!isBuy && !isSell && (
            <button
              onClick={handleAcknowledge}
              className="px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>CIENTE</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
