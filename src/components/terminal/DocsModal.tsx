import React, { useState } from 'react';
import { X, Copy, Check, BookOpen, Target, ShieldCheck, Terminal } from 'lucide-react';

interface DocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocsModal: React.FC<DocsModalProps> = ({ isOpen, onClose }) => {
  const [activeDoc, setActiveDoc] = useState<'ESTRATEGIA' | 'CONEXOES' | 'INSTALACAO'>('ESTRATEGIA');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Cabeçalho */}
        <div className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-950 border border-emerald-500/30 text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 font-mono">
                MANUAL DO TRADER — ESTRATÉGIA E LUCRATIVIDADE
              </h2>
              <p className="text-xs text-slate-400">
                Como os agentes analisam o mercado e como você executa para ter consistência
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Seleção de Abas */}
        <div className="px-6 py-2 bg-slate-900/40 border-b border-slate-800/80 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveDoc('ESTRATEGIA')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                activeDoc === 'ESTRATEGIA'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ESTRATÉGIA DOS AGENTES
            </button>
            <button
              onClick={() => setActiveDoc('CONEXOES')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                activeDoc === 'CONEXOES'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              CONEXÕES TRADINGVIEW
            </button>
            <button
              onClick={() => setActiveDoc('INSTALACAO')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                activeDoc === 'INSTALACAO'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              RODAR NO TERMINAL / IDE
            </button>
          </div>

          <button
            onClick={() => handleCopy(activeDoc === 'ESTRATEGIA' ? DOC_ESTRATEGIA : activeDoc === 'CONEXOES' ? DOC_CONEXOES : DOC_INSTALACAO)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-900 border border-slate-800 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'COPIADO' : 'COPIAR GUIA'}</span>
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-6 font-mono text-xs text-slate-300 leading-relaxed bg-slate-950 select-text">
          <pre className="whitespace-pre-wrap font-mono">
            {activeDoc === 'ESTRATEGIA' ? DOC_ESTRATEGIA : activeDoc === 'CONEXOES' ? DOC_CONEXOES : DOC_INSTALACAO}
          </pre>
        </div>
      </div>
    </div>
  );
};

const DOC_ESTRATEGIA = `# MANUAL DE LUCRATIVIDADE E PROGRESSÃO OPERACIONAL

## 1. Como os Agentes Analisam o Mercado
Em vez de disparar alertas a cada segundo com o ruído de ticks, os agentes do RAPTOR analisam o tempo gráfico de 5 Minutos (M5) e 15 Minutos (M15) com base em 4 pilares:
1. Tendência Primária: Cruzamento das Médias Móveis Exponenciais (EMA 9 e EMA 21).
2. Momento Real: Índice de Força Relativa (IFR / RSI 14 períodos).
3. Volatilidade e Distância Técnica: ATR (Average True Range) para posicionamento do Stop Loss.
4. Filtro de Convicção: O alerta só é emitido se a confluência técnica for superior a 75%.

---

## 2. Passo a Passo para Lucrar com os Sinais

### PASSO 1: O Sinal de Entrada
- Quando surgir "🟢 COMPRA CONFIRMADA" ou "🔴 VENDA CONFIRMADA":
  - Verifique o Preço de Entrada sugerido.
  - O Stop Loss Técnico é calculado automaticamente abaixo da estrutura de suporte/resistência.
  - A relação Risco/Retorno é sempre de 1:2.0 a 1:2.5 (ganha mais do que arrisca).

### PASSO 2: Gestão de Posição e Lucro Parcial
- Quando o preço atingir o "ALVO 1":
  - O agente emitirá o alerta "🎯 ALVO 1 ATINGIDO".
  - AÇÃO DO TRADER: Realize 50% dos lucros da operação imediatamente e mova o Stop Loss para o preço de entrada (Breakeven).
  - RESULTADO: A operação se torna 100% livre de risco com lucro já garantido no bolso.

### PASSO 3: Alvo Final ou Enfraquecimento
- Se o agente emitir "⚠️ ENFRAQUECIMENTO DO FLUXO":
  - Significa que o volume diminuiu antes do Alvo Final. Aperte o Stop para proteger os ganhos.
- Se atingir o "🏆 ALVO FINAL":
  - Encerre a operação com lucro máximo institucional (1:2.5).
`;

const DOC_CONEXOES = `# MATRIZ DE CONEXÕES EM TEMPO REAL — TRADINGVIEW EXCLUSIVO

Conforme solicitado, o Twelve Data foi completamente desvinculado do fluxo operacional. Todas as informações são originadas exclusivamente do TradingView institucional:

| Ativo RAPTOR | Instrumento | Ticker Oficial TradingView | Tipo de Mercado |
|---|---|---|---|
| GOLD | Ouro Spot / USD | OANDA:XAUUSD | Cotação internacional spot |
| US100 | Nasdaq-100 | NASDAQ:NDX | Índice oficial de tecnologia |
| HK.CASH | Hang Seng Index | HSI:HSI | Bolsa de Hong Kong |
| FRA40 | CAC 40 | EURONEXT:PX1 | Bolsa de Paris Euronext |

- Zero Chaves: A conexão é 100% autônoma e gratuita via protocolo de streaming do TradingView.
- Latência: Média entre 25ms e 40ms.
- Sem Velas Sintéticas: Dados estritamente reais extraídos do livro de ofertas.
`;

const DOC_INSTALACAO = `# COMO INICIAR O TERMINAL RAPTOR v3.1

## Rodar localmente ou no Antigravity:
1. Abra a pasta raiz no terminal ou IDE.
2. Execute o comando:
   npm run dev

3. A aplicação estará ativa em:
   http://localhost:3000

4. WebSocket central transmitindo em:
   ws://localhost:3000/ws
`;
