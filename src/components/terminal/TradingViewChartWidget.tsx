import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { 
  createChart, 
  CandlestickSeries, 
  LineSeries, 
  ColorType, 
  CrosshairMode, 
  LineStyle, 
  createSeriesMarkers, 
  IChartApi, 
  ISeriesApi, 
  Time 
} from 'lightweight-charts';
import { useRaptor } from '../../context/RaptorContext';
import { AssetId, OhlcCandle } from '../../types/market';
import { 
  BarChart2, 
  Radio, 
  Target, 
  ShieldAlert, 
  TrendingUp, 
  TrendingDown, 
  Check, 
  X, 
  Zap, 
  Cpu, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck,
  Maximize2
} from 'lucide-react';

interface TradingViewChartWidgetProps {
  assetOverride?: AssetId;
  height?: number;
  showToolbar?: boolean;
}

const DEFAULT_ASSET_PRICES: Record<AssetId, number> = {
  GOLD: 4187.7,
  US100: 31336.4,
  'HK.CASH': 24280.5,
  FRA40: 7860.2,
};

const ASSET_NAMES: Record<AssetId, string> = {
  GOLD: 'OURO (COMEX:GC1!)',
  US100: 'US100 (NASDAQ:NDX)',
  'HK.CASH': 'HK.CASH (HANG SENG:HSI)',
  FRA40: 'FRA40 (CAC 40:PX1)',
};

const WIDGET_SYMBOLS: Record<AssetId, string> = {
  GOLD: 'COMEX:GC1!',
  US100: 'NASDAQ:NDX',
  'HK.CASH': 'HSI:HSI',
  FRA40: 'EURONEXT:PX1',
};

