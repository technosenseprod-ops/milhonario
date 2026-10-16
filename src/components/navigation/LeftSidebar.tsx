import React from 'react';
import { useRaptor } from '../../context/RaptorContext';
import { PageTab } from '../../types/market';
import { 
  Activity, 
  BarChart3, 
  Search, 
  Cpu, 
  FlaskConical, 
  ShieldAlert, 
  PlayCircle, 
  BookOpen, 
  Calendar, 
  Settings,
  Boxes,
  Database,
  Radio
} from 'lucide-react';

interface LeftSidebarProps {
  // Props can be extended if needed
}

export const LeftSidebar: React.FC<LeftSidebarProps> = () => {
  const { activeTab, setActiveTab, wsConnected, latencyMs, quotes } = useRaptor();

  const navItems: {
    id: PageTab;
    label: string;
    icon: React.ReactNode;
    pill: { text: string; bg: string; textCol: string; border: string };
  }[] = [
    {
      id: 'SALA_OPERACOES',
      label: 'Sala de Operações',
      icon: <Activity className="w-4 h-4 text-blue-600" />,
      pill: { text: 'EXEC', bg: 'bg-emerald-50', textCol: 'text-emerald-700', border: 'border-emerald-300' },
    },
    {
      id: 'PAINEL_ATIVO',
      label: 'Painel do Ativo',
      icon: <BarChart3 className="w-4 h-4 text-slate-500" />,
      pill: { text: '4/4', bg: 'bg-slate-100', textCol: 'text-slate-600', border: 'border-slate-300' },
    },
    {
      id: 'SCANNER_OPORTUNIDADES',
      label: 'Scanner de Oportunidades',
      icon: <Search className="w-4 h-4 text-amber-500" />,
      pill: { text: 'OPORT', bg: 'bg-amber-50', textCol: 'text-amber-700', border: 'border-amber-300' },
    },
    {
      id: 'CONSELHO_AGENTES',
      label: 'Conselho de Agentes',
      icon: <Cpu className="w-4 h-4 text-blue-500" />,
      pill: { text: '4 AGT', bg: 'bg-blue-50', textCol: 'text-blue-700', border: 'border-blue-300' },
    },
    {
      id: 'PESQUISA_QUANT',
      label: 'Pesquisa Quantitativa',
      icon: <FlaskConical className="w-4 h-4 text-slate-500" />,
      pill: { text: 'MC+OOS', bg: 'bg-slate-100', textCol: 'text-slate-600', border: 'border-slate-300' },
    },
    {
      id: 'RISCO_LIMITES',
      label: 'Risco & Limites',
      icon: <ShieldAlert className="w-4 h-4 text-emerald-600" />,
      pill: { text: '0.42% DD', bg: 'bg-emerald-50', textCol: 'text-emerald-700', border: 'border-emerald-300' },
    },
    {
      id: 'SIMULADOR_PAPER',
      label: 'Simulador / Paper',
      icon: <PlayCircle className="w-4 h-4 text-amber-600" />,
      pill: { text: 'SIM', bg: 'bg-amber-50', textCol: 'text-amber-700', border: 'border-amber-300' },
    },
    {
      id: 'DIARIO_TRADES',
      label: 'Diário de Trades',
      icon: <BookOpen className="w-4 h-4 text-slate-500" />,
      pill: { text: 'AUDIT', bg: 'bg-slate-100', textCol: 'text-slate-600', border: 'border-slate-300' },
    },
    {
      id: 'EVENTOS_MACRO',
      label: 'Eventos & Macro',
      icon: <Calendar className="w-4 h-4 text-rose-500" />,
      pill: { text: 'IPCA HOJE', bg: 'bg-rose-50', textCol: 'text-rose-700', border: 'border-rose-300' },
    },
    {
      id: 'CONFIGURACOES_APIS',
      label: 'Configurações & APIs',
      icon: <Settings className="w-4 h-4 text-slate-500" />,
      pill: { text: 'WS:3', bg: 'bg-slate-100', textCol: 'text-slate-600', border: 'border-slate-300' },
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between select-none shrink-0 h-screen sticky top-0 font-sans z-30 shadow-xs">
      {/* Top Logo */}
      <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow-sm">
            <Boxes className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-black text-sm tracking-tight text-slate-900">
              RAPTOR
            </span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
              v3.0
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>NÚCLEO</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="p-2 space-y-0.5 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition text-left ${
                isActive
                  ? 'bg-blue-50/80 text-blue-700 font-semibold shadow-xs'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={isActive ? 'text-blue-600' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </div>

              <span
                className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 ${item.pill.bg} ${item.pill.textCol} ${item.pill.border}`}
              >
                {item.pill.text}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Engine Telemetry */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/80 font-mono text-[10px] space-y-1.5 text-slate-500">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Database className="w-3 h-3 text-slate-400" />
            <span>POSTGRES</span>
          </span>
          <span className="text-emerald-600 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            SINCRONIZADO
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span>REDIS PUB/SUB</span>
          <span className="text-slate-700 font-bold">48.120 msg/s</span>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
          <span>RAPTOR-CORE</span>
          <span className="text-blue-600 font-bold">v3.0.4-core</span>
        </div>
      </div>
    </aside>
  );
};
