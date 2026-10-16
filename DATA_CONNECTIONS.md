# RAPTOR v3.1 — MATRIZ DE CONEXÕES DE MERCADO

| RAPTOR | Instrumento de referência | Yahoo Finance | TradingView | Twelve Data padrão |
|---|---|---|---|---|
| GOLD | Ouro spot/USD | `XAUUSD=X` | `OANDA:XAUUSD` | `XAU/USD` |
| US100 | Nasdaq-100 | `^NDX` | `FX:NAS100` | `NDX` |
| HK.CASH | Hang Seng | `^HSI` | `FX:HKG33` | `HSI` |
| FRA40 | CAC 40 | `^FCHI` | `FX:FRA40` | `FCHI` |

## Hierarquia de Provedores

1. **RAPTOR Data Hub (Server-side)**: WebSocket central `/ws` e normalização anti-inversão de ticks.
2. **Twelve Data WebSocket**: streaming em tempo real quando coberto pela chave (`d5c32e62d9734984b2867ccee87ed0ed`).
3. **Finnhub WebSocket**: opcional para símbolos americanos e forex.
4. **Twelve Data REST**: recuperação e polling de fallback.
5. **Yahoo Finance**: contingência de referência estrita (marcado como `referenceOnly: true`).

## 3. APIs Open Source e Projetos no GitHub Integrados (Zero Códigos Secretos)

Para que o operador não precise descobrir nem enviar códigos secretos de contratos de corretoras, o RAPTOR integra as tecnologias dos principais projetos open source:

1. **`ranaroussi/yfinance`** ([GitHub](https://github.com/ranaroussi/yfinance)):
   - Motor de auto-resolução de índices globais e forex com rotação automática de aliases:
     - `GOLD`: `XAUUSD=X`, `GC=F`, `GLD`
     - `US100`: `^NDX`, `QQQ`, `NQ=F`
     - `HK.CASH`: `^HSI`, `2800.HK`
     - `FRA40`: `^FCHI`, `CAC.PA`
   - Zero chaves privadas requeridas.

2. **`0xAllan123/tradingview-api`** ([GitHub](https://github.com/0xAllan123/tradingview-api)):
   - Protocolo WebSocket de código aberto para captura de fluxo de dados de gráficos TradingView (`OANDA:XAUUSD`, `FX:NAS100`, `FX:HKG33`, `FX:FRA40`).

3. **`binance-spot-api-docs`** ([GitHub](https://github.com/binance/binance-spot-api-docs)):
   - WebSocket público 24/7 de Paxos Gold (`PAXGUSDT`): ouro spot com lastro físico 1:1, transmitindo cotação instantânea mesmo quando os mercados tradicionais fecham aos fins de semana.

4. **`omkarcloud/gold-price-api` / `alphaitas/gold-price-api`**:
   - APIs open source de cotação CME de ouro em tempo real.

5. **`twelvedata-python`** ([GitHub](https://github.com/twelvedata/twelvedata-python)):
   - SDK comunitário oficial da Twelve Data, pré-conectado à licença `d5c32e62d9734984b2867ccee87ed0ed`.

O RAPTOR **NUNCA cria preços sintéticos** nem fabrica velas artificiais quando a fonte falha. Sem feed real, o ativo permanece desconectado (`SEM FEED`) e bloqueia sinais operacionais automáticos.

## TradingView

TradingView é a camada de gráfico; os dados são fornecidos pelo RAPTOR Datafeed. Os símbolos mapeados (`OANDA:XAUUSD`, `FX:NAS100`, etc.) servem de referência no gráfico.
