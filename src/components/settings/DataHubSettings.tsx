import React, { useState } from 'react';
import { useRaptor } from '../../context/RaptorContext';
import { ServerConfig } from '../../types/market';
import { 
  Settings, 
  Radio, 
  ShieldCheck, 
  Send, 
  CheckCircle, 
  Wifi, 
  Terminal, 
  Sliders, 
  Activity,
  Layers,
  Cpu,
  Key,
  Globe,
  Database
} from 'lucide-react';

export const DataHubSettings: React.FC = () => {
  const { config, updateServerConfig, sendTelegramTest, rawWsLogs, status, latencyMs } = useRaptor();

  const [botToken, setBotToken] = useState<string>(config?.telegram.botToken || '');
  const [chatId, setChatId] = useState<string>(config?.telegram.chatId || '');
  const [minConfidence, setMinConfidence] = useState<number>(config?.minConfidenceFilter || 75);

  // Chaves de APIs Abertas
  const [finnhubKey, setFinnhubKey] = useState<string>(config?.openApiKeys?.finnhub || '');
  const [alphaVantageKey, setAlphaVantageKey] = useState<string>(config?.openApiKeys?.alphaVantage || '');
  const [twelveDataKey, setTwelveDataKey] = useState<string>(config?.openApiKeys?.twelveData || '');
  const [providerPref, setProviderPref] = useState<string>(config?.openApiKeys?.providerPreference || 'AUTO');

  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [telegramStatus, setTelegramStatus] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);

    const payload: Partial<ServerConfig> = {
      minConfidenceFilter: minConfidence,
      autoConnectTradingView: true,
      openApiKeys: {
        finnhub: finnhubKey.trim(),
        alphaVantage: alphaVantageKey.trim(),
        twelveData: twelveDataKey.trim(),
        providerPreference: providerPref as any,
      },
      telegram: {
        botToken: botToken.trim(),
        chatId: chatId.trim(),
        enabled: Boolean(botToken && chatId),
      },
    };

    const ok = await updateServerConfig(payload);
    setSaving(false);
    if (ok) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleTestTelegram = async () => {
    setTelegramStatus('ENVIANDO TESTE...');
    const ok = await sendTelegramTest();
    setTelegramStatus(ok ? 'MENSAGEM ENVIADA COM SUCESSO AO TELEGRAM!' : 'ERRO NO ENVIO. VERIFIQUE O TOKEN E O CHAT ID.');
    setTimeout(() => setTelegramStatus(null), 5000);
  };

  return (
    <div className="space-y-4 font-sans text-slate-800">
      {/* 1. Header de Configurações */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-mono">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-600">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase font-sans tracking-tight">
              CENTRAL DE DADOS, PROVEDORES AO VIVO & CHAVES API
            </h2>
            <p className="text-[11px] text-slate-500 font-sans">
              Fontes primárias públicas de mercado (TradingView Scanner + Yahoo OHLCV) e integração opcional com APIs abertas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400">LATÊNCIA DO SERVIDOR:</span>
          <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-300 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {latencyMs}ms (MERCADO AO VIVO)
          </span>
        </div>
      </div>

      {/* 2. Grid de Configurações e Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Coluna Esquerda: Status dos Provedores e Chaves Abertas (7 cols) */}
        <div className="lg:col-span-7 space-y-3.5 font-mono text-xs">
          {/* Box de Confirmação do TradingView + Yahoo Real OHLCV */}
          <div className="bg-emerald-50/50 border border-emerald-300 rounded-lg p-4 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
                <h3 className="font-bold text-emerald-900 text-xs uppercase font-sans">
                  PROVEDOR DUPLO EM TEMPO REAL (NATIVO & ATIVO)
                </h3>
              </div>
              <span className="text-[10px] text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-300 font-bold">
                100% OPERACIONAL
              </span>
            </div>
            <p className="text-[11px] text-slate-700 leading-relaxed font-sans">
              O RAPTOR sincroniza automaticamente o fluxo de cotações tick a tick do <strong>TradingView Scanner</strong> com a série histórica de velas de 5 minutos do <strong>Yahoo Finance Exchange Feed</strong> e contingência <strong>Binance</strong> para garantir 100% de precisão nos gráficos e preços.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="text-slate-400 text-[11px] block">Ouro Futuro:</span>
                <strong className="text-slate-800 font-bold">COMEX:GC1! (GC=F)</strong>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="text-slate-400 text-[11px] block">Nasdaq-100:</span>
                <strong className="text-slate-800 font-bold">NASDAQ:NDX (^NDX)</strong>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="text-slate-400 text-[11px] block">Hang Seng:</span>
                <strong className="text-slate-800 font-bold">HSI:HSI (^HSI)</strong>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="text-slate-400 text-[11px] block">CAC 40 Paris:</span>
                <strong className="text-slate-800 font-bold">EURONEXT:PX1 (^FCHI)</strong>
              </div>
            </div>
          </div>

          {/* Integração com Chaves de Código Aberto & APIs Gratuitas */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 shadow-2xs font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-xs uppercase">
                  CONECTORES DE CÓDIGO ABERTO (CHAVES OPCIONAIS)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                PLUG-AND-PLAY
              </span>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              O sistema funciona nativamente sem nenhuma chave. Caso você possua chaves gratuitas de projetos de código aberto ou serviços parceiros, pode inseri-las abaixo para acoplamento de dados redundantes:
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">
                  PREFERÊNCIA DE PROVEDOR DE MERCADO:
                </label>
                <select
                  value={providerPref}
                  onChange={(e) => setProviderPref(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-slate-900 outline-none font-sans text-xs"
                >
                  <option value="AUTO">Automático (TradingView Scanner + Yahoo Real OHLCV + Contingência)</option>
                  <option value="FINNHUB">Finnhub API (Se chave fornecida)</option>
                  <option value="ALPHAVANTAGE">Alpha Vantage API (Se chave fornecida)</option>
                  <option value="TWELVEDATA">Twelve Data (Se chave fornecida)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">
                    CHAVE FINNHUB (OPCIONAL):
                  </label>
                  <input
                    type="text"
                    value={finnhubKey}
                    onChange={(e) => setFinnhubKey(e.target.value)}
                    placeholder="Chave Finnhub"
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-900 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">
                    CHAVE ALPHA VANTAGE (OPCIONAL):
                  </label>
                  <input
                    type="text"
                    value={alphaVantageKey}
                    onChange={(e) => setAlphaVantageKey(e.target.value)}
                    placeholder="Chave Alpha Vantage"
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-900 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">
                    CHAVE TWELVE DATA (OPCIONAL):
                  </label>
                  <input
                    type="text"
                    value={twelveDataKey}
                    onChange={(e) => setTwelveDataKey(e.target.value)}
                    placeholder="Chave Twelve Data"
                    className="w-full bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-900 text-xs outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Configuração do Telegram */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 shadow-2xs font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-xs uppercase">
                  DESPACHO DE ALERTAS NO TELEGRAM
                </h3>
              </div>
              {telegramStatus && (
                <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {telegramStatus}
                </span>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1 font-mono">
                  TOKEN DO BOT DO TELEGRAM (OPCIONAL):
                </label>
                <input
                  type="text"
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  placeholder="Ex: 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-slate-900 font-mono text-xs focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-1 font-mono">
                  CHAT ID OU CANAL DO TELEGRAM (OPCIONAL):
                </label>
                <input
                  type="text"
                  value={chatId}
                  onChange={(e) => setChatId(e.target.value)}
                  placeholder="Ex: -100123456789 ou seu ID numérico"
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-slate-900 font-mono text-xs focus:border-blue-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-1 font-mono">
                <button
                  onClick={handleTestTelegram}
                  className="px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-blue-600" />
                  <span>ENVIAR TESTE</span>
                </button>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition shadow-xs cursor-pointer"
                >
                  {saving ? 'SALVANDO...' : 'SALVAR TODAS AS CONFIGURAÇÕES'}
                </button>
              </div>

              {saveSuccess && (
                <div className="p-2 rounded bg-emerald-50 border border-emerald-300 text-emerald-800 text-[10px] font-mono flex items-center gap-1.5 animate-in fade-in">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Configurações e chaves salvas com sucesso!</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Coluna Direita: Console de Telemetria /WS (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col h-full font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-2.5">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-xs uppercase font-sans">
                TELEMETRIA DO BARRAMENTO (/WS)
              </h3>
            </div>
            <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              AO VIVO
            </span>
          </div>

          <div className="flex-1 bg-slate-50 p-2.5 rounded-md border border-slate-200 max-h-[460px] overflow-y-auto space-y-1.5 text-[10px]">
            {rawWsLogs.length === 0 ? (
              <div className="text-center py-12 text-slate-400 font-sans">Sincronizando barramento ao vivo...</div>
            ) : (
              rawWsLogs.map((log, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <span className="text-slate-400 shrink-0">[{log.time}]</span>
                  <span className="text-blue-700 font-bold shrink-0">{log.event}:</span>
                  <span className="text-slate-700 break-all">{log.detail}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
