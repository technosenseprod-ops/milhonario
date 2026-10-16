import React, { useState, useEffect } from 'react';
import { useRaptor } from '../../context/RaptorContext';
import { PageTab } from '../../types/market';
import { 
  Volume2, 
  VolumeX, 
  BookOpen, 
  Clock, 
  Radio, 
  Layers, 
  Cpu, 
  Briefcase, 
  Globe, 
  Settings, 
  ShieldCheck,
  Zap
} from 'lucide-react';

interface TopBarProps {
  onOpenDocs: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenDocs }) => {
  const { 
    activeTab, 
    setActiveTab, 
    wsConnected, 
    latencyMs, 
    audioArmed, 
    toggleAudioArmed, 
    positions 
  } = useRaptor();

  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('pt-BR'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navTabs: { id: PageTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'SALA_OPERACOES', label: 'TERMINAL', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'CONSELHO_AGENTES', label: 'AGENTES QUANT', icon: <Cpu className="w-3.5 h-3.5" /> },
    { id: 'RISCO_LIMITES', label: 'GESTÃO & CARTEIRA', icon: <Briefcase className="w-3.5 h-3.5" />, badge: positions.length },
    { id: 'EVENTOS_MACRO', label: 'MACRO & SESSÕES', icon: <Globe className="w-3.5 h-3.5" /> },
    { id: 'CONFIGURACOES_APIS', label: 'DADOS & CONFIG', icon: <Settings className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="bg-slate-950 border-b border-slate-800 text-slate-200 select-none sticky top-0 z-40">
      <div className="px-4 py-2 flex items-center justify-between gap-3">
        {/* Identidade Visual */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black tracking-wider shadow-sm shadow-emerald-500/20">
              R
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm tracking-wider text-slate-100">
                  RAPTOR <span className="text-emerald-400 font-mono text-xs">v3.1</span>
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.2 text-[9px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40 rounded">
                  INSTITUCIONAL
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden md:block">
                TradingView Workstation
              </p>
            </div>
          </div>

          <div className="h-5 w-[1px] bg-slate-800 hidden lg:block" />

          {/* Abas de Navegação Principal */}
          <nav className="flex items-center bg-slate-900/90 rounded-xl p-0.5 border border-slate-800 font-mono text-xs">
            {navTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-800 text-emerald-400 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-emerald-500 text-slate-950">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Status do Feed TradingView & Horário */}
        <div className="flex items-center gap-2.5 font-mono text-xs">
          {/* Feed TradingView */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px]">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span className="text-slate-400">TRADINGVIEW:</span>
            <span className="text-emerald-400 font-bold">AO VIVO</span>
            <span className="text-slate-500 text-[10px]">({latencyMs}ms)</span>
          </div>

          {/* Relógio */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900/70 border border-slate-800/80 text-slate-300 text-[11px]">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{currentTime || '00:00:00'}</span>
          </div>

          {/* Áudio */}
          <button
            onClick={toggleAudioArmed}
            className={`p-1.5 rounded-lg border text-xs font-mono transition ${
              audioArmed
                ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title={audioArmed ? 'Áudio ativado' : 'Áudio mudo'}
          >
            {audioArmed ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Manual */}
          <button
            onClick={onOpenDocs}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 transition"
            title="Manual Operacional de Lucratividade"
          >
            <BookOpen className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
