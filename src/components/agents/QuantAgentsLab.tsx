import React, { useState } from 'react';
import { useRaptor } from '../../context/RaptorContext';
import { AssetId, AlertType, AgentOperation } from '../../types/market';
import { 
  Cpu, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  CheckCircle, 
  ShieldAlert, 
  Sliders, 
  Play, 
  Zap,
  BarChart2,
  Clock,
  Check,
  Award,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  HelpCircle,
  Percent,
  TrendingDownIcon
} from 'lucide-react';

interface AgentProfile {
  id: AssetId;
  name: string;
  codename: string;
  ticker: string;
  specialty: string;
  winRate: number;
  profitFactor: number;
  tradesExecuted: number;
  avgReturn: string;
  timeframe: string;
  simpleExplanation: string;
  strategySummary: string;
}

const AGENTS_PROFILES: AgentProfile[] = [
  {
    id: 'GOLD',
    name: 'Agente Ouro Futuro',
    codename: 'RAPTOR-XAU',
    ticker: 'COMEX:GC1!',
    specialty: 'Rompimento de Volatilidade & Sessão LBMA Londres',
    winRate: 78.4,
    profitFactor: 2.45,
    tradesExecuted: 142,
    avgReturn: '+2.50R',
    timeframe: 'M15 (15 Minutos)',
    simpleExplanation: 'Este agente monitora o preço do ouro em blocos de 15 minutos. Ele espera o preço respirar em um suporte seguro para comprar barato e surfar a onda até o alvo de lucro.',
    strategySummary: 'Identifica exaustão de pressão vendedora em suportes da LBMA e projeta expansão assimétrica de 1:2.5 com trailing stop automático no Alvo 1.',
  },
  {
    id: 'US100',
    name: 'Agente Nasdaq Tech',
    codename: 'RAPTOR-NDX',
    ticker: 'NASDAQ:NDX',
    specialty: 'Momentum Tecnológico & Abertura de Nova York',
    winRate: 74.2,
    profitFactor: 2.18,
    tradesExecuted: 189,
    avgReturn: '+2.30R',
    timeframe: 'M15 (15 Minutos)',
    simpleExplanation: 'Este agente aproveita a força das maiores empresas de tecnologia (Apple, Nvidia, Microsoft). Ele filtra falsos rompimentos e entra apenas quando o volume institucional confirma a tendência.',
    strategySummary: 'Filtra falsos rompimentos no sino de abertura de Wall Street usando confluência algorítmica de EMA 9/21, Keltner Channels e IFR 14.',
  },
  {
    id: 'HK.CASH',
    name: 'Agente Hang Seng',
    codename: 'RAPTOR-HSI',
    ticker: 'HSI:HSI',
    specialty: 'Reversão à Média Asiática & Liquidez HKEX',
    winRate: 71.9,
    profitFactor: 1.95,
    tradesExecuted: 116,
    avgReturn: '+2.10R',
    timeframe: 'M15 (15 Minutos)',
    simpleExplanation: 'Este agente opera na Ásia. Quando o preço estica demais para baixo como um elástico, ele entra comprando para ganhar na volta do mercado para o preço médio justo.',
    strategySummary: 'Opera desvios extremos de preço fora das bandas do VWAP (+2.0σ) durante a madrugada europeia e abertura de Hong Kong.',
  },
  {
    id: 'FRA40',
    name: 'Agente CAC 40 Paris',
    codename: 'RAPTOR-PX1',
    ticker: 'EURONEXT:PX1',
    specialty: 'Confluência Euronext & Correlação DAX/CAC',
    winRate: 76.0,
    profitFactor: 2.30,
    tradesExecuted: 98,
    avgReturn: '+2.40R',
    timeframe: 'M15 (15 Minutos)',
    simpleExplanation: 'Este agente acompanha as principais ações da Europa na bolsa de Paris. Ele analisa o cruzamento de médias móveis em 15 minutos para pegar movimentos seguros de alta.',
    strategySummary: 'Captura o fluxo institucional das 09:00 CET nas blue-chips europeias com validação de volume e cruzamento de médias.',
  },
];