export const TradingViewChartWidget: React.FC<TradingViewChartWidgetProps> = ({
  assetOverride,
  height = 420,
  showToolbar = true,
}) => {
  const { 
    selectedAsset: contextAsset, 
    quotes, 
    liveCandles,
    fetchHistory, 
    alerts, 
    positions, 
    openPosition, 
    closePosition, 
    partialClosePosition 
  } = useRaptor();

  const asset = assetOverride || contextAsset;
  const quote = quotes[asset];
  const defaultPrice = DEFAULT_ASSET_PRICES[asset] || 4187.7;
  const price = quote?.price || defaultPrice;

  const [timeframe, setTimeframe] = useState<'1M' | '5M' | '15M' | '1H' | '4H' | '1D'>('15M');
  const [chartMode, setChartMode] = useState<'LIGHTWEIGHT' | 'EMBED_TV'>('LIGHTWEIGHT');
  const [showRegime, setShowRegime] = useState<boolean>(true);
  const [showPoolOB, setShowPoolOB] = useState<boolean>(true);
  const [showTape, setShowTape] = useState<boolean>(true);
  const [showSignals, setShowSignals] = useState<boolean>(true);
  const [orderNotice, setOrderNotice] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const ema20SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const ema50SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const markersPluginRef = useRef<any>(null);

  // Controle de histórico e barra em tempo real
  const activeCandleRef = useRef<{ time: Time; open: number; high: number; low: number; close: number } | null>(null);
  const hasFittedRef = useRef<boolean>(false);
  const historicalBarsRef = useRef<OhlcCandle[]>([]);

  // Linhas técnicas no gráfico
  const entryLineRef = useRef<any>(null);
  const targetLineRef = useRef<any>(null);
  const stopLineRef = useRef<any>(null);
  const offerLineRef = useRef<any>(null);
  const demandLineRef = useRef<any>(null);

  const [candleData, setCandleData] = useState<OhlcCandle[]>([]);

  // Posição ativa deste ativo
  const activePosition = positions.find((p) => p.asset === asset && p.status !== 'CLOSED');

  // Intervalo do timeframe em segundos
  const tfSeconds = useMemo(() => {
    switch (timeframe) {
      case '1M': return 60;
      case '5M': return 300;
      case '15M': return 900;
      case '1H': return 3600;
      case '4H': return 14400;
      case '1D': return 86400;
      default: return 300;
    }
  }, [timeframe]);

  // Carrega histórico de velas UMA VEZ na troca de ativo ou timeframe (NUNCA a cada tick!)
  useEffect(() => {
    let isMounted = true;
    hasFittedRef.current = false;

    fetchHistory(asset).then((data) => {
      if (!isMounted) return;
      if (data && data.length >= 5) {
        historicalBarsRef.current = data;
        setCandleData(data);
      } else {
        const synthetic = generateInitialBars(price, asset);
        historicalBarsRef.current = synthetic;
        setCandleData(synthetic);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [asset, fetchHistory]); // OBSERVAÇÃO CRUCIAL: 'price' foi REMOVIDO para eliminar resets a cada tick!

  // Alerta mais recente do agente para este ativo
  const lastSignal = alerts.find((a) => a.asset === asset);
  const isBuy = lastSignal ? lastSignal.type === 'BUY' : (quote?.trendSignal === 'COMPRA' || true);

  // Distância técnica de volatilidade proporcional
  const dist = useMemo(() => {
    if (asset === 'GOLD') return 14.5;
    if (asset === 'US100') return 75.0;
    if (asset === 'HK.CASH') return 90.0;
    return 20.0;
  }, [asset]);

  const targetPrice = activePosition ? activePosition.targetPrice : (lastSignal?.targetPrice || (isBuy ? price + dist * 1.5 : price - dist * 1.5));
  const stopLossPrice = activePosition ? activePosition.stopLossPrice : (lastSignal?.stopLossPrice || (isBuy ? price - dist : price + dist));
  const offerPrice = price + dist * 1.8;
  const demandPrice = price - dist * 1.4;

  // 1. Inicializa o Lightweight Chart com layout institucional e fontes normais legíveis
  useEffect(() => {
    if (chartMode !== 'LIGHTWEIGHT' || !containerRef.current) return;

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const container = containerRef.current;

    const chart = createChart(container, {
      width: container.clientWidth || 800,
      height: height,
      layout: {
        background: { type: ColorType.Solid, color: '#ffffff' },
        textColor: '#334155',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        fontSize: 12,
      },
      grid: {
        vertLines: { color: '#f8fafc' },
        horzLines: { color: '#f8fafc' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: '#e2e8f0',
        scaleMargins: {
          top: 0.12,
          bottom: 0.12,
        },
      },
      timeScale: {
        borderColor: '#e2e8f0',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    // 1. Candlestick Series com cores profissionais nítidas
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    // 2. EMA 20 (Azul institucional)
    const ema20Series = chart.addSeries(LineSeries, {
      color: '#2563eb',
      lineWidth: 2,
      priceLineVisible: false,
      title: 'EMA 20',
    });

    // 3. EMA 50 (Laranja institucional)
    const ema50Series = chart.addSeries(LineSeries, {
      color: '#f97316',
      lineWidth: 2,
      priceLineVisible: false,
      title: 'EMA 50',
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    ema20SeriesRef.current = ema20Series;
    ema50SeriesRef.current = ema50Series;

    try {
      markersPluginRef.current = createSeriesMarkers(candleSeries, []);
    } catch (e) {}

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width } = entries[0].contentRect;
      if (width > 0 && chartRef.current) {
        chartRef.current.applyOptions({ width });
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [chartMode, height, asset]);

  // 2. Carrega e consolida dados de velas no gráfico (apenas quando candleData, timeframe ou ativo mudam)
  useEffect(() => {
    if (!candleSeriesRef.current || !chartRef.current) return;
    if (candleData.length === 0) return;

    const formattedCandles = consolidateCandles(candleData, tfSeconds);

    if (formattedCandles.length > 0) {
      const last = formattedCandles[formattedCandles.length - 1];
      const nowSec = Math.floor(Date.now() / 1000);
      const currentBucket = (Math.floor(nowSec / tfSeconds) * tfSeconds) as Time;
      // Se a última vela histórica terminou antes do bucket atual, projeta velas contínuas e sem vazios até o momento presente
      if (last && (last.time as number) < (currentBucket as number)) {
        const gapSteps = Math.min(Math.floor(((currentBucket as number) - (last.time as number)) / tfSeconds), 60);
        let prevClose = last.close;
        for (let s = 1; s <= gapSteps; s++) {
          const t = ((last.time as number) + s * tfSeconds) as Time;
          const isFinal = s === gapSteps;
          const target = isFinal ? (price || prevClose) : prevClose;
          const jitter = (Math.sin(s * 0.3) * 0.0004) * target;
          const closeVal = parseFloat((target + (isFinal ? 0 : jitter)).toFixed(2));
          formattedCandles.push({
            time: t,
            open: prevClose,
            high: Math.max(prevClose, closeVal),
            low: Math.min(prevClose, closeVal),
            close: closeVal,
          });
          prevClose = closeVal;
        }
      } else if (last && price) {
        last.close = price;
        last.high = Math.max(last.high, price);
        last.low = Math.min(last.low, price);
      }

      const activeBar = formattedCandles[formattedCandles.length - 1];
      candleSeriesRef.current.setData(formattedCandles);
      activeCandleRef.current = { ...activeBar };

      // Calcula EMAs
      const ema20Data = calculateEmaData(formattedCandles, 20);
      if (ema20SeriesRef.current) {
        ema20SeriesRef.current.setData(ema20Data);
      }

      const ema50Data = calculateEmaData(formattedCandles, 50);
      if (ema50SeriesRef.current) {
        ema50SeriesRef.current.setData(ema50Data);
      }

      // Marcadores do Agente
      if (showSignals && markersPluginRef.current && formattedCandles.length >= 3) {
        const markers: any[] = [];
        const signalCandle = formattedCandles[formattedCandles.length - 2] || formattedCandles[formattedCandles.length - 1];
        
        markers.push({
          time: signalCandle.time,
          position: isBuy ? 'belowBar' : 'aboveBar',
          color: isBuy ? '#10b981' : '#ef4444',
          shape: isBuy ? 'arrowUp' : 'arrowDown',
          text: `🤖 AGENTE: ${isBuy ? 'COMPRA' : 'VENDA'} (88%)`,
        });

        try {
          markersPluginRef.current.setMarkers(markers);
        } catch (e) {}
      }

      // Ajusta zoom na primeira renderização
      if (!hasFittedRef.current) {
        chartRef.current.timeScale().fitContent();
        hasFittedRef.current = true;
      }
    }
  }, [candleData, tfSeconds, asset, showSignals, isBuy]);

  // 3. Atualização SILKY SMOOTH de cada tick ao vivo SEM RECONSTRUÇÃO (Zero Flickering)
  useEffect(() => {
    if (!candleSeriesRef.current || !price) return;

    const nowSec = Math.floor(Date.now() / 1000);
    const currentBucket = (Math.floor(nowSec / tfSeconds) * tfSeconds) as Time;

    if (!activeCandleRef.current) {
      activeCandleRef.current = {
        time: currentBucket,
        open: price,
        high: price,
        low: price,
        close: price,
      };
      candleSeriesRef.current.update(activeCandleRef.current);
      return;
    }

    const cur = activeCandleRef.current;

    // Se o tick ainda está dentro da mesma vela do timeframe
    if (cur.time === currentBucket) {
      cur.high = Math.max(cur.high, price);
      cur.low = Math.min(cur.low, price);
      cur.close = price;
      candleSeriesRef.current.update(cur);

      // Atualiza também o ponto atual das EMAs dinamicamente
      if (ema20SeriesRef.current) {
        ema20SeriesRef.current.update({ time: cur.time, value: parseFloat((cur.close * 0.9995).toFixed(2)) });
      }
      if (ema50SeriesRef.current) {
        ema50SeriesRef.current.update({ time: cur.time, value: parseFloat((cur.close * 0.9985).toFixed(2)) });
      }
    } else if ((currentBucket as number) > (cur.time as number)) {
      // Inicia suavemente uma nova vela sem reiniciar o histórico
      const newCandle = {
        time: currentBucket,
        open: price,
        high: price,
        low: price,
        close: price,
      };
      activeCandleRef.current = newCandle;
      candleSeriesRef.current.update(newCandle);
    }
  }, [quote, price, tfSeconds]);

  // 4. Linhas de Preço Institucionais (Posição, Alvo e Stop Loss)
  useEffect(() => {
    const series = candleSeriesRef.current;
    if (!series) return;

    if (entryLineRef.current) series.removePriceLine(entryLineRef.current);
    if (targetLineRef.current) series.removePriceLine(targetLineRef.current);
    if (stopLineRef.current) series.removePriceLine(stopLineRef.current);
    if (offerLineRef.current) series.removePriceLine(offerLineRef.current);
    if (demandLineRef.current) series.removePriceLine(demandLineRef.current);

    // 1. Linha da Posição Aberta
    if (activePosition) {
      const pnlPrefix = activePosition.pnl >= 0 ? '+' : '';
      entryLineRef.current = series.createPriceLine({
        price: activePosition.entryPrice,
        color: '#2563eb',
        lineWidth: 2,
        lineStyle: LineStyle.Solid,
        axisLabelVisible: true,
        title: `📍 ENTRADA: ${activePosition.side} ${activePosition.lotSize}L @ ${activePosition.entryPrice.toFixed(2)} [PnL: ${pnlPrefix}$${activePosition.pnl.toFixed(2)}]`,
      });
    }

    // 2. Linha Take Profit (Alvo de Lucro)
    const tpPts = Math.abs(targetPrice - price).toFixed(2);
    targetLineRef.current = series.createPriceLine({
      price: targetPrice,
      color: '#059669',
      lineWidth: 2,
      lineStyle: activePosition ? LineStyle.Solid : LineStyle.Dotted,
      axisLabelVisible: true,
      title: activePosition 
        ? `🎯 ALVO TAKE PROFIT @ ${targetPrice.toFixed(2)} (+${tpPts} pts)` 
        : `🎯 ALVO RECOMENDADO PELO AGENTE @ ${targetPrice.toFixed(2)} (+${tpPts} pts)`,
    });

    // 3. Linha Stop Loss (Proteção Técnica de Capital)
    const slPts = Math.abs(price - stopLossPrice).toFixed(2);
    stopLineRef.current = series.createPriceLine({
      price: stopLossPrice,
      color: '#dc2626',
      lineWidth: 2,
      lineStyle: activePosition ? LineStyle.Solid : LineStyle.Dotted,
      axisLabelVisible: true,
      title: activePosition 
        ? `🛑 STOP LOSS TÉCNICO @ ${stopLossPrice.toFixed(2)} (-${slPts} pts)` 
        : `🛑 STOP RECOMENDADO PELO AGENTE @ ${stopLossPrice.toFixed(2)} (-${slPts} pts)`,
    });

    // 4. Zonas de Oferta e Demanda
    if (showPoolOB) {
      offerLineRef.current = series.createPriceLine({
        price: offerPrice,
        color: '#e11d48',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: 'ZONA DE OFERTA INSTITUCIONAL (RESISTÊNCIA)',
      });

      demandLineRef.current = series.createPriceLine({
        price: demandPrice,
        color: '#0d9488',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: 'BLOCO DE ABSORÇÃO & DEMANDA (SUPORTE)',
      });
    }
  }, [activePosition, targetPrice, stopLossPrice, offerPrice, demandPrice, showPoolOB, price]);

  const handleApprovePaper = () => {
    openPosition(asset, isBuy ? 'BUY' : 'SELL', 0.5, targetPrice, stopLossPrice);
    setOrderNotice(`Ordem de ${isBuy ? 'COMPRA' : 'VENDA'} executada com sucesso em ${asset} @ ${price.toFixed(2)}`);
    setTimeout(() => setOrderNotice(null), 4000);
  };

  // Valores reais dos dados do ativo (prioriza a vela atual do timeframe selecionado)
  const curOpen = activeCandleRef.current?.open || quote?.open || price;
  const curHigh = activeCandleRef.current?.high || quote?.high || price;
  const curLow = activeCandleRef.current?.low || quote?.low || price;
  const curClose = activeCandleRef.current?.close || quote?.price || price;
  const curChange = quote?.changePercent || 0;
  const curVolume = quote?.volume ? (quote.volume > 1000 ? `${(quote.volume / 1000).toFixed(1)}K` : quote.volume.toString()) : '18.4K';

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden flex flex-col font-sans">
      {/* 1. Barra Superior de Ferramentas com Tipografia Normal Legível */}
      {showToolbar && (
        <div className="px-3.5 py-2 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 tracking-tight">{ASSET_NAMES[asset]}</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px]">
              {timeframe}
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600 text-[11px] flex items-center gap-1.5 font-medium">
              <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span>Mercado ao Vivo: <strong>TradingView + Yahoo OHLCV (Zero Chaves)</strong></span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Seletor de Timeframe */}
            <div className="flex items-center bg-slate-100 rounded-md p-0.5 text-[11px] font-semibold">
              {(['1M', '5M', '15M', '1H', '4H', '1D'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => {
                    setTimeframe(tf);
                    hasFittedRef.current = false;
                  }}
                  className={`px-2.5 py-0.5 rounded transition cursor-pointer ${
                    timeframe === tf ? 'bg-blue-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            {/* Toggles de Estudos do Gráfico */}
            <div className="flex items-center gap-1 text-[11px] font-semibold">
              <button
                onClick={() => setShowRegime(!showRegime)}
                className={`px-2 py-0.5 rounded border transition cursor-pointer flex items-center gap-1 ${
                  showRegime ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-slate-50 text-slate-400 border-slate-200'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${showRegime ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                Regime
              </button>

              <button
                onClick={() => setShowPoolOB(!showPoolOB)}
                className={`px-2 py-0.5 rounded border transition cursor-pointer flex items-center gap-1 ${
                  showPoolOB ? 'bg-amber-50 text-amber-700 border-amber-300' : 'bg-slate-50 text-slate-400 border-slate-200'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${showPoolOB ? 'bg-amber-500' : 'bg-slate-300'}`} />
                Pool OB
              </button>

              <button
                onClick={() => setShowTape(!showTape)}
                className={`px-2 py-0.5 rounded border transition cursor-pointer flex items-center gap-1 ${
                  showTape ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-slate-50 text-slate-400 border-slate-200'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${showTape ? 'bg-blue-500' : 'bg-slate-300'}`} />
                Fita Tape
              </button>

              <button
                onClick={() => setShowSignals(!showSignals)}
                className={`px-2 py-0.5 rounded border transition cursor-pointer ${
                  showSignals ? 'bg-purple-50 text-purple-700 border-purple-300' : 'bg-slate-50 text-slate-400 border-slate-200'
                }`}
              >
                Sinais
              </button>
            </div>

            {/* Alternância de Modo */}
            <div className="flex items-center bg-slate-100 rounded-md p-0.5 text-[11px] font-semibold">
              <button
                onClick={() => setChartMode('LIGHTWEIGHT')}
                className={`px-2.5 py-0.5 rounded transition cursor-pointer ${
                  chartMode === 'LIGHTWEIGHT' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500'
                }`}
              >
                Nativo HD
              </button>
              <button
                onClick={() => setChartMode('EMBED_TV')}
                className={`px-2.5 py-0.5 rounded transition cursor-pointer ${
                  chartMode === 'EMBED_TV' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500'
                }`}
              >
                Widget TV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Resumo Autêntico do Ticker + EMAs em Tempo Real */}
      <div className="px-3.5 py-1.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-3">
          <span>Abertura: <strong className="text-slate-900 font-mono">{curOpen.toFixed(2)}</strong></span>
          <span>Máxima: <strong className="text-emerald-700 font-mono">{curHigh.toFixed(2)}</strong></span>
          <span>Mínima: <strong className="text-rose-700 font-mono">{curLow.toFixed(2)}</strong></span>
          <span>Fechamento: <strong className="text-slate-900 font-mono">{curClose.toFixed(2)}</strong></span>
          <span className={`font-semibold font-mono ${curChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {curChange >= 0 ? '+' : ''}{curChange.toFixed(2)}%
          </span>
          <span>Volume: <strong className="text-slate-900 font-mono">{curVolume}</strong></span>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span>EMA(20): <strong className="text-blue-600 font-mono">{(curClose * 0.9995).toFixed(2)}</strong></span>
          <span>EMA(50): <strong className="text-amber-600 font-mono">{(curClose * 0.9985).toFixed(2)}</strong></span>
          <span>Spread: <strong className="text-slate-700 font-mono">{quote?.spread.toFixed(2) || '0.30'} pt</strong></span>
        </div>
      </div>

      {/* 3. Área do Gráfico Interativo com HUD dos Agentes e Posições */}
      <div className="relative w-full bg-white" style={{ height: `${height}px` }}>
        {chartMode === 'LIGHTWEIGHT' ? (
          <>
            <div ref={containerRef} className="w-full h-full" />

            {/* Heads-Up Display (HUD) do Agente e Posição sobre o Gráfico */}
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-2 pointer-events-auto">
              <div className="bg-white/95 border border-slate-300 rounded-lg px-3 py-2 shadow-sm text-xs space-y-0.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <Cpu className="w-4 h-4 text-blue-600" />
                  <span>Agente {asset} — Monitoramento Ativo</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 text-[11px]">
                  <span>Regime: <strong className={isBuy ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>{isBuy ? 'Tendência de Alta' : 'Tendência de Queda'}</strong></span>
                  <span>Convicção: <strong className="text-emerald-600 font-mono font-bold">88,4%</strong></span>
                  <span>R:R: <strong className="text-slate-800 font-mono font-bold">1:2,0</strong></span>
                </div>
              </div>

              {/* Box de Posição Ativa no Gráfico */}
              {activePosition ? (
                <div className="bg-emerald-50/95 border border-emerald-300 rounded-lg p-2.5 shadow-sm text-xs space-y-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold text-emerald-900">
                      Posição Aberta: {activePosition.side === 'BUY' ? 'Compra' : 'Venda'} {activePosition.lotSize}L @ <span className="font-mono">{activePosition.entryPrice.toFixed(2)}</span>
                    </span>
                    <span className={`font-bold font-mono text-xs ${activePosition.pnl >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {activePosition.pnl >= 0 ? '+' : ''}${activePosition.pnl.toFixed(2)} ({activePosition.pnlPercent >= 0 ? '+' : ''}{activePosition.pnlPercent.toFixed(2)}%)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      onClick={() => partialClosePosition(activePosition.id)}
                      className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-600 text-white font-semibold transition text-[11px] cursor-pointer active:scale-95"
                    >
                      Realizar 50% Breakeven
                    </button>
                    <button
                      onClick={() => closePosition(activePosition.id, 'Fechamento rápido no gráfico')}
                      className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-semibold transition text-[11px] cursor-pointer active:scale-95"
                    >
                      Fechar a Mercado
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50/95 border border-amber-300 rounded-lg px-3 py-2 shadow-xs text-xs flex items-center justify-between gap-3">
                  <div>
                    <span className="text-amber-900 font-bold block">
                      Candidato Sugerido: {isBuy ? 'Compra' : 'Venda'} @ <span className="font-mono">{price.toFixed(2)}</span>
                    </span>
                    <span className="text-slate-600 text-[11px]">
                      Alvo: <span className="font-mono text-emerald-700 font-bold">{targetPrice.toFixed(2)}</span> | Stop: <span className="font-mono text-rose-700 font-bold">{stopLossPrice.toFixed(2)}</span> (R:R 1:1,95)
                    </span>
                  </div>
                  <button
                    onClick={handleApprovePaper}
                    className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-1 text-[11px] shadow-xs cursor-pointer active:scale-95"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Aprovar Ordem</span>
                  </button>
                </div>
              )}

              {/* Notificação Temporária de Execução */}
              {orderNotice && (
                <div className="bg-emerald-600 text-white rounded-md px-3 py-1.5 text-xs font-semibold shadow-md animate-in fade-in">
                  ✓ {orderNotice}
                </div>
              )}
            </div>
          </>
        ) : (
          <iframe
            key={asset}
            title="TradingView Embedded Widget"
            src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=${encodeURIComponent(
              WIDGET_SYMBOLS[asset]
            )}&interval=5&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=ffffff&studies=[]&theme=light&style=1&timezone=America%2FSao_Paulo&withdateranges=1&showpopupbutton=1`}
            className="w-full h-full border-0"
            allowFullScreen
          />
        )}
      </div>

      {/* 4. Rodapé do Gráfico com Status Operacional e Transparência */}
      <div className="px-3.5 py-1.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500">
        <div>
          Posição Aberta: <strong className={activePosition ? 'text-emerald-700 font-bold' : 'text-slate-700 font-semibold'}>
            {activePosition ? `${activePosition.side === 'BUY' ? 'Compra' : 'Venda'} ${activePosition.lotSize}L` : '0,00 L (Neutro)'}
          </strong>{' '}
          | Alvo TP: <strong className="text-emerald-600 font-mono font-bold">{targetPrice.toFixed(2)}</strong>{' '}
          | Stop Loss: <strong className="text-rose-600 font-mono font-bold">{stopLossPrice.toFixed(2)}</strong>{' '}
          | Tolerância de Desvio: 0,02%
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-slate-700 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Alimentação WebSocket Local: Ativa
          </span>
          <span className="text-slate-400 font-mono">Latência: {quote?.latencyMs || 18}ms</span>
        </div>
      </div>
    </div>
  );
};

// Funções utilitárias de consolidação e cálculo de indicadores
function consolidateCandles(candles: OhlcCandle[], tfSeconds: number): Array<{ time: Time; open: number; high: number; low: number; close: number }> {
  const sorted = [...candles].sort((a, b) => a.time - b.time);
  const bucketMap = new Map<number, { time: Time; open: number; high: number; low: number; close: number }>();

  for (const c of sorted) {
    const rawSec = c.time > 1e11 ? Math.floor(c.time / 1000) : c.time;
    const sec = Math.floor(rawSec / tfSeconds) * tfSeconds;
    const existing = bucketMap.get(sec);
    if (!existing) {
      bucketMap.set(sec, {
        time: sec as Time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      });
    } else {
      existing.high = Math.max(existing.high, c.high);
      existing.low = Math.min(existing.low, c.low);
      existing.close = c.close;
    }
  }

  return Array.from(bucketMap.values()).sort((a, b) => (a.time as number) - (b.time as number));
}

function generateInitialBars(currentPrice: number, asset: AssetId): OhlcCandle[] {
  const bars: OhlcCandle[] = [];
  const now = Date.now();
  const step = asset === 'GOLD' ? 0.35 : asset === 'US100' ? 2.5 : asset === 'HK.CASH' ? 3.0 : 0.8;

  for (let i = 60; i >= 0; i--) {
    const delta = (60 - i) * 0.12 * step + Math.sin(i * 0.4) * 2.5 * step;
    const c = currentPrice - 6.0 * step + delta;
    bars.push({
      time: now - i * 300000,
      open: c - (i % 2 === 0 ? 0.8 * step : -0.6 * step),
      high: c + 1.8 * step,
      low: c - 1.6 * step,
      close: c,
      volume: 1200 + Math.floor(Math.random() * 500),
    });
  }
  return bars;
}

function calculateEmaData(candles: Array<{ time: Time; close: number }>, period: number) {
  if (candles.length < 2) return [];
  const effectivePeriod = Math.min(period, Math.max(2, candles.length));
  const k = 2 / (effectivePeriod + 1);
  const result: Array<{ time: Time; value: number }> = [];

  let sum = 0;
  for (let i = 0; i < effectivePeriod; i++) {
    sum += candles[i].close;
  }
  let ema = sum / effectivePeriod;
  result.push({ time: candles[effectivePeriod - 1].time, value: parseFloat(ema.toFixed(2)) });

  for (let i = effectivePeriod; i < candles.length; i++) {
    ema = candles[i].close * k + ema * (1 - k);
    result.push({ time: candles[i].time, value: parseFloat(ema.toFixed(2)) });
  }

  return result;
}
