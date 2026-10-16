import React, { useEffect, useState } from 'react';
import { Calendar, AlertCircle, Clock, Globe } from 'lucide-react';
import { MacroEvent } from '../../types/market';

export const MacroCalendar: React.FC = () => {
  const [events, setEvents] = useState<MacroEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/calendar')
      .then((res) => res.json())
      .then((data) => {
        if (data.events) setEvents(data.events);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const getImportanceBadge = (imp: string) => {
    switch (imp) {
      case 'HIGH':
        return 'bg-rose-50 text-rose-700 border-rose-300 font-bold';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 border-amber-300';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg flex flex-col h-full overflow-hidden shadow-2xs font-mono">
      {/* Cabeçalho */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-blue-50 border border-blue-200 text-blue-700">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 font-sans">
              CALENDÁRIO MACROECONÔMICO & FLUXO
            </h4>
            <span className="text-[10px] text-slate-500 block">
              Eventos que afetam ouro e índices globais
            </span>
          </div>
        </div>

        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
          HOJE
        </span>
      </div>

      {/* Lista de Eventos */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 text-xs">
        {loading ? (
          <div className="text-slate-400 text-center py-6 font-sans">Carregando indicadores econômicos...</div>
        ) : events.length === 0 ? (
          <div className="text-slate-400 text-center py-6 font-sans">Sem eventos programados para hoje.</div>
        ) : (
          events.map((ev) => (
            <div
              key={ev.id}
              className="p-2.5 rounded-md bg-slate-50 border border-slate-200 hover:bg-slate-100/70 transition flex items-center justify-between gap-3 text-[11px]"
            >
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-bold text-[10px] w-10 shrink-0">{ev.time}</span>
                <span className="text-slate-700 font-bold px-1.5 py-0.2 rounded bg-white border border-slate-200 text-[10px]">
                  {ev.country}
                </span>
                <span className="font-semibold text-slate-900 truncate max-w-[200px] font-sans">
                  {ev.event}
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right text-[10px]">
                  <span className="text-slate-400 block">PROJ / ANT</span>
                  <span className="text-slate-700 font-bold">
                    {ev.forecast || '--'} / {ev.previous || '--'}
                  </span>
                </div>

                <span className={`px-1.5 py-0.5 rounded text-[9px] border ${getImportanceBadge(ev.importance)}`}>
                  {ev.importance === 'HIGH' ? 'ALTO' : ev.importance === 'MEDIUM' ? 'MÉDIO' : 'BAIXO'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
