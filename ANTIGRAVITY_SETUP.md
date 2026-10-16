# RAPTOR v3.1 — Instalação completa no Antigravity IDE

## 1. Abrir o projeto

Extraia os arquivos e abra a pasta raiz no Antigravity IDE.

## 2. Configurar o ambiente

Copie `.env.example` para `.env`.

### Mínimo recomendado com chave fornecida

```env
TWELVE_DATA_API_KEY=d5c32e62d9734984b2867ccee87ed0ed
TWELVE_GOLD_SYMBOL=XAU/USD
TWELVE_US100_SYMBOL=NDX
TWELVE_HK_SYMBOL=HSI
TWELVE_FRA_SYMBOL=FCHI
TWELVE_DATA_REFERENCE_ONLY=false
TRADING_ECONOMICS_API_KEY=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

Não copie chaves sensíveis para arquivos expostos.

## 3. Descobrir os símbolos corretos

Com a chave do Twelve Data configurada, acesse:

`http://localhost:3000/api/symbol-search?q=Nasdaq%20100`

Faça o mesmo para Hang Seng (`HSI`) e CAC 40 (`FCHI`). Use o símbolo retornado pelo provedor. O RAPTOR não assume que `US100`, `NQ`, `NDX`, CFD e futuro são a mesma coisa.

## 4. Instalar Dependências

```bash
npm install
```

## 5. Rodar o Terminal e Data Hub

```bash
npm run dev
```

Frontend + Data Hub rodam em: `http://localhost:3000`
WebSocket central pronto em: `ws://localhost:3000/ws`

## 6. Verificar o feed

Abra no navegador:

`http://localhost:3000/api/health`

Os quatro ativos precisam aparecer com `connected: true` e um `provider` real (`TWELVE_DATA_WS`, `TWELVE_DATA_REST` ou `YAHOO_REFERENCE`).

Se aparecer `YAHOO_REFERENCE`, o preço é somente referência e NÃO deve ser usado para execução direta em CFD.

## 7. Regra para operação real

Antes de liberar execução automática, configure um adapter para a corretora/plataforma que realmente recebe a ordem (MT5, OANDA, Interactive Brokers etc.) e mapeie o símbolo exato do contrato.

## 8. Alertas Institucionais

O RAPTOR gera e despacha em tempo real:

- 🟢 COMPRA (BUY)
- 🔴 VENDA (SELL)
- ⚠️ ENFRAQUECIMENTO (WEAKENING)
- 🟡 SAÍDA (EXIT)
- 🔄 REVERSÃO (REVERSAL)
- 🎯 ALVO (TARGET)
- 🛑 STOP (STOP)
- 📡 DATA STALE (DATA_STALE)

Os alertas dependem de feed real e de dados suficientes para análise. Sem dados, o sistema não fabrica sinais.
