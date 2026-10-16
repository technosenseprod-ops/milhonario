import React, { useState } from 'react';
import { useRaptor } from '../../context/RaptorContext';
import { 
  Search, 
  RefreshCw, 
  ExternalLink, 
  Play, 
  ShieldCheck, 
  ShieldAlert, 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  Sliders, 
  Activity, 
  X, 
  Check, 
  Zap,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

export const ScannerOportunidadesView: React.FC = () => {
  const { quotes, openPosition, setActiveTab, setSelectedAsset } = useRaptor();
  const [timeframe, setTimeframe] = useState<'1M' | '5M' | '15M' | '1H' | '4H' | '1D'>('5M');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CANDIDATO' | 'OBSERVACAO' | 'BLOQUEADO'>('ALL');
  const [toastDismissed, setToastDismissed] = useState<boolean>(false);
  const [scanning, setScanning] = useState<boolean>(false);
  const [simulatedOrderSuccess, setSimulatedOrderSuccess] = useState<string | null>(null);

  const handleForceScan = () => {
    setScanning(true);
    setTimeout(() => setScanning(false), 1200);
  };

  const handleSimulateOrder = (assetId: string, side: 'BUY' | 'SELL', lots: number, tp: number, sl: number) => {
    openPosition(assetId as any, side, lots, tp, sl);
    setSimulatedOrderSuccess(`Ordem Paper de ${side} ${lots} Lotes em ${assetId} enviada com sucesso!`);
    setTimeout(() => setSimulatedOrderSuccess(null), 4000);
  };

  return (
    <div className="space-y-3.5 font-sans text-slate-800">
      {/* 1. TOP HEADER BANNER */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs font-mono">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-black text-sm text-slate-900 tracking-tight">
              MOTOR DO SCANNER v3.0 EM TEMPO REAL
            </span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-blue-700 font-bold border border-slate-200">
              RT-MATRIX
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>
              ESTEIRA: <strong className="text-emerald-700">SINCRONIZADA (4/4)</strong>
            </span>
            <span>|</span>
            <span>
              CICLO: <strong className="text-slate-800">307ms</strong>
            </span>
          </div>
        </div>

        {/* Stats Pills Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200 text-[11px]">
              MONITORADOS: 4 ATIVOS
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-300 text-[11px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              1 CANDIDATO A TRADE
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold border border-amber-300 text-[11px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              2 EM OBSERVAÇÃO
            </span>
            <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold border border-rose-300 text-[11px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              1 BLOQUEADO
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>GAPS: <strong className="text-slate-700">0</strong></span>
            <span>|</span>
            <span>LATÊNCIA: <strong className="text-emerald-600 font-bold">3.8ms</strong></span>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-3 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Timeframe selector */}
            <div className="flex items-center gap-1">
              <span className="text-slate-500 text-[11px]">TEMPO GRÁFICO:</span>
              <div className="flex items-center bg-slate-100 rounded-md p-0.5 text-[10px] font-bold">
                {(['1M', '5M', '15M', '1H', '4H', '1D'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-2 py-0.5 rounded transition ${
                      timeframe === tf ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Regime Dropdown */}
            <div className="flex items-center gap-1">
              <span className="text-slate-500 text-[11px]">REGIME:</span>
              <select className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-700 font-sans outline-none text-[11px]">
                <option>Todos os Regimes</option>
                <option>Tendência de Alta</option>
                <option>Tendência de Baixa</option>
                <option>Rompimento / ORB</option>
                <option>Consolidação</option>
              </select>
            </div>

            {/* Estratégia Dropdown */}
            <div className="flex items-center gap-1">
              <span className="text-slate-500 text-[11px]">ESTRATÉGIA:</span>
              <select className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-700 font-sans outline-none text-[11px]">
                <option>Todos os Sistemas Centrais</option>
                <option>Cruzamento de EMA e Continuação</option>
                <option>Continuação de Pullback com Absorção</option>
                <option>Rompimento de Faixa de Abertura (ORB)</option>
                <option>Reversão à Média</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Estado Tabs */}
            <div className="flex items-center bg-slate-100 rounded-md p-0.5 text-[10px] font-bold">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-2 py-0.5 rounded ${statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
              >
                Todos
              </button>
              <button
                onClick={() => setStatusFilter('CANDIDATO')}
                className={`px-2 py-0.5 rounded ${statusFilter === 'CANDIDATO' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'}`}
              >
                Candidato (1)
              </button>
              <button
                onClick={() => setStatusFilter('OBSERVACAO')}
                className={`px-2 py-0.5 rounded ${statusFilter === 'OBSERVACAO' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600'}`}
              >
                Observação (2)
              </button>
              <button
                onClick={() => setStatusFilter('BLOQUEADO')}
                className={`px-2 py-0.5 rounded ${statusFilter === 'BLOQUEADO' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600'}`}
              >
                Bloqueado (1)
              </button>
            </div>

            {/* Action buttons */}
            <button className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-[11px] flex items-center gap-1 transition">
              <Sliders className="w-3 h-3 text-slate-500" />
              <span>Limiares da Matriz</span>
            </button>

            <button
              onClick={handleForceScan}
              className="px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${scanning ? 'animate-spin' : ''}`} />
              <span>Forçar Varredura</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notificação de Sucesso */}
      {simulatedOrderSuccess && (
        <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-mono flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{simulatedOrderSuccess}</span>
        </div>
      )}

      {/* 2. MATRIZ DE OPORTUNIDADES AO VIVO (TABLE) */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden font-sans">
        <div className="px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="font-black text-slate-900 tracking-tight">
              MATRIZ DE OPORTUNIDADES AO VIVO
            </span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-blue-700 font-bold border border-slate-200">
              PROD_DESK_HFT
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span>ORDENAR POR: <strong className="text-slate-800">EVIDÊNCIA QUANT (DESC)</strong></span>
            <span>|</span>
            <span>FILTRO: <strong className="text-emerald-700">PROTOCOLOS ATIVOS</strong></span>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">ATIVO</th>
                <th className="py-2.5 px-3">TEMPO GRÁFICO</th>
                <th className="py-2.5 px-3">REGIME DE MERCADO</th>
                <th className="py-2.5 px-3">ESTRATÉGIA</th>
                <th className="py-2.5 px-3">EVIDÊNCIA QUANT</th>
                <th className="py-2.5 px-3">CUSTO / SPREAD</th>
                <th className="py-2.5 px-3">PORTAL DE RISCO</th>
                <th className="py-2.5 px-3">ESTADO</th>
                <th className="py-2.5 px-3 text-right">AÇÃO RÁPIDA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {/* Row 1: FRA40.IDX */}
              <tr className="hover:bg-slate-50/70 transition">
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center font-mono">
                      FR
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <strong className="font-bold text-slate-900 text-xs">FRA40.IDX</strong>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      </div>
                      <span className="text-[10px] text-slate-400 block font-mono">Euronext Paris • CAC</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3 font-mono font-bold text-slate-700">1H</td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1 text-emerald-700 font-semibold text-xs">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tendência de Alta</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block font-mono">ADX 38.4 | H-Vol Alta</span>
                </td>
                <td className="py-3 px-3">
                  <span className="text-xs font-semibold text-slate-800 block">Cruzamento de EMA e Continuação</span>
                  <span className="text-[10px] text-slate-500 font-mono">Expansão Agressiva de Volatilidade</span>
                </td>
                <td className="py-3 px-3 font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-emerald-700 text-xs">86%</span>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden my-1">
                    <div className="bg-emerald-500 h-full" style={{ width: '86%' }} />
                  </div>
                  <span className="text-[9px] text-slate-400 block">Alta Confiabilidade (p &lt; 0.01)</span>
                </td>
                <td className="py-3 px-3 font-mono">
                  <span className="font-bold text-slate-900 text-xs block">0,90 pts</span>
                  <span className="text-[10px] text-emerald-700 font-semibold">LÍQUIDO • LIQ A+</span>
                </td>
                <td className="py-3 px-3 font-mono">
                  <div className="flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Aprovado</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">Risco: 1.5% | Max DD Cap OK</span>
                </td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-300">
                    CANDIDATO
                  </span>
                </td>
                <td className="py-3 px-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => {
                        setSelectedAsset('FRA40');
                        setActiveTab('SALA_OPERACOES');
                      }}
                      className="px-2 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-[11px] font-medium transition cursor-pointer flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                      <span>Abrir Painel</span>
                    </button>
                    <button
                      onClick={() => handleSimulateOrder('FRA40', 'BUY', 0.8, 8052.0, 7984.2)}
                      className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition shadow-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Play className="w-3 h-3" />
                      <span>Simular Ordem</span>
                    </button>
                  </div>
                </td>
              </tr>

              {/* Row 2: XAUUSD (OURO) */}
              <tr className="hover:bg-slate-50/70 transition">
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center font-mono">
                      AU
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <strong className="font-bold text-slate-900 text-xs">XAUUSD (OURO)</strong>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      </div>
                      <span className="text-[10px] text-slate-400 block font-mono">Ouro à Vista • London Bullion</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3 font-mono font-bold text-slate-700">5M</td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1 text-blue-700 font-semibold text-xs">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                    <span>Alta Consistente</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block font-mono">VWAP +1.8σ | Desequilíbrio 62%</span>
                </td>
                <td className="py-3 px-3">
                  <span className="text-xs font-semibold text-slate-800 block">Continuação de Pullback com Absorção</span>
                  <span className="text-[10px] text-slate-500 font-mono">Teste na EMA 20 com surto de volume</span>
                </td>
                <td className="py-3 px-3 font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-blue-700 text-xs">92%</span>
                  </div>
                  <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden my-1">
                    <div className="bg-blue-600 h-full" style={{ width: '92%' }} />
                  </div>
                  <span className="text-[9px] text-slate-400 block">Alta Confiabilidade</span>
                </td>
                <td className="py-3 px-3 font-mono">
                  <span className="font-bold text-slate-900 text-xs block">0,25 pts</span>
                  <span className="text-[10px] text-emerald-700 font-semibold">SPREAD MÍNIMO • TIGHT</span>
                </td>
                <td className="py-3 px-3 font-mono">
                  <div className="flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Aprovado</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">Risco: 1.2% | Max Alloc: $450k</span>
                </td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-50 text-amber-700 border border-amber-300">
                    OBSERVAÇÃO
                  </span>
                </td>
                <td className="py-3 px-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => {
                        setSelectedAsset('GOLD');
                        setActiveTab('SALA_OPERACOES');
                      }}
                      className="px-2 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-[11px] font-medium transition cursor-pointer flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                      <span>Abrir Painel</span>
                    </button>
                    <button
                      onClick={() => alert('Proveniência Auditada: Hash 0x8F9A2C0E4B77D1... validado no barramento quântico.')}
                      className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-[11px] font-medium transition cursor-pointer"
                    >
                      Auditar Proveniência
                    </button>
                  </div>
                </td>
              </tr>

              {/* Row 3: US100.NAS */}
              <tr className="hover:bg-slate-50/70 transition">
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center font-mono">
                      NQ
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <strong className="font-bold text-slate-900 text-xs">US100.NAS</strong>
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      </div>
                      <span className="text-[10px] text-slate-400 block font-mono">Nasdaq 100 Futuro • CME/Globex</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3 font-mono font-bold text-slate-700">15M</td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1 text-amber-700 font-semibold text-xs">
                    <Activity className="w-3.5 h-3.5 text-amber-600" />
                    <span>Rompimento Pendente</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block font-mono">Compressão Keltner | Prep de ORB</span>
                </td>
                <td className="py-3 px-3">
                  <span className="text-xs font-semibold text-slate-800 block">Rompimento de Faixa de Abertura (ORB)</span>
                  <span className="text-[10px] text-slate-500 font-mono">Aguardando Abertura Cash NY + 15m</span>
                </td>
                <td className="py-3 px-3 font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-amber-700 text-xs">41%</span>
                  </div>
                  <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden my-1">
                    <div className="bg-amber-500 h-full" style={{ width: '41%' }} />
                  </div>
                  <span className="text-[9px] text-slate-400 block">Dados Insuficientes (Volume)</span>
                </td>
                <td className="py-3 px-3 font-mono">
                  <span className="font-bold text-slate-900 text-xs block">0,75 pts</span>
                  <span className="text-[10px] text-emerald-700 font-semibold">LIQUIDEZ ÓTIMA • PRIME</span>
                </td>
                <td className="py-3 px-3 font-mono">
                  <div className="flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Aprovado</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">Risco: 0.8% | VaR 99.5% Conf</span>
                </td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-blue-50 text-blue-700 border border-blue-300">
                    PESQUISA
                  </span>
                </td>
                <td className="py-3 px-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => {
                        setSelectedAsset('US100');
                        setActiveTab('SALA_OPERACOES');
                      }}
                      className="px-2 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-[11px] font-medium transition cursor-pointer flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                      <span>Abrir Painel</span>
                    </button>
                    <button
                      onClick={() => alert('Log Quantitativo US100: Keltner width: 14.2 pts. Aguardando expansão de volume institucional.')}
                      className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-[11px] font-medium transition cursor-pointer"
                    >
                      Log Quant
                    </button>
                  </div>
                </td>
              </tr>

              {/* Row 4: HK.CASH (HSI) */}
              <tr className="hover:bg-slate-50/70 transition">
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-rose-100 text-rose-800 font-bold text-xs flex items-center justify-center font-mono">
                      HK
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <strong className="font-bold text-slate-900 text-xs">HK.CASH (HSI)</strong>
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      </div>
                      <span className="text-[10px] text-slate-400 block font-mono">Hang Seng Index • HKEX</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3 font-mono font-bold text-slate-700">15M</td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1 text-slate-600 font-semibold text-xs">
                    <Activity className="w-3.5 h-3.5 text-slate-400" />
                    <span>Faixa Lateral</span>
                  </div>
                  <span className="text-[10px] text-rose-600 block font-mono font-bold">Spread Elevado / Ilíquido</span>
                </td>
                <td className="py-3 px-3">
                  <span className="text-xs font-semibold text-slate-800 block">Reversão à Média</span>
                  <span className="text-[10px] text-slate-500 font-mono">Sessão Encerrada / Pré-Leilão</span>
                </td>
                <td className="py-3 px-3 font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-rose-700 text-xs">0%</span>
                  </div>
                  <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden my-1">
                    <div className="bg-rose-500 h-full" style={{ width: '0%' }} />
                  </div>
                  <span className="text-[9px] text-rose-600 block">Bloqueada por Teste Estatístico</span>
                </td>
                <td className="py-3 px-3 font-mono">
                  <span className="font-bold text-rose-700 text-xs block">3,20 pts</span>
                  <span className="text-[10px] text-rose-600 font-bold">RISCO DE SLIPPAGE ELEVADO</span>
                </td>
                <td className="py-3 px-3 font-mono">
                  <div className="flex items-center gap-1 text-rose-700 font-bold text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span>Bloqueado</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">Sessão Encerrada / Limite Diário</span>
                </td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-rose-50 text-rose-700 border border-rose-300">
                    RETER (HOLD)
                  </span>
                </td>
                <td className="py-3 px-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => alert('Violações Detectadas no HK.CASH: 1. Horário fora do pregão regular; 2. Spread acima de 3.0 pts; 3. Volume abaixo do percentil 20.')}
                      className="px-2 py-1 rounded bg-white hover:bg-slate-100 text-rose-700 border border-rose-200 text-[11px] font-medium transition cursor-pointer"
                    >
                      Ver Violações
                    </button>
                    <button
                      onClick={() => alert('Aviso: Ignorar bloqueio de risco pode violar as regras de preservação de capital institucional.')}
                      className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-[11px] font-medium transition cursor-pointer"
                    >
                      Ignorar Bloqueio
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. BOTTOM 3 DIAGNOSTIC WIDGETS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        {/* Widget 1: Matriz de Microestrutura */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs font-mono text-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <strong className="text-slate-900 text-xs font-sans">MATRIZ DE MICROESTRUTURA</strong>
              </div>
              <span className="text-[9px] text-slate-400 font-mono">ATRITOS vs VOL REALIZADA</span>
            </div>
            <p className="text-[10px] text-slate-500 py-1.5 leading-tight">
              Dispersão de atrito de execução contra volatilidade realizada ATR por ativo monitorado.
            </p>

            {/* Scatter Plot Diagram Box */}
            <div className="h-44 bg-slate-50 border border-slate-200 rounded-md p-2.5 relative my-2 overflow-hidden text-[9px]">
              <div className="flex justify-between text-slate-400">
                <span className="text-rose-600 font-bold">ATRITO ELEVADO / BAIXO VOLUME (TÓXICO)</span>
                <span className="text-amber-600 font-bold">ALTA VOLATILIDADE / CUSTO ALTO</span>
              </div>

              {/* Point HK.CASH */}
              <div className="absolute top-10 left-12 flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="bg-rose-100 text-rose-800 px-1 py-0.2 rounded font-bold">HK.CASH (3,20 / 0.40)</span>
              </div>

              {/* Point US100 */}
              <div className="absolute top-20 left-24 flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-bold">US100 (0,75 / 1.50)</span>
              </div>

              {/* Point FRA40 */}
              <div className="absolute bottom-12 right-28 flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-bold">FRA40 (0,90 / 1.80)</span>
              </div>

              {/* Point OURO */}
              <div className="absolute bottom-6 right-8 flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                <span className="bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded font-black border border-blue-300">
                  OURO (0,25 / 2.40)
                </span>
              </div>

              <div className="absolute bottom-1 left-2 text-slate-400 flex items-center gap-2">
                <span>BAIXA VOLATILIDADE →</span>
                <span className="text-emerald-600 font-bold">ZONA DE LIQUIDEZ ÓTIMA</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[10px]">
            <div className="p-2 rounded bg-emerald-50/60 border border-emerald-200">
              <span className="text-slate-500 block">Estimativa de Slippage:</span>
              <strong className="text-emerald-700">Ouro 0.02 pts (Seguro)</strong>
            </div>
            <div className="p-2 rounded bg-rose-50/60 border border-rose-200">
              <span className="text-slate-500 block">Alerta de Custo em HK:</span>
              <strong className="text-rose-700">3.20 pts (Risco de Penalidade)</strong>
            </div>
          </div>
        </div>

        {/* Widget 2: Mapa de Calor de Scores Quantitativos */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs font-mono text-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <strong className="text-slate-900 text-xs font-sans">MAPA DE CALOR DE SCORES QUANTITATIVOS</strong>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                3 VETORES
              </span>
            </div>
            <p className="text-[10px] text-slate-500 py-1.5 leading-tight">
              Médias ponderadas de Momentum (40%), Liquidez (30%) e Consenso de Orderflow (30%).
            </p>

            <div className="space-y-1.5 my-2">
              {[
                { name: 'FRA40', desc: 'Continuação de Alta', m: '+91', l: '84', c: '98%', mCol: 'bg-emerald-100 text-emerald-800', lCol: 'bg-emerald-100 text-emerald-800', cCol: 'bg-emerald-100 text-emerald-800' },
                { name: 'XAUUSD', desc: 'Pullback em Alta', m: '+88', l: '96', c: '92%', mCol: 'bg-emerald-100 text-emerald-800', lCol: 'bg-emerald-100 text-emerald-800', cCol: 'bg-blue-100 text-blue-800' },
                { name: 'US100', desc: 'Compressão / ORB', m: '+32', l: '89', c: '54%', mCol: 'bg-amber-100 text-amber-800', lCol: 'bg-emerald-100 text-emerald-800', cCol: 'bg-slate-100 text-slate-700' },
                { name: 'HK.CASH', desc: 'Liquidez Estagnada', m: '-12', l: '21', c: '18%', mCol: 'bg-rose-100 text-rose-800', lCol: 'bg-rose-100 text-rose-800', cCol: 'bg-rose-100 text-rose-800' },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between p-1.5 rounded bg-slate-50 border border-slate-100 text-[11px]">
                  <div className="w-16 font-bold text-slate-900">{row.name}</div>
                  <div className="w-32 text-slate-500 text-[10px] truncate">{row.desc}</div>
                  <div className="flex items-center gap-1 font-bold text-[10px]">
                    <span className={`px-1.5 py-0.5 rounded ${row.mCol}`}>M: {row.m}</span>
                    <span className={`px-1.5 py-0.5 rounded ${row.lCol}`}>L: {row.l}</span>
                    <span className={`px-1.5 py-0.5 rounded ${row.cCol}`}>C: {row.c}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex justify-between items-center">
            <span>ÁRBITRO ALGO: <strong className="text-emerald-700 font-bold">ATIVADO</strong></span>
            <span>TOLERÂNCIA D: 0,15σ</span>
          </div>
        </div>

        {/* Widget 3: Inspetor do Ativo: FRA40.IDX ('1H) */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs font-mono text-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <strong className="text-slate-900 text-xs font-sans">INSPETOR DO ATIVO: FRA40.IDX ('1H)</strong>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-50 text-emerald-700 font-bold border border-emerald-300">
                CANDIDATO
              </span>
            </div>

            <div className="my-2 p-2 rounded bg-blue-50/60 border border-blue-200 text-[11px] text-slate-700">
              <span className="text-[10px] text-blue-800 font-bold block mb-1">GATILHO ALGORÍTMICO ATIVO:</span>
              <code className="text-blue-900 font-black">
                EMA(9) &gt; EMA(21) + Rompimento com Volume &gt; 2.2x média
              </code>
            </div>

            <p className="text-[10px] text-slate-600 leading-relaxed">
              O regime atual apresenta forte expansão direcional em 1H com alinhamento multi-timeframe positivo (15M e 4H convergentes). Risco dentro da margem permitida (&lt; 2.0% de exposição).
            </p>

            {/* 3 Metric Boxes */}
            <div className="grid grid-cols-3 gap-1.5 my-3 text-center">
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[9px] text-slate-500 block">PONTUAÇÃO ALPHA</span>
                <span className="text-sm font-black text-emerald-600">8,9 / 10</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[9px] text-slate-500 block">ALVO STOP LOSS</span>
                <span className="text-xs font-black text-rose-600">7.984,2</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[9px] text-slate-500 block">ALVO TAKE PROFIT</span>
                <span className="text-xs font-black text-emerald-600">8.052,0</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => {
                setSelectedAsset('FRA40');
                setActiveTab('SALA_OPERACOES');
              }}
              className="w-full py-1.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs transition cursor-pointer"
            >
              CARREGAR NA SALA DE OPERAÇÕES →
            </button>
          </div>
        </div>
      </div>

      {/* 4. TOAST NOTIFICATION POPUP (Bottom Right) */}
      {!toastDismissed && (
        <div className="fixed bottom-4 right-4 z-50 w-96 bg-white border border-slate-300 rounded-xl p-3.5 shadow-2xl animate-in slide-in-from-bottom duration-200 font-mono text-xs">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-emerald-700 font-bold block">
                  NOVA OPORTUNIDADE DETECTADA
                </span>
                <span className="font-bold text-slate-900 text-xs">
                  FRA40 1H Tendência de Alta
                </span>
              </div>
            </div>

            <button
              onClick={() => setToastDismissed(true)}
              className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-2 text-[10px] text-slate-600 space-y-0.5 border-y border-slate-100 my-2 font-sans">
            <div>
              Evidência Quant: <strong className="text-emerald-700">86%</strong> | Portal de Risco: <strong className="text-emerald-700">Aprovado (1.5%)</strong>
            </div>
            <div className="text-slate-500">
              Consenso algorítmico 3/3 • Spread dentro do cap (0,90 pts)
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 font-mono">
            <button
              onClick={() => {
                setSelectedAsset('FRA40');
                setActiveTab('SALA_OPERACOES');
              }}
              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition cursor-pointer"
            >
              Ver Detalhes
            </button>
            <button
              onClick={() => {
                handleSimulateOrder('FRA40', 'BUY', 0.8, 8052.0, 7984.2);
                setToastDismissed(true);
              }}
              className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <Play className="w-3 h-3" />
              <span>Simular Paper</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
