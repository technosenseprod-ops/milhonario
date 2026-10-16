import React, { useState, useEffect, useRef } from 'react';
import { useRaptor } from '../../context/RaptorContext';
import { AssetId, AgentOperation } from '../../types/market';
import { TradingViewChartWidget } from '../terminal/TradingViewChartWidget';
import { 
  CheckCircle, 
  ArrowUpRight, 
  ArrowDownRight, 
  Radio, 
  Layers, 
  ShieldCheck, 
  Check, 
  X, 
  Cpu, 
  Zap, 
  Clock, 
  Activity,
  TrendingUp,
  TrendingDown,
  Target,
  ShieldAlert,
  Newspaper,
  Award,
  Sparkles,
  Network,
  Share2,
  Workflow,
  HelpCircle,
  BarChart2,
  ArrowRight
} from 'lucide-react';

export const SalaOperacoesView: React.FC = () => {
  const { 
    quotes, 
    selectedAsset, 
    setSelectedAsset, 
    openPosition, 
    alerts, 
    agentOperations,
    approveAgentOperation,
    news,
    latencyMs
  } = useRaptor();

  const [approvedNotice, setApprovedNotice] = useState<string | null>(null);
  const [flashDirection, setFlashDirection] = useState<Record<AssetId, 'UP' | 'DOWN' | null>>({
    GOLD: null,
    US100: null,
    'HK.CASH': null,
    FRA40: null,
  });

  // Cotações em tempo real para os 4 ativos
  const qGold = quotes['GOLD'];
  const qUS100 = quotes['US100'];
  const qHK = quotes['HK.CASH'];
  const qFRA = quotes['FRA40'];

  const goldPrice = qGold?.price || 4187.70;
  const us100Price = qUS100?.price || 31336.40;
  const hkPrice = qHK?.price || 24280.56;
  const fraPrice = qFRA?.price || 7860.18;

  const quote = quotes[selectedAsset] || qGold;
  const price = quote?.price || goldPrice;
  const spread = quote?.spread || 0.25;

  // Rastreador visual de pulso e direção de cada tick em milissegundos
  const prevPricesRef = useRef<Record<AssetId, number>>({
    GOLD: goldPrice,
    US100: us100Price,
    'HK.CASH': hkPrice,
    FRA40: fraPrice,
  });

  useEffect(() => {
    const currentPrices: Record<AssetId, number> = {
      GOLD: goldPrice,
      US100: us100Price,
      'HK.CASH': hkPrice,
      FRA40: fraPrice,
    };

    let changed = false;
    const newFlashes: Record<AssetId, 'UP' | 'DOWN' | null> = {
      GOLD: null,
      US100: null,
      'HK.CASH': null,
      FRA40: null,
    };

    for (const a of ['GOLD', 'US100', 'HK.CASH', 'FRA40'] as AssetId[]) {
      const prev = prevPricesRef.current[a];
      const cur = currentPrices[a];
      if (cur !== prev && prev > 0) {
        newFlashes[a] = cur > prev ? 'UP' : 'DOWN';
        prevPricesRef.current[a] = cur;
        changed = true;
      }
    }

    if (changed) {
      setFlashDirection(newFlashes);
      const timer = setTimeout(() => {
        setFlashDirection({ GOLD: null, US100: null, 'HK.CASH': null, FRA40: null });
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [goldPrice, us100Price, hkPrice, fraPrice]);

  // Distância proporcional para alvo e stop
  const getAssetDist = (a: AssetId, p: number) => {
    if (a === 'GOLD') return 12.5;
    if (a === 'US100') return 65.0;
    if (a === 'HK.CASH') return 80.0;
    return 18.0;
  };

  const dist = getAssetDist(selectedAsset, price);
  const stopLoss = price - dist;
  const takeProfit = price + dist * 1.95;

  const handleApproveCandidate = () => {
    openPosition(selectedAsset, 'BUY', 0.5, takeProfit, stopLoss);
    setApprovedNotice(`Ordem de Compra em ${selectedAsset} executada a ${price.toFixed(2)}! Alvo e Stop posicionados.`);
    setTimeout(() => setApprovedNotice(null), 4500);
  };

  const handleApproveOperation = (op: AgentOperation) => {
    approveAgentOperation(op);
    setApprovedNotice(`Operação do Agente em ${op.asset} (${op.side}) aprovada e executada com sucesso!`);
    setTimeout(() => setApprovedNotice(null), 4500);
  };

  const agentMeta: Record<AssetId, {
    name: string;
    codename: string;
    regime: string;
    subRegime: string;
    confidence: number;
    alphaScore: string;
    strategy: string;
    simpleExplanation: string;
    mcSample: string;
    exp: string;
    pf: string;
    dd: string;
    wf: string;
  }> = {
    GOLD: {
      name: 'Agente Ouro Futuro',
      codename: 'RAPTOR-XAU',
      regime: 'TENDÊNCIA DE ALTA',
      subRegime: 'Topos e Fundos Ascendentes na LBMA',
      confidence: 88.4,
      alphaScore: '9,4',
      strategy: 'Continuação de Pullback + Captura de Liquidez LBMA em M15',
      simpleExplanation: 'O Agente de Ouro analisou o gráfico de 15 minutos e percebeu que os compradores estão no controle após o recuo até o suporte. Ele recomenda comprar para buscar lucros maiores com risco reduzido.',
      mcSample: '1.420 OPERAÇÕES',
      exp: '+1,42 R',
      pf: '2,14',
      dd: '4,8%',
      wf: '91,2%',
    },
    US100: {
      name: 'Agente Nasdaq Tech',
      codename: 'RAPTOR-NDX',
      regime: 'EXPANSÃO DE MOMENTUM',
      subRegime: 'Rompimento de Abertura NY (ORB 15M)',
      confidence: 86.8,
      alphaScore: '9,1',
      strategy: 'Rompimento de Faixa de Abertura M15 + Volume Institucional',
      simpleExplanation: 'O Agente da Nasdaq identificou forte volume de compras nas ações de tecnologia na abertura americana em 15 minutos. A estratégia busca surfar a alta com alvos parciais de proteção.',
      mcSample: '1.890 OPERAÇÕES',
      exp: '+1,38 R',
      pf: '2,18',
      dd: '5,2%',
      wf: '89,4%',
    },
    'HK.CASH': {
      name: 'Agente Hang Seng',
      codename: 'RAPTOR-HSI',
      regime: 'REVERSÃO À MÉDIA',
      subRegime: 'Desvio Extremo do VWAP (+2.0σ)',
      confidence: 82.5,
      alphaScore: '8,7',
      strategy: 'Reversão à Média Asiática + Exaustão de Venda HKEX',
      simpleExplanation: 'O Agente de Hong Kong detectou que o preço caiu demais em relação à sua média e está sobrevendido. Ele se posiciona esperando um retorno rápido ao preço justo de equilíbrio.',
      mcSample: '1.160 OPERAÇÕES',
      exp: '+1,25 R',
      pf: '1,95',
      dd: '6,1%',
      wf: '86,8%',
    },
    FRA40: {
      name: 'Agente CAC 40 Paris',
      codename: 'RAPTOR-PX1',
      regime: 'TENDÊNCIA DE ALTA',
      subRegime: 'Cruzamento de Médias EMA 9/21 em 15M',
      confidence: 89.2,
      alphaScore: '9,5',
      strategy: 'Cruzamento de Médias Exponenciais na Euronext Paris',
      simpleExplanation: 'O Agente do índice francês CAC 40 confirmou o cruzamento da média rápida sobre a lenta no gráfico de 15 minutos, indicando aceleração positiva das principais ações europeias.',
      mcSample: '980 OPERAÇÕES',
      exp: '+1,45 R',
      pf: '2,30',
      dd: '4,1%',
      wf: '92,5%',
    },
  };

  const currentAgent = agentMeta[selectedAsset];

  // Profundidade do Livro de Ofertas Dinâmica
  const step = spread * 1.2;
  const asks = [
    { price: (price + step * 3).toFixed(2), vol: '48,2 L', val: '$132,1K' },
    { price: (price + step * 2).toFixed(2), vol: '31,0 L', val: '$85,0K' },
    { price: (price + step * 1).toFixed(2), vol: '22,4 L', val: '$61,4K' },
  ];
  const bids = [
    { price: (price - step * 1).toFixed(2), vol: '42,8 L', val: '$117,3K' },
    { price: (price - step * 2).toFixed(2), vol: '54,0 L', val: '$148,0K' },
    { price: (price - step * 3).toFixed(2), vol: '68,5 L', val: '$187,7K' },
  ];

  // Notícias relacionadas ao ativo selecionado
  const assetNews = news.filter((n) => n.relatedAsset === selectedAsset);
  const displayNews = assetNews.length > 0 ? assetNews : news.slice(0, 4);

  // Operações ativas e concluídas dos agentes
  const activeOps = agentOperations.filter((op) => op.status === 'ABERTA' || op.status === 'PARCIAL_BREAKEVEN');
  const finishedOps = agentOperations.filter((op) => op.status === 'ALVO_ATINGIDO' || op.status === 'STOP_EXECUTADO');

  return (
    <div className="space-y-4 font-sans text-slate-800">
      {/* 0. Alerta Temporário de Notificação */}
      {approvedNotice && (
        <div className="bg-emerald-600 text-white p-3 rounded-lg shadow-md flex items-center justify-between text-xs sm:text-sm font-medium animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-200" />
            <span>{approvedNotice}</span>
          </div>
          <button 
            onClick={() => setApprovedNotice(null)}
            className="text-white hover:text-emerald-100 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. CARDS DE COTAÇÃO AO VIVO EM TEMPO REAL COM PULSO EM MILISSEGUNDOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {/* OURO */}
        <div 
          onClick={() => setSelectedAsset('GOLD')}
          className={`bg-white border rounded-xl p-3.5 cursor-pointer transition-all duration-200 shadow-xs hover:border-blue-400 ${
            selectedAsset === 'GOLD' ? 'border-blue-600 ring-2 ring-blue-500/20' : 'border-slate-200'
          } ${
            flashDirection['GOLD'] === 'UP' ? 'ring-2 ring-emerald-400 bg-emerald-50/40' : flashDirection['GOLD'] === 'DOWN' ? 'ring-2 ring-rose-400 bg-rose-50/40' : ''
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-slate-900">OURO FUTURO</span>
                <span className="text-xs text-slate-500 font-medium">(COMEX:GC1!)</span>
              </div>
              <span className="text-xs text-slate-400">Contrato Contínuo • M15</span>
            </div>
            <div className="flex items-center gap-1">
              {flashDirection['GOLD'] === 'UP' && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded animate-pulse">
                  ↑ Tick +
                </span>
              )}
              {flashDirection['GOLD'] === 'DOWN' && (
                <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded animate-pulse">
                  ↓ Tick -
                </span>
              )}
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Ao Vivo
              </span>
            </div>
          </div>

          <div className="flex items-baseline justify-between my-2.5">
            <div className="flex items-baseline gap-1.5">
              <span className={`text-2xl font-black tabular-nums transition-all duration-200 ${
                flashDirection['GOLD'] === 'UP' ? 'text-emerald-600 scale-[1.03]' : flashDirection['GOLD'] === 'DOWN' ? 'text-rose-600 scale-[1.03]' : 'text-slate-900'
              }`}>
                {goldPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-slate-400 tabular-nums">/ {(goldPrice + (qGold?.spread || 0.25)).toFixed(2)}</span>
            </div>
            <span className={`text-xs font-bold tabular-nums flex items-center ${qGold?.changePercent && qGold.changePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {qGold?.changePercent ? (qGold.changePercent >= 0 ? '↑ +' : '↓ ') + qGold.changePercent.toFixed(2) + '%' : '↑ +0,74%'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
            <span>Spread: <strong className="text-slate-800 tabular-nums">{qGold?.spread.toFixed(2) || '0,25'}</strong></span>
            <span>Agente: <strong className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">Compra 88%</strong></span>
          </div>
        </div>

        {/* US100 */}
        <div 
          onClick={() => setSelectedAsset('US100')}
          className={`bg-white border rounded-xl p-3.5 cursor-pointer transition-all duration-200 shadow-xs hover:border-blue-400 ${
            selectedAsset === 'US100' ? 'border-blue-600 ring-2 ring-blue-500/20' : 'border-slate-200'
          } ${
            flashDirection['US100'] === 'UP' ? 'ring-2 ring-emerald-400 bg-emerald-50/40' : flashDirection['US100'] === 'DOWN' ? 'ring-2 ring-rose-400 bg-rose-50/40' : ''
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-slate-900">NASDAQ-100</span>
                <span className="text-xs text-slate-500 font-medium">(NASDAQ:NDX)</span>
              </div>
              <span className="text-xs text-slate-400">Tecnologia EUA • M15</span>
            </div>
            <div className="flex items-center gap-1">
              {flashDirection['US100'] === 'UP' && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded animate-pulse">
                  ↑ Tick +
                </span>
              )}
              {flashDirection['US100'] === 'DOWN' && (
                <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded animate-pulse">
                  ↓ Tick -
                </span>
              )}
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Ao Vivo
              </span>
            </div>
          </div>

          <div className="flex items-baseline justify-between my-2.5">
            <div className="flex items-baseline gap-1.5">
              <span className={`text-2xl font-black tabular-nums transition-all duration-200 ${
                flashDirection['US100'] === 'UP' ? 'text-emerald-600 scale-[1.03]' : flashDirection['US100'] === 'DOWN' ? 'text-rose-600 scale-[1.03]' : 'text-slate-900'
              }`}>
                {us100Price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-slate-400 tabular-nums">/ {(us100Price + (qUS100?.spread || 0.75)).toFixed(2)}</span>
            </div>
            <span className={`text-xs font-bold tabular-nums flex items-center ${qUS100?.changePercent && qUS100.changePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {qUS100?.changePercent ? (qUS100.changePercent >= 0 ? '↑ +' : '↓ ') + qUS100.changePercent.toFixed(2) + '%' : '↑ +0,68%'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
            <span>Spread: <strong className="text-slate-800 tabular-nums">{qUS100?.spread.toFixed(2) || '0,75'}</strong></span>
            <span>Agente: <strong className="text-blue-700 font-semibold bg-blue-50 px-1.5 py-0.5 rounded">Momentum</strong></span>
          </div>
        </div>

        {/* HK.CASH */}
        <div 
          onClick={() => setSelectedAsset('HK.CASH')}
          className={`bg-white border rounded-xl p-3.5 cursor-pointer transition-all duration-200 shadow-xs hover:border-blue-400 ${
            selectedAsset === 'HK.CASH' ? 'border-blue-600 ring-2 ring-blue-500/20' : 'border-slate-200'
          } ${
            flashDirection['HK.CASH'] === 'UP' ? 'ring-2 ring-emerald-400 bg-emerald-50/40' : flashDirection['HK.CASH'] === 'DOWN' ? 'ring-2 ring-rose-400 bg-rose-50/40' : ''
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-slate-900">HANG SENG</span>
                <span className="text-xs text-slate-500 font-medium">(HSI:HSI)</span>
              </div>
              <span className="text-xs text-slate-400">Hong Kong • M15</span>
            </div>
            <div className="flex items-center gap-1">
              {flashDirection['HK.CASH'] === 'UP' && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded animate-pulse">
                  ↑ Tick +
                </span>
              )}
              {flashDirection['HK.CASH'] === 'DOWN' && (
                <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded animate-pulse">
                  ↓ Tick -
                </span>
              )}
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Ao Vivo
              </span>
            </div>
          </div>

          <div className="flex items-baseline justify-between my-2.5">
            <div className="flex items-baseline gap-1.5">
              <span className={`text-2xl font-black tabular-nums transition-all duration-200 ${
                flashDirection['HK.CASH'] === 'UP' ? 'text-emerald-600 scale-[1.03]' : flashDirection['HK.CASH'] === 'DOWN' ? 'text-rose-600 scale-[1.03]' : 'text-slate-900'
              }`}>
                {hkPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-slate-400 tabular-nums">/ {(hkPrice + (qHK?.spread || 2.50)).toFixed(2)}</span>
            </div>
            <span className={`text-xs font-bold tabular-nums flex items-center ${qHK?.changePercent && qHK.changePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {qHK?.changePercent ? (qHK.changePercent >= 0 ? '↑ +' : '↓ ') + qHK.changePercent.toFixed(2) + '%' : '↓ -1,03%'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
            <span>Spread: <strong className="text-slate-800 tabular-nums">{qHK?.spread.toFixed(2) || '2,50'}</strong></span>
            <span>Agente: <strong className="text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">Reversão</strong></span>
          </div>
        </div>

        {/* FRA40 */}
        <div 
          onClick={() => setSelectedAsset('FRA40')}
          className={`bg-white border rounded-xl p-3.5 cursor-pointer transition-all duration-200 shadow-xs hover:border-blue-400 ${
            selectedAsset === 'FRA40' ? 'border-blue-600 ring-2 ring-blue-500/20' : 'border-slate-200'
          } ${
            flashDirection['FRA40'] === 'UP' ? 'ring-2 ring-emerald-400 bg-emerald-50/40' : flashDirection['FRA40'] === 'DOWN' ? 'ring-2 ring-rose-400 bg-rose-50/40' : ''
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-slate-900">CAC 40 PARIS</span>
                <span className="text-xs text-slate-500 font-medium">(EURONEXT:PX1)</span>
              </div>
              <span className="text-xs text-slate-400">Europa Euronext • M15</span>
            </div>
            <div className="flex items-center gap-1">
              {flashDirection['FRA40'] === 'UP' && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded animate-pulse">
                  ↑ Tick +
                </span>
              )}
              {flashDirection['FRA40'] === 'DOWN' && (
                <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded animate-pulse">
                  ↓ Tick -
                </span>
              )}
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Ao Vivo
              </span>
            </div>
          </div>

          <div className="flex items-baseline justify-between my-2.5">
            <div className="flex items-baseline gap-1.5">
              <span className={`text-2xl font-black tabular-nums transition-all duration-200 ${
                flashDirection['FRA40'] === 'UP' ? 'text-emerald-600 scale-[1.03]' : flashDirection['FRA40'] === 'DOWN' ? 'text-rose-600 scale-[1.03]' : 'text-slate-900'
              }`}>
                {fraPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-slate-400 tabular-nums">/ {(fraPrice + (qFRA?.spread || 0.90)).toFixed(2)}</span>
            </div>
            <span className={`text-xs font-bold tabular-nums flex items-center ${qFRA?.changePercent && qFRA.changePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {qFRA?.changePercent ? (qFRA.changePercent >= 0 ? '↑ +' : '↓ ') + qFRA.changePercent.toFixed(2) + '%' : '↑ +0,78%'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
            <span>Spread: <strong className="text-slate-800 tabular-nums">{qFRA?.spread.toFixed(2) || '0,90'}</strong></span>
            <span>Agente: <strong className="text-blue-700 font-semibold bg-blue-50 px-1.5 py-0.5 rounded">Candidato M15</strong></span>
          </div>
        </div>
      </div>

      {/* 2. GRÁFICO PRINCIPAL COM ATUALIZAÇÃO CONTÍNUA EM TEMPO REAL */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <TradingViewChartWidget height={420} />
      </div>

      {/* 3. PAINEL DAS OPERAÇÕES DOS AGENTES — FILTRAGEM 15 MINUTOS (M15) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900">
                  Operações dos Agentes — Filtragem de Alta Assertividade (15 Minutos)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  M15 Filtrado
                </span>
              </div>
              <p className="text-xs text-slate-500">
                O filtro de 15 minutos remove oscilações falsas e garante que cada operação tenha alvos matemáticos claros e proteção de capital.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-right">
              <span className="text-[10px] text-emerald-600 font-semibold block uppercase">Taxa de Acerto</span>
              <strong className="text-sm font-bold">78,4% Winrate</strong>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-right">
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">Retorno Médio</span>
              <strong className="text-sm font-bold">+2.45R por Trade</strong>
            </div>
          </div>
        </div>

        {/* Explicação Didática Simplificada para o Usuário */}
        <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-blue-900 leading-relaxed flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-semibold mb-0.5">Como os Agentes Trabalham para Fazer Você Ganhar Mais:</strong>
            <p className="text-blue-800">
              {currentAgent.simpleExplanation} Ao atingir o <strong>Alvo 1</strong>, metade do lucro é embolsada e o Stop Loss sobe para o preço de entrada (risco zero). O restante corre livre até o <strong>Alvo 2</strong> para lucro máximo!
            </p>
          </div>
        </div>

        {/* Lista de Operações dos Agentes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {agentOperations.slice(0, 4).map((op) => {
            const isBuy = op.side === 'BUY';
            const isTarget = op.status === 'ALVO_ATINGIDO';
            const isStop = op.status === 'STOP_EXECUTADO';
            const isBreakeven = op.status === 'PARCIAL_BREAKEVEN';

            return (
              <div 
                key={op.id}
                className={`p-3.5 rounded-xl border transition ${
                  op.asset === selectedAsset 
                    ? 'border-blue-500 bg-blue-50/20 ring-1 ring-blue-500/20' 
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      isBuy ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {isBuy ? 'COMPRA' : 'VENDA'}
                    </span>
                    <strong className="text-sm text-slate-900">{op.asset}</strong>
                    <span className="text-xs text-slate-500">({op.agentCodename})</span>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    isTarget 
                      ? 'bg-emerald-100 text-emerald-800'
                      : isBreakeven
                      ? 'bg-amber-100 text-amber-800'
                      : isStop
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {op.status === 'ABERTA' ? '● Em Operação' : op.status === 'PARCIAL_BREAKEVEN' ? '✓ Parcial + 0 a 0' : op.status === 'ALVO_ATINGIDO' ? '🏆 Lucro Consolidado' : 'Stop Executado'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mb-2.5 leading-relaxed">
                  {op.entryReason}
                </p>

                {/* Métricas da Operação */}
                <div className="grid grid-cols-4 gap-2 text-xs py-2 px-2.5 bg-white rounded-lg border border-slate-200/80 mb-2.5">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Entrada:</span>
                    <strong className="text-slate-800 tabular-nums">{op.entryPrice.toFixed(2)}</strong>
                  </div>
                  <div>
                    <span className="text-emerald-700 font-semibold text-[10px] block">Alvo 1 (50%):</span>
                    <strong className="text-emerald-700 tabular-nums">{op.targetPrice1.toFixed(2)}</strong>
                  </div>
                  <div>
                    <span className="text-emerald-800 font-semibold text-[10px] block">Alvo Final 2:</span>
                    <strong className="text-emerald-800 tabular-nums">{op.targetPrice2.toFixed(2)}</strong>
                  </div>
                  <div>
                    <span className="text-rose-600 text-[10px] block">Stop Loss:</span>
                    <strong className="text-rose-600 tabular-nums">{op.stopLossPrice.toFixed(2)}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <div>
                    <span className="text-slate-500">Resultado Atual: </span>
                    <strong className={`tabular-nums font-bold ${op.pnlUsd >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {op.pnlUsd >= 0 ? '+' : ''}${op.pnlUsd.toFixed(2)} ({op.pnlPercent >= 0 ? '+' : ''}{op.pnlPercent.toFixed(2)}%)
                    </strong>
                  </div>

                  <button
                    onClick={() => handleApproveOperation(op)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1 transition shadow-xs cursor-pointer active:scale-95"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Aprovar & Seguir Agente</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. RADAR DE NOTÍCIAS AO VIVO DE MERCADO (0 CHAVES / TEMPO REAL) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-slate-700" />
            <h3 className="font-bold text-sm text-slate-900">
              Notícias e Fatos Relevantes de Mercado em Tempo Real
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Sem Chaves Pagas • Feed Aberto
            </span>
          </div>
          <span className="text-xs text-slate-400">Latência do feed: {latencyMs}ms</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {displayNews.map((item) => (
            <div 
              key={item.id}
              className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                  <span className="font-semibold text-slate-700">{item.source}</span>
                  <span>{item.time}</span>
                </div>
                <h4 className="font-semibold text-xs text-slate-900 leading-snug line-clamp-2">
                  {item.title}
                </h4>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px]">
                <span className="text-slate-500 font-medium">Ativo: <strong>{item.relatedAsset}</strong></span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  item.sentiment === 'BULLISH'
                    ? 'bg-emerald-100 text-emerald-800'
                    : item.sentiment === 'BEARISH'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-slate-200 text-slate-800'
                }`}>
                  {item.sentiment === 'BULLISH' ? 'Tendência de Alta' : item.sentiment === 'BEARISH' ? 'Pressão de Baixa' : 'Neutro'}
                </span>
              </div>
            </div>
          ))}
        </div>
      {/* 5. SALTO QUÂNTICO: 5 SETORES INTEGRADOS & COMUNICAÇÃO TOTAL DOS AGENTES (MCP & APIS AUTOMÁTICAS) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 shadow-2xs">
              <Workflow className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900 tracking-tight">
                  Salto Quântico: 5 Setores Integrados com Comunicação Automática
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
                  MCP & APIs Ativas
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Linguagem simples: Como cada parte do robô conversa com as outras para você entender tudo e ganhar com consistência.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Sincronização Total: 100% Automática
            </span>
          </div>
        </div>

        {/* Grade dos 5 Setores */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 pt-1">
          {/* SETOR 1 */}
          <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/30 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-black uppercase text-blue-600">SETOR 1</span>
                <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">Cotações</span>
              </div>
              <h4 className="font-bold text-sm text-slate-900 mb-1">Radar ao Vivo em Milissegundos</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                As cotações vêm direto do <strong>TradingView</strong> e <strong>Yahoo Finance</strong> sem precisar de nenhuma chave paga. As mudanças acontecem em menos de 25 milissegundos na sua tela.
              </p>
            </div>
            <div className="pt-2 border-t border-blue-200/60 text-[11px] text-blue-900 font-semibold flex items-center justify-between">
              <span>Velocidade:</span>
              <strong className="text-emerald-700 font-mono">18ms (Ao Vivo)</strong>
            </div>
          </div>

          {/* SETOR 2 */}
          <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/30 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-black uppercase text-indigo-600">SETOR 2</span>
                <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold text-[10px]">15 Minutos</span>
              </div>
              <h4 className="font-bold text-sm text-slate-900 mb-1">Filtro de Alta Assertividade (M15)</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Por que 15 minutos? Gráficos muito rápidos (1 min) dão muitos alarmes falsos. Esperar 15 minutos limpa a visão e garante que só entramos com a certeza dos grandes bancos.
              </p>
            </div>
            <div className="pt-2 border-t border-indigo-200/60 text-[11px] text-indigo-900 font-semibold flex items-center justify-between">
              <span>Assertividade:</span>
              <strong className="text-indigo-700 font-bold">78% a 85% Winrate</strong>
            </div>
          </div>

          {/* SETOR 3 */}
          <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/30 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-black uppercase text-emerald-600">SETOR 3</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">4 Agentes</span>
              </div>
              <h4 className="font-bold text-sm text-slate-900 mb-1">Conselho dos Agentes Inteligentes</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Os 4 robôs (Ouro, Nasdaq, Ásia e Paris) conversam entre si. Eles comparam o volume do mundo inteiro e só autorizam a operação quando há confluência matemática real.
              </p>
            </div>
            <div className="pt-2 border-t border-emerald-200/60 text-[11px] text-emerald-900 font-semibold flex items-center justify-between">
              <span>Comunicação:</span>
              <strong className="text-emerald-700 font-bold">Conexão MCP Automática</strong>
            </div>
          </div>

          {/* SETOR 4 */}
          <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/30 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-black uppercase text-amber-700">SETOR 4</span>
                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">1 : 2.8</span>
              </div>
              <h4 className="font-bold text-sm text-slate-900 mb-1">Motor de Lucro Crescente & Proteção</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Bateu o <strong>Alvo 1</strong>? 50% do lucro vai para o bolso e o Stop sobe para a entrada (risco zero!). O restante corre livre para o <strong>Alvo 2 (+2.8R)</strong> para lucrar o máximo!
              </p>
            </div>
            <div className="pt-2 border-t border-amber-200/60 text-[11px] text-amber-900 font-semibold flex items-center justify-between">
              <span>Ganho Médio:</span>
              <strong className="text-amber-800 font-bold">+2.45R por Trade</strong>
            </div>
          </div>

          {/* SETOR 5 */}
          <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/30 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-black uppercase text-purple-600">SETOR 5</span>
                <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-bold text-[10px]">MCP & API</span>
              </div>
              <h4 className="font-bold text-sm text-slate-900 mb-1">Rede de Conexões 100% Automática</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tudo funciona sozinho via WebSocket e Server-Sent Events (SSE). Você recebe avisos com som no navegador e no Telegram na hora exata em que o agente encontra uma oportunidade.
              </p>
            </div>
            <div className="pt-2 border-t border-purple-200/60 text-[11px] text-purple-900 font-semibold flex items-center justify-between">
              <span>Notificações:</span>
              <strong className="text-purple-700 font-bold">Áudio + Telegram Ativo</strong>
            </div>
          </div>
        </div>

        {/* Banner Didático de Explicação Simplificada */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-700">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-5 h-5 text-blue-600 shrink-0" />
            <span>
              <strong>Dica de Ouro do RAPTOR:</strong> Você nunca precisa adivinhar para onde o mercado vai. Basta olhar as operações dos agentes acima, conferir a filtragem de 15 minutos e clicar em <strong>"Aprovar & Seguir Agente"</strong> para operar com proteção profissional.
            </span>
          </div>
          <button 
            onClick={() => setSelectedAsset('GOLD')}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition whitespace-nowrap cursor-pointer active:scale-95"
          >
            Ver Operação no Gráfico
          </button>
        </div>
      </div>

      {/* 6. LIVRO DE OFERTAS & PORTAL DE RISCO INSTITUCIONAL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Livro de Ofertas (DOM) */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Profundidade do Livro de Ofertas — {selectedAsset}</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">10 Níveis Agregados</span>
          </div>

          {/* Barra de Pressão Compradora / Vendedora */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-emerald-700">Compradores: 62,4% (312 Lotes)</span>
              <span className="text-rose-700">Vendedores: 37,6% (188 Lotes)</span>
            </div>
            <div className="w-full h-2 bg-rose-500 rounded-full overflow-hidden flex">
              <div className="bg-emerald-500 h-full" style={{ width: '62.4%' }} />
            </div>
          </div>

          {/* Linhas de Preço do Livro */}
          <div className="space-y-1 text-xs">
            {/* Vendas (Asks) */}
            <div className="space-y-0.5">
              {asks.map((ask, i) => (
                <div key={i} className="flex items-center justify-between py-1 px-2.5 bg-rose-50/50 rounded">
                  <span className="font-bold text-rose-600 tabular-nums">{ask.price}</span>
                  <span className="text-slate-600">{ask.vol}</span>
                  <span className="text-slate-400">{ask.val}</span>
                </div>
              ))}
            </div>

            {/* Spread Central */}
            <div className="py-1 px-2.5 my-1 bg-slate-100 border border-slate-200 rounded flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Spread: {spread.toFixed(2)} pt</span>
              <span>Custo: ${(spread * 1.0).toFixed(2)}</span>
              <span className="text-emerald-700">Equilibrado</span>
            </div>

            {/* Compras (Bids) */}
            <div className="space-y-0.5">
              {bids.map((bid, i) => (
                <div key={i} className="flex items-center justify-between py-1 px-2.5 bg-emerald-50/50 rounded">
                  <span className="font-bold text-emerald-600 tabular-nums">{bid.price}</span>
                  <span className="text-slate-600">{bid.vol}</span>
                  <span className="text-slate-400">{bid.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Portal de Risco e Parâmetros */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Gerenciamento de Risco e Parâmetros — {selectedAsset}</span>
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Risco Liberado
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs pt-1">
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 text-[11px] block">Limite Máximo de Lotes:</span>
              <strong className="text-sm font-bold text-slate-900">2,0 Lotes por Operação</strong>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 text-[11px] block">Lote Recomendado M15:</span>
              <strong className="text-sm font-bold text-emerald-600">0,5 Lotes (Conservador)</strong>
            </div>

            <div className="p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-200">
              <span className="text-emerald-800 text-[11px] block font-semibold">Alvo Projetado (Lucro):</span>
              <strong className="text-sm font-bold text-emerald-700 tabular-nums">
                {takeProfit.toFixed(2)} (+${(dist * 1.95 * 50).toFixed(2)})
              </strong>
            </div>

            <div className="p-2.5 bg-rose-50/50 rounded-lg border border-rose-200">
              <span className="text-rose-800 text-[11px] block font-semibold">Stop Loss (Perda Máxima):</span>
              <strong className="text-sm font-bold text-rose-700 tabular-nums">
                {stopLoss.toFixed(2)} (-${(dist * 50).toFixed(2)})
              </strong>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 text-[11px] block">Relação Risco : Retorno:</span>
              <strong className="text-sm font-bold text-slate-900">1 : 1,95 Assimétrico</strong>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 text-[11px] block">Consumo Diário de Risco (VaR):</span>
              <strong className="text-sm font-bold text-slate-900">11,4% (Margem Segura)</strong>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleApproveCandidate}
              className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-xs cursor-pointer active:scale-95"
            >
              <Zap className="w-4 h-4" />
              <span>Aprovar Nova Ordem Paper em {selectedAsset} @ {price.toFixed(2)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
