import React, { useState } from 'react';
import { useRaptor } from '../../context/RaptorContext';
import { AlertSignal, AlertType, AssetId } from '../../types/market';
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  ShieldAlert, 
  Send, 
  Play, 
  Check, 
  Activity,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Zap
} from 'lucide-react';

export const AlertCommandCenter: React.FC = () => {
  const { alerts, selectedAsset, triggerTestAlert, acknowledgeAlert } = useRaptor();
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'ASSET'>('ALL');
  const [testing, setTesting] = useState<string | null>(null);

  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'ACTIVE') return !a.acknowledged;
    if (filter === 'ASSET') return a.asset === selectedAsset;
    return true;
  });

  const handleTest = async (type: AlertType) => {
    setTesting(type);
    await triggerTestAlert(selectedAsset, type);
    setTimeout(() => setTesting(null), 1000);
  };

  const getAlertBadge = (type: AlertType) => {
    switch (type) {
      case 'BUY':
        return {
          icon: <ArrowUpRight className="w-4 h-4 text-emerald-400" />,
          color: 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300',
        };
      case 'SELL':
        return {
          icon: <ArrowDownRight className="w-4 h-4 text-rose-400" />,
          color: 'bg-rose-950/80 border-rose-500/50 text-rose-300',
        };
      case 'TARGET':
        return {
          icon: <Target className="w-4 h-4 text-emerald-400" />,
          color: 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300',
        };
      case 'STOP':
        return {
          icon: <ShieldAlert className="w-4 h-4 text-rose-400" />,
          color: 'bg-rose-950/80 border-rose-500/50 text-rose-300',
        };
      case 'WEAKENING':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
          color: 'bg-amber-950/80 border-amber-500/50 text-amber-300',
        };
      default:
        return {
          icon: <Zap className="w-4 h-4 text-sky-400" />,
          color: 'bg-slate-900 border-slate-700 text-slate-300',
        };
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl flex flex-col h-full overflow-hidden shadow-2xl">
      {/* Cabeçalho */}
      <div className="p-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-500/30 text-emerald-400">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 font-mono tracking-wider">
              CENTRAL DE SINAIS DOS AGENTES
            </h3>
            <span className="text-[10px] text-slate-400 block font-mono">
              Estratégia de progressão e gestão de lucro institucional
            </span>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800 text-[10px] font-mono">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-2 py-1 rounded transition ${
              filter === 'ALL' ? 'bg-slate-800 text-emerald-400 font-bold' : 'text-slate-400'
            }`}
          >
            TODOS ({alerts.length})
          </button>
          <button
            onClick={() => setFilter('ACTIVE')}
            className={`px-2 py-1 rounded transition ${
              filter === 'ACTIVE' ? 'bg-slate-800 text-emerald-400 font-bold' : 'text-slate-400'
            }`}
          >
            PENDENTES ({alerts.filter((a) => !a.acknowledged).length})
          </button>
          <button
            onClick={() => setFilter('ASSET')}
            className={`px-2 py-1 rounded transition ${
              filter === 'ASSET' ? 'bg-slate-800 text-emerald-400 font-bold' : 'text-slate-400'
            }`}
          >
            {selectedAsset}
          </button>
        </div>
      </div>

      {/* Barra de Teste de Diagnóstico Rápido */}
      <div className="px-3.5 py-2 bg-slate-900/40 border-b border-slate-800/80 flex items-center justify-between gap-2 text-[10px] font-mono">
        <span className="text-slate-400">SIMULAR SINAL EM {selectedAsset}:</span>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => handleTest('BUY')}
            disabled={Boolean(testing)}
            className="px-2 py-1 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 font-bold transition flex items-center gap-1"
          >
            <span>+ COMPRA</span>
          </button>
          <button
            onClick={() => handleTest('SELL')}
            disabled={Boolean(testing)}
            className="px-2 py-1 rounded bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-500/40 font-bold transition flex items-center gap-1"
          >
            <span>- VENDA</span>
          </button>
          <button
            onClick={() => handleTest('TARGET')}
            disabled={Boolean(testing)}
            className="px-2 py-1 rounded bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-500/40 font-bold transition"
          >
            ALVO 🎯
          </button>
          <button
            onClick={() => handleTest('STOP')}
            disabled={Boolean(testing)}
            className="px-2 py-1 rounded bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-500/40 font-bold transition"
          >
            STOP 🛑
          </button>
        </div>
      </div>

      {/* Lista de Sinais Operacionais */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500 font-mono text-xs">
            <Activity className="w-8 h-8 mb-2 text-slate-600" />
            <p className="font-semibold text-slate-400">NENHUM SINAL PENDENTE NO MOMENTO</p>
            <p className="text-[11px] text-slate-500 max-w-xs mt-1">
              Os agentes estão monitorando o fluxo de {selectedAsset} no TradingView. Novos alertas surgirão apenas com confluência de alta probabilidade.
            </p>
          </div>
        ) : (
          filteredAlerts.map((signal) => {
            const badge = getAlertBadge(signal.type);
            return (
              <div
                key={signal.id}
                className={`p-3 rounded-xl border transition-all text-xs font-mono relative overflow-hidden ${
                  signal.acknowledged
                    ? 'bg-slate-950/60 border-slate-800 text-slate-400'
                    : `${badge.color} shadow-lg`
                }`}
              >
                {/* Linha 1: Título e Status */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    {badge.icon}
                    <span className="font-bold text-slate-100 text-xs">
                      {signal.titlePt || `${signal.type} no ${signal.asset}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-slate-400">
                      {new Date(signal.timestamp).toLocaleTimeString('pt-BR')}
                    </span>
                    {!signal.acknowledged && (
                      <button
                        onClick={() => acknowledgeAlert(signal.id)}
                        className="p-1 rounded bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition"
                        title="Marcar como ciente"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Linha 2: Racional Operacional */}
                <p className="text-[11px] text-slate-300 leading-relaxed mb-2.5">
                  {signal.reason}
                </p>

                {/* Linha 3: Níveis de Entrada, Alvo e Stop */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-2 rounded-lg bg-slate-950/90 border border-slate-800/80 text-[10px]">
                  <div>
                    <span className="text-slate-500 block">ENTRADA</span>
                    <span className="text-slate-100 font-bold">{signal.price.toFixed(2)}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block">ALVO (TP)</span>
                    <span className="text-emerald-400 font-bold">
                      {signal.targetPrice ? signal.targetPrice.toFixed(2) : '--'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block">STOP LOSS</span>
                    <span className="text-rose-400 font-bold">
                      {signal.stopLossPrice ? signal.stopLossPrice.toFixed(2) : '--'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block">CONVICÇÃO</span>
                    <span className="text-emerald-300 font-bold">
                      {signal.confidence ? `${signal.confidence}%` : '85%'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