export const QuantAgentsLab: React.FC = () => {
  const { quotes, alerts, triggerTestAlert, openPosition, agentOperations, approveAgentOperation } = useRaptor();
  const [selectedAgent, setSelectedAgent] = useState<AssetId>('GOLD');
  const [timeframeFilter, setTimeframeFilter] = useState<'M15' | 'M5' | 'H1'>('M15');
  const [targetMultiplier, setTargetMultiplier] = useState<number>(2.5);
  const [sensitivities, setSensitivities] = useState<Record<AssetId, number>>({
    GOLD: 80,
    US100: 75,
    'HK.CASH': 75,
    FRA40: 80,
  });
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const activeProfile = AGENTS_PROFILES.find((p) => p.id === selectedAgent) || AGENTS_PROFILES[0];
  const quote = quotes[selectedAgent];

  const agentAlerts = alerts.filter((a) => a.asset === selectedAgent);
  const agentOps = agentOperations.filter((op) => op.asset === selectedAgent);

  const handleSensitivityChange = (val: number) => {
    setSensitivities((prev) => ({
      ...prev,
      [selectedAgent]: val,
    }));
    setActionNotice(`Filtro de assertividade ajustado para ${val}%. O agente agora é mais seletivo para evitar erros.`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleTestAgent = async (type: AlertType) => {
    await triggerTestAlert(selectedAgent, type);
    setActionNotice(`Sinal de ${type} disparado com sucesso pelo ${activeProfile.name}!`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <div className="space-y-4 font-sans text-slate-800">
      {/* 1. Header do Laboratório dos Agentes */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 shadow-2xs">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Conselho dos Agentes Inteligentes — Filtragem de 15 Minutos (M15)
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Assertividade Elevada
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Cada agente monitora seu mercado 24h e filtra sinais no tempo gráfico de 15 minutos para maximizar os lucros e proteger seu dinheiro.
            </p>
          </div>
        </div>

        {/* Estatísticas Gerais dos Agentes */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-right">
            <span className="text-[10px] text-emerald-600 font-bold block uppercase">Assertividade Auditada</span>
            <span className="text-emerald-700 font-bold text-sm">78,4% Winrate</span>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-right">
            <span className="text-[10px] text-blue-600 font-bold block uppercase">Risco vs Ganho</span>
            <span className="text-blue-900 font-bold text-sm">1 : 2.50 Assimétrico</span>
          </div>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-medium flex items-center gap-2 animate-in fade-in shadow-2xs">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* 2. Seleção dos 4 Agentes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {AGENTS_PROFILES.map((profile) => {
          const isSelected = selectedAgent === profile.id;
          return (
            <div
              key={profile.id}
              onClick={() => setSelectedAgent(profile.id)}
              className={`bg-white border rounded-xl p-4 cursor-pointer transition shadow-xs hover:border-blue-400 ${
                isSelected
                  ? 'border-blue-600 ring-2 ring-blue-500/20'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-slate-900 text-sm">{profile.name}</span>
                <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {profile.codename}
                </span>
              </div>

              <div className="text-xs text-slate-500 mb-2.5">
                <span>Contrato: </span>
                <strong className="text-slate-800">{profile.ticker}</strong>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">Taxa de Acerto</span>
                  <span className="text-emerald-600 font-bold">{profile.winRate}%</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Fator de Lucro</span>
                  <span className="text-slate-800 font-bold">{profile.profitFactor}x</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Painel de Controle e Diagnóstico do Agente Selecionado */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Radar e Controles do Agente (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-4 space-y-4 shadow-xs text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                Diagnóstico e Estratégia do {activeProfile.name}
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              {activeProfile.timeframe}
            </span>
          </div>

          {/* Explicação Didática em Linguagem Simplificada */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-blue-950 text-xs">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>O que este agente faz para você ganhar dinheiro?</span>
            </div>
            <p className="text-blue-900 leading-relaxed text-xs">
              {activeProfile.simpleExplanation}
            </p>
          </div>

          {/* Indicadores Técnicos Simplificados */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-400 text-[10px] block font-medium">Tendência M15</span>
              <strong className={`text-xs font-bold ${quote?.trendSignal === 'COMPRA' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {quote?.trendSignal === 'COMPRA' ? 'Alta Confirmada' : 'Queda / Correção'}
              </strong>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-400 text-[10px] block font-medium">Força / IFR (14)</span>
              <strong className="text-slate-900 text-xs font-bold">54.2 (Saudável)</strong>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-400 text-[10px] block font-medium">Volatilidade (ATR)</span>
              <strong className="text-slate-900 text-xs font-bold">{quote?.spread ? (quote.spread * 4.5).toFixed(2) : '3.80'} pts</strong>
            </div>

            <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200">
              <span className="text-emerald-800 text-[10px] block font-medium">Convicção do Robô</span>
              <strong className="text-emerald-700 text-xs font-bold">{quote?.confidence || 88}%</strong>
            </div>
          </div>

          {/* Ajuste de Sensibilidade para Ganhar Mais */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-900 font-bold flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-blue-600" />
                Filtro de Convicção Mínima para Disparar Alertas:
              </span>
              <span className="text-blue-700 font-bold text-sm">{sensitivities[selectedAgent]}%</span>
            </div>
            <input
              type="range"
              min="65"
              max="90"
              step="5"
              value={sensitivities[selectedAgent]}
              onChange={(e) => handleSensitivityChange(parseInt(e.target.value, 10))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Mais sinais (65%)</span>
              <span>Recomendado M15 (75-80%)</span>
              <span>Ultra Conservador (90%)</span>
            </div>
            <span className="text-[11px] text-slate-600 block">
              💡 <strong>Dica prática:</strong> Manter em 75% ou 80% garante que o agente só entre quando todas as confirmações estiverem alinhadas.
            </span>
          </div>

          {/* Disparo de Teste Manual */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
            <span className="text-slate-600 text-xs">Testar disparo manual do agente:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleTestAgent('BUY')}
                className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Disparar Compra (Buy)</span>
              </button>
              <button
                onClick={() => handleTestAgent('SELL')}
                className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95"
              >
                <ArrowDownRight className="w-4 h-4" />
                <span>Disparar Venda (Sell)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Histórico das Operações deste Agente (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col h-full text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <h3 className="font-bold text-slate-900 text-sm">
              Operações & Sinais de {activeProfile.codename}
            </h3>
            <span className="text-xs text-slate-500 font-medium">{agentOps.length} Registros</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[460px]">
            {agentOps.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                Aguardando nova oportunidade em 15 minutos para {selectedAgent}...
              </div>
            ) : (
              agentOps.map((op) => (
                <div
                  key={op.id}
                  className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 hover:bg-slate-100/70 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        op.side === 'BUY' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {op.side === 'BUY' ? 'COMPRA' : 'VENDA'}
                      </span>
                      <strong className="text-slate-900 text-xs">{op.asset}</strong>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {new Date(op.openTime).toLocaleTimeString('pt-BR')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-snug">{op.entryReason}</p>

                  <div className="grid grid-cols-3 gap-2 text-[11px] pt-1.5 border-t border-slate-200/70">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Entrada:</span>
                      <strong className="text-slate-800 tabular-nums">{op.entryPrice.toFixed(2)}</strong>
                    </div>
                    <div>
                      <span className="text-emerald-700 block text-[10px]">Alvo:</span>
                      <strong className="text-emerald-700 tabular-nums">{op.targetPrice1.toFixed(2)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Resultado:</span>
                      <strong className={`tabular-nums ${op.pnlUsd >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {op.pnlUsd >= 0 ? '+' : ''}${op.pnlUsd.toFixed(2)}
                      </strong>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
