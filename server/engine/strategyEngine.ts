--- a/server/engine/strategyEngine.ts
+++ b/server/engine/strategyEngine.ts
@@
-import { AssetId, OhlcCandle, AlertSignal, AlertType, AgentOperation } from '../types';
+import { AssetId, OhlcCandle, AlertSignal, AlertType, AgentOperation } from '../types';
+import { defaultRiskManager } from './riskManager';
@@
   private consolidateToM15(candles: OhlcCandle[]): OhlcCandle[] {
@@
     return Array.from(map.values()).sort((a, b) => a.time - b.time);
   }
+
+  private consolidateToTF(candles: OhlcCandle[], minutes: number): OhlcCandle[] {
+    const ms = minutes * 60 * 1000;
+    const map = new Map<number, OhlcCandle>();
+    for (const c of candles) {
+      const bucket = Math.floor(c.time / ms) * ms;
+      const existing = map.get(bucket);
+      if (!existing) {
+        map.set(bucket, { time: bucket, open: c.open, high: c.high, low: c.low, close: c.close, volume: c.volume || 0 });
+      } else {
+        existing.high = Math.max(existing.high, c.high);
+        existing.low = Math.min(existing.low, c.low);
+        existing.close = c.close;
+        existing.volume = (existing.volume || 0) + (c.volume || 0);
+      }
+    }
+    return Array.from(map.values()).sort((a, b) => a.time - b.time);
+  }
+
+  private multiTimeframeConfluence(asset: AssetId, currentPrice: number, history: OhlcCandle[]): boolean {
+    try {
+      // require alignment across M5, M15 and H1
+      const m5 = this.consolidateToTF(history, 5);
+      const m15 = this.consolidateToTF(history, 15);
+      const h1 = this.consolidateToTF(history, 60);
+
+      const emaFor = (series: OhlcCandle[], p: number) => this.calcEMA(series.map((c) => c.close), p);
+      const ema9_m5 = emaFor(m5, 9);
+      const ema21_m5 = emaFor(m5, 21);
+      const ema9_m15 = emaFor(m15, 9);
+      const ema21_m15 = emaFor(m15, 21);
+      const ema9_h1 = emaFor(h1, 9);
+      const ema21_h1 = emaFor(h1, 21);
+
+      const up_m5 = ema9_m5 > ema21_m5;
+      const up_m15 = ema9_m15 > ema21_m15;
+      const up_h1 = ema9_h1 > ema21_h1;
+
+      const down_m5 = ema9_m5 < ema21_m5;
+      const down_m15 = ema9_m15 < ema21_m15;
+      const down_h1 = ema9_h1 < ema21_h1;
+
+      // confluence if all agree on direction
+      if ((up_m5 && up_m15 && up_h1) || (down_m5 && down_m15 && down_h1)) return true;
+      return false;
+    } catch (e) {
+      return false;
+    }
+  }
@@
-        const agentInfo = AGENT_CODENAMES[asset];
-        const newOp: AgentOperation = {
+        const agentInfo = AGENT_CODENAMES[asset];
+        const lot = defaultRiskManager.calculateLotSize(currentPrice, stopLoss, asset === 'GOLD' ? 100 : asset === 'US100' ? 20 : 10);
+        const newOp: AgentOperation = {
           id: `AGT_M15_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
           agentName: agentInfo.name,
           agentCodename: agentInfo.codename,
           asset,
           side: 'BUY',
           entryPrice: currentPrice,
           currentPrice,
           targetPrice1: target1,
           targetPrice2: target2,
           stopLossPrice: stopLoss,
-          lotSize: 1.0,
+          lotSize: lot || 1.0,
           pnlUsd: 0,
           pnlPercent: 0,
           status: 'ABERTA',
@@
-        this.activeOperations.set(asset, newOp);
+        this.activeOperations.set(asset, newOp);
@@
-        const agentInfo = AGENT_CODENAMES[asset];
-        const newOp: AgentOperation = {
+        const agentInfo = AGENT_CODENAMES[asset];
+        const lotS = defaultRiskManager.calculateLotSize(currentPrice, stopLoss, asset === 'GOLD' ? 100 : asset === 'US100' ? 20 : 10);
+        const newOp: AgentOperation = {
           id: `AGT_M15_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
           agentName: agentInfo.name,
           agentCodename: agentInfo.codename,
           asset,
           side: 'SELL',
           entryPrice: currentPrice,
           currentPrice,
           targetPrice1: target1,
           targetPrice2: target2,
           stopLossPrice: stopLoss,
-          lotSize: 1.0,
+          lotSize: lotS || 1.0,
           pnlUsd: 0,
           pnlPercent: 0,
           status: 'ABERTA',
@@
-    if (buyTrigger && !this.activeOperations.has(asset)) {
+    // require multi-timeframe confluence for higher quality
+    const confluence = this.multiTimeframeConfluence(asset, currentPrice, rawCandles);
+    if (buyTrigger && !this.activeOperations.has(asset) && confluence) {
@@
-    if (sellTrigger && !this.activeOperations.has(asset)) {
+    if (sellTrigger && !this.activeOperations.has(asset) && confluence) {
@@
     return {
       hasSignal: false,
       indicators: { ema9, ema21, ema50, rsi14, atr14, trend },
     };
   }
