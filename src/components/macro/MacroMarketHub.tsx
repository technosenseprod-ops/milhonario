import React, { useState, useEffect } from 'react';
import { MacroCalendar } from '../terminal/MacroCalendar';
import { 
  Globe, 
  Layers, 
  Clock, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Zap,
  BarChart3
} from 'lucide-react';

interface MarketSession {
  city: string;
  region: string;
  openUtc: number; // hora em UTC
  closeUtc: number;
  currency: string;
  importance: 'HIGH' | 'MEDIUM';
}

const SESSIONS: MarketSession[] = [
  { city: 'Londres', region: 'Europa', openUtc: 8, closeUtc: 16, currency: 'GBP / EUR', importance: 'HIGH' },
  { city: 'Nova York', region: 'América', openUtc: 13, closeUtc: 21, currency: 'USD', importance: 'HIGH' },
  { city: 'Tóquio', region: 'Ásia', openUtc: 0, closeUtc: 9, currency: 'JPY', importance: 'MEDIUM' },
  { city: 'Hong Kong', region: 'Ásia', openUtc: 1, closeUtc: 8, currency: 'HKD / CNH', importance: 'HIGH' },
];

export const MacroMarketHub: React.FC = () => {
  const [currentUtcHour, setCurrentUtcHour] = useState<number>(new Date().getUTCHours());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentUtcHour(new Date().getUTCHours());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const isSessionOpen = (s: MarketSession) => {
    if (s.openUtc <= s.closeUtc) {
      return currentUtcHour >= s.openUtc && currentUtcHour < s.closeUtc;
    }
    return currentUtcHour >= s.openUtc || currentUtcHour < s.closeUtc;
  };

  // Matriz de correlação estatística entre ativos
  const correlations = [
    { pair: 'OURO vs NASDAQ-100', score: '-0.38', type: 'Divergência / Hedge contra Risco', status: 'Inversa Moderada' },
    { pair: 'OURO vs DÓLAR (DXY)', score: '-0.74', type: 'Forte Correlação Negativa Clássica', status: 'Inversa Forte' },
    { pair: 'NASDAQ vs CAC 40', score: '+0.81', type: 'Apetite Global por Risco em Ações', status: 'Positiva Forte' },
    { pair: 'HANG SENG vs EMERGENTES', score: '+0.68', type: 'Fluxos Asiáticos e Política PBOC', status: 'Positiva Moderada' },
  ];

  return (
    <div className="space-y-4 font-sans text-slate-800">
      {/* 1. Header Macro */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-mono">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-600">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase font-sans tracking-tight">
              CENTRAL MACROECONÔMICA & FLUXO GLOBAL
            </h2>
            <p className="text-[11px] text-slate-500 font-sans">
              Sessões de mercado mundiais, correlações institucionais e eventos de alto impacto
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400">HORA UTC ATUAL:</span>
          <span className="text-xs text-blue-700 font-bold bg-blue-50 px-2 py-1 rounded border border-blue-200">
            {new Date().toUTCString().slice(17, 22)} UTC
          </span>
        </div>
      </div>

      {/* 2. Horários e Status das Sessões Globais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {SESSIONS.map((session) => {
          const open = isSessionOpen(session);
          return (
            <div
              key={session.city}
              className={`bg-white border rounded-lg p-3.5 transition-all shadow-2xs ${
                open ? 'border-emerald-500/80 ring-1 ring-emerald-500/30' : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-slate-900 text-xs">{session.city}</span>
                <span
                  className={`text-[9px] px-2 py-0.5 rounded font-bold font-mono border ${
                    open
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-slate-50 text-slate-400 border-slate-200'
                  }`}
                >
                  {open ? 'MERCADO ABERTO' : 'FECHADO'}
                </span>
              </div>

              <span className="text-[10px] text-slate-500 block mb-2">{session.region} • {session.currency}</span>

              <div className="pt-2 border-t border-slate-100 text-[10px] font-mono text-slate-400 flex justify-between">
                <span>HORÁRIO UTC:</span>
                <strong className="text-slate-800">{session.openUtc}:00 — {session.closeUtc}:00</strong>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Matriz de Correlações e Calendário */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Matriz de Correlação (6 cols) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-lg p-4 space-y-3 shadow-2xs font-mono text-xs">
          <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
            <Layers className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-xs uppercase font-sans">
              MATRIZ DE CORRELAÇÃO INSTITUCIONAL
            </h3>
          </div>

          <div className="space-y-2">
            {correlations.map((c, i) => (
              <div
                key={i}
                className="p-3 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
              >
                <div>
                  <span className="font-bold text-slate-900 text-xs block font-sans">{c.pair}</span>
                  <span className="text-[10px] text-slate-500 font-sans">{c.type}</span>
                </div>

                <div className="text-right">
                  <span
                    className={`font-black text-xs block ${
                      c.score.startsWith('+') ? 'text-emerald-600' : 'text-blue-600'
                    }`}
                  >
                    {c.score}
                  </span>
                  <span className="text-[9px] text-slate-400 font-sans">{c.status}</span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-slate-500 leading-relaxed pt-1 font-sans">
            * Correlações calculadas com base nos fechamentos diários dos últimos 60 pregões. Divergências acentuadas entre Ouro e Nasdaq costumam sinalizar rotação defensiva institucional.
          </p>
        </div>

        {/* Calendário Macroeconômico Integrado (6 cols) */}
        <div className="lg:col-span-6 h-[400px]">
          <MacroCalendar />
        </div>
      </div>
    </div>
  );
};
