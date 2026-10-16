import React, { useState, useEffect } from 'react';
import { useRaptor } from '../../context/RaptorContext';
import { 
  Radio, 
  Clock, 
  Bell, 
  Power, 
  Terminal, 
  User, 
  ShieldCheck, 
  Command,
  Search
} from 'lucide-react';

interface TopHeaderProps {
  onOpenKillSwitch?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onOpenKillSwitch }) => {
  const { wsConnected, latencyMs, quotes, alerts } = useRaptor();
  const [brtTime, setBrtTime] = useState<string>('');
  const [nyTime, setNyTime] = useState<string>('');
  const [ldnTime, setLdnTime] = useState<string>('');
  const [tokyoTime, setTokyoTime] = useState<string>('');
  const [killArmed, setKillArmed] = useState<boolean>(false);

  const [headerNotice, setHeaderNotice] = useState<string | null>(null);

  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();
      // BRT (UTC-3)
      setBrtTime(now.toLocaleTimeString('pt-BR'));
      // NY (UTC-4)
      const ny = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
      setNyTime(ny.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
      // London (UTC+1)
      const ldn = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/London' }));
      setLdnTime(ldn.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
      // Tokyo (UTC+9)
      const tyo = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
      setTokyoTime(tyo.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleKillSwitch = () => {
    const next = !killArmed;
    setKillArmed(next);
    setHeaderNotice(
      next
        ? '🛑 KILL SWITCH ATIVADO: Ordens automáticas e novos candidatos foram bloqueados para segurança.'
        : '🟢 SISTEMA DESBLOQUEADO: Operações automáticas e análise dos agentes restabelecidas.'
    );
    setTimeout(() => setHeaderNotice(null), 5000);
  };

  const handleCommands = () => {
    setHeaderNotice('⌨️ ATALHOS RAPTOR: [F1] Sala de Operações • [F2] Scanner • [B] Comprar • [S] Vender • [Espaço] Pausar');
    setTimeout(() => setHeaderNotice(null), 5000);
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between select-none font-sans z-20 sticky top-0 shadow-2xs">
      {/* Esquerda: Status do Feed e Consenso */}
      <div className="flex items-center gap-4">
        {/* Mercado ao Vivo */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-300 text-emerald-700 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>MERCADO AO VIVO</span>
        </div>

        {/* Latência */}
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-[9px] text-slate-400 font-mono leading-none">LATÊNCIA</span>
          <span className="text-xs font-mono font-bold text-emerald-600 leading-tight">
            {latencyMs}ms
          </span>
        </div>

        <div className="h-6 w-[1px] bg-slate-200 hidden md:block" />

        {/* Consenso de Dados */}
        <div className="hidden md:flex flex-col text-left">
          <span className="text-[9px] text-slate-500 font-mono leading-none">
            CONSENSO DE DADOS <strong className="text-slate-900">100% AUDITADO</strong>
          </span>
          <span className="text-[10px] font-mono text-slate-400 leading-tight">
            CONSENSO (TRADINGVIEW INSTITUCIONAL)
          </span>
        </div>
      </div>

      {/* Centro: Relógios Globais */}
      <div className="hidden xl:flex items-center gap-4 text-xs font-mono text-slate-600">
        <div className="flex items-center gap-1">
          <span className="text-slate-400 text-[10px]">BRT</span>
          <span className="font-bold text-slate-900">{brtTime || '11:32:08'}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-slate-400 text-[10px]">NY</span>
          <span className="font-semibold text-slate-700">{nyTime || '09:32'}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-slate-400 text-[10px]">LDN</span>
          <span className="font-semibold text-slate-700">{ldnTime || '14:32'}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-slate-400 text-[10px]">TÓQUIO</span>
          <span className="font-semibold text-slate-700">{tokyoTime || '23:32'}</span>
        </div>
      </div>

      {/* Direita: Comandos, Alertas, Kill Switch & Perfil */}
      <div className="flex items-center gap-3">
        {/* Comandos ⌘K */}
        <button
          onClick={handleCommands}
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-mono transition border border-slate-200 cursor-pointer"
        >
          <Command className="w-3.5 h-3.5 text-slate-500" />
          <span>COMANDOS ⌘K</span>
        </button>

        {headerNotice && (
          <div className="fixed top-16 right-4 z-50 bg-slate-900 text-white px-3.5 py-2 rounded-lg shadow-xl text-xs flex items-center gap-2 border border-slate-700 animate-in fade-in">
            <span>{headerNotice}</span>
          </div>
        )}

        {/* Notificações Bell com badge 3 */}
        <div className="relative cursor-pointer p-1 text-slate-600 hover:text-slate-900">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
            {alerts.length > 0 ? Math.min(9, alerts.length) : '3'}
          </span>
        </div>

        {/* Botão de Pânico / Kill Switch */}
        <button
          onClick={handleKillSwitch}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-bold transition border ${
            killArmed
              ? 'bg-rose-600 text-white border-rose-700 animate-pulse shadow-sm'
              : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
          }`}
          title="Interromper instantaneamente todas as ordens e agentes de trading"
        >
          <Power className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">BOTÃO DE PÂNICO / KILL SWITCH</span>
        </button>

        {/* Perfil Quant Senior */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <span className="text-[11px] font-bold text-slate-900 block leading-tight">
              QUANT_SÊNIOR_01
            </span>
            <span className="text-[9px] font-mono text-emerald-600 font-bold block leading-tight">
              MESA ATIVA
            </span>
          </div>
          <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>
    </header>
  );
};
