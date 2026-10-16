"""
RAPTOR v3.1 — Institutional Terminal Python Desktop Client
Architecture: PyQt6 + Asyncio Order Management + Twelve Data WebSocket / REST & Yahoo Contingency.

Requirements:
    pip install PyQt6 qasync aiohttp websockets python-dotenv
Usage:
    python raptor_pyqt.py
"""

import sys
import asyncio
import json
import logging
from typing import Dict, Optional
from datetime import datetime

try:
    from PyQt6.QtWidgets import (
        QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
        QLabel, QPushButton, QTableWidget, QTableWidgetItem, QHeaderView,
        QGroupBox, QLineEdit, QComboBox, QTextEdit, QStatusBar
    )
    from PyQt6.QtCore import Qt, QTimer, pyqtSignal, QObject
    from PyQt6.QtGui import QFont, QColor
    import qasync
    import aiohttp
    import websockets
except ImportError:
    print("[RAPTOR Python] Requirements missing. Run: pip install PyQt6 qasync aiohttp websockets python-dotenv")
    sys.exit(0)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

# Configuration
TWELVE_DATA_API_KEY = "d5c32e62d9734984b2867ccee87ed0ed"
ASSET_CONFIG = {
    "GOLD": {"twelve": "XAU/USD", "yahoo": "XAUUSD=X", "tv": "OANDA:XAUUSD"},
    "US100": {"twelve": "NDX", "yahoo": "^NDX", "tv": "FX:NAS100"},
    "HK.CASH": {"twelve": "HSI", "yahoo": "^HSI", "tv": "FX:HKG33"},
    "FRA40": {"twelve": "FCHI", "yahoo": "^FCHI", "tv": "FX:FRA40"},
}

class RaptorAsyncSignals(QObject):
    tick_received = pyqtSignal(str, float, str, int)  # asset, price, provider, latency
    alert_received = pyqtSignal(str, str, float, str)  # asset, alert_type, price, reason
    status_updated = pyqtSignal(str)

class RaptorAsyncOrderManager:
    """Asyncio order management and market stream processor."""
    def __init__(self, signals: RaptorAsyncSignals):
        self.signals = signals
        self.running = False
        self.session: Optional[aiohttp.ClientSession] = None
        self.quotes: Dict[str, float] = {}

    async def start(self):
        self.running = True
        self.session = aiohttp.ClientSession()
        asyncio.create_task(self._run_twelve_data_ws())
        asyncio.create_task(self._run_yahoo_contingency())

    async def _run_twelve_data_ws(self):
        ws_url = f"wss://ws.twelvedata.com/v1/quotes/price?apikey={TWELVE_DATA_API_KEY}"
        while self.running:
            try:
                self.signals.status_updated.emit("Connecting Twelve Data WS...")
                async with websockets.connect(ws_url) as ws:
                    self.signals.status_updated.emit("Twelve Data WS Connected")
                    symbols = ",".join([c["twelve"] for c in ASSET_CONFIG.values()])
                    await ws.send(json.dumps({"action": "subscribe", "params": {"symbols": symbols}}))
                    
                    while self.running:
                        msg = await ws.recv()
                        data = json.loads(msg)
                        if data.get("event") == "price":
                            sym = data.get("symbol")
                            price = float(data.get("price", 0))
                            # Map back to asset
                            for asset_id, cfg in ASSET_CONFIG.items():
                                if cfg["twelve"].upper() == sym.upper():
                                    self.quotes[asset_id] = price
                                    self.signals.tick_received.emit(asset_id, price, "TWELVE_DATA_WS", 15)
                                    break
            except Exception as e:
                self.signals.status_updated.emit(f"WS Reconnecting: {e}")
                await asyncio.sleep(5)

    async def _run_yahoo_contingency(self):
        while self.running:
            try:
                for asset_id, cfg in ASSET_CONFIG.items():
                    if asset_id not in self.quotes:
                        sym = cfg["yahoo"]
                        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{sym}?interval=2m&range=1d"
                        headers = {"User-Agent": "Mozilla/5.0"}
                        async with self.session.get(url, headers=headers) as resp:
                            if resp.status == 200:
                                json_data = await resp.json()
                                meta = json_data.get("chart", {}).get("result", [{}])[0].get("meta", {})
                                price = meta.get("regularMarketPrice")
                                if price:
                                    self.quotes[asset_id] = float(price)
                                    self.signals.tick_received.emit(asset_id, float(price), "YAHOO_REFERENCE", 45)
                await asyncio.sleep(12)
            except Exception:
                await asyncio.sleep(15)

    async def place_order(self, asset: str, direction: str, volume: float):
        """Asyncio simulated institutional execution adapter."""
        price = self.quotes.get(asset, 0.0)
        await asyncio.sleep(0.05)  # low latency execution delay simulation
        reason = f"Executed {direction} {volume} lots on {asset} @ {price}"
        self.signals.alert_received.emit(asset, direction, price, reason)
        logging.info(reason)

class RaptorPyQtDashboard(QMainWindow):
    def __init__(self, order_manager: RaptorAsyncOrderManager, signals: RaptorAsyncSignals):
        super().__init__()
        self.order_manager = order_manager
        self.signals = signals
        self.setWindowTitle("RAPTOR v3.1 — Institutional Terminal (PyQt6 / Asyncio)")
        self.resize(1100, 720)
        self.setStyleSheet("background-color: #020617; color: #f8fafc; font-family: Monospace;")
        self._init_ui()
        self._connect_signals()

    def _init_ui(self):
        central = QWidget()
        self.setCentralWidget(central)
        layout = QVBoxLayout(central)

        # Header
        header = QLabel("RAPTOR v3.1 — INSTITUTIONAL DESKTOP (SIGNAL_ONLY)")
        header.setFont(QFont("Monospace", 14, QFont.Weight.Bold))
        header.setStyleSheet("color: #10b981; padding: 6px;")
        layout.addWidget(header)

        # Asset Matrix Table
        self.table = QTableWidget(4, 5)
        self.table.setHorizontalHeaderLabels(["Asset", "Price", "Provider", "Latency", "Status"])
        self.table.horizontalHeader().setSectionResizeMode(QHeaderView.ResizeMode.Stretch)
        self.table.setStyleSheet("background-color: #0f172a; border: 1px solid #1e293b; gridline-color: #334155;")
        for i, asset in enumerate(ASSET_CONFIG.keys()):
            self.table.setItem(i, 0, QTableWidgetItem(asset))
            self.table.setItem(i, 1, QTableWidgetItem("--.--"))
            self.table.setItem(i, 2, QTableWidgetItem("CONNECTING"))
            self.table.setItem(i, 3, QTableWidgetItem("0ms"))
            self.table.setItem(i, 4, QTableWidgetItem("AWAITING"))
        layout.addWidget(self.table)

        # Order & Alert Execution Box
        cmd_box = QGroupBox("Asyncio Order & Alert Command Center")
        cmd_box.setStyleSheet("border: 1px solid #334155; padding: 10px; margin-top: 10px;")
        cmd_layout = QHBoxLayout(cmd_box)

        self.asset_select = QComboBox()
        self.asset_select.addItems(list(ASSET_CONFIG.keys()))
        self.asset_select.setStyleSheet("background: #1e293b; color: white; padding: 4px;")
        cmd_layout.addWidget(QLabel("Asset:"))
        cmd_layout.addWidget(self.asset_select)

        btn_buy = QPushButton("DISPATCH BUY (🟢)")
        btn_buy.setStyleSheet("background-color: #065f46; color: #34d399; font-weight: bold; padding: 6px;")
        btn_buy.clicked.connect(lambda: asyncio.create_task(self.order_manager.place_order(self.asset_select.currentText(), "BUY", 1.0)))
        cmd_layout.addWidget(btn_buy)

        btn_sell = QPushButton("DISPATCH SELL (🔴)")
        btn_sell.setStyleSheet("background-color: #881337; color: #f43f5e; font-weight: bold; padding: 6px;")
        btn_sell.clicked.connect(lambda: asyncio.create_task(self.order_manager.place_order(self.asset_select.currentText(), "SELL", 1.0)))
        cmd_layout.addWidget(btn_sell)

        layout.addWidget(cmd_box)

        # Log Output
        self.log_area = QTextEdit()
        self.log_area.setReadOnly(True)
        self.log_area.setStyleSheet("background: #090d16; border: 1px solid #1e293b; color: #94a3b8; font-size: 11px;")
        layout.addWidget(self.log_area)

        # Status Bar
        self.status_bar = QStatusBar()
        self.setStatusBar(self.status_bar)
        self.status_bar.showMessage("Engine Initialized")

    def _connect_signals(self):
        self.signals.tick_received.connect(self._on_tick)
        self.signals.alert_received.connect(self._on_alert)
        self.signals.status_updated.connect(self.status_bar.showMessage)

    def _on_tick(self, asset: str, price: float, provider: str, latency: int):
        assets = list(ASSET_CONFIG.keys())
        if asset in assets:
            row = assets.index(asset)
            self.table.setItem(row, 1, QTableWidgetItem(f"{price:.2f}"))
            self.table.setItem(row, 2, QTableWidgetItem(provider))
            self.table.setItem(row, 3, QTableWidgetItem(f"{latency}ms"))
            self.table.setItem(row, 4, QTableWidgetItem("LIVE FEED"))

    def _on_alert(self, asset: str, alert_type: str, price: float, reason: str):
        now = datetime.now().strftime("%H:%M:%S")
        self.log_area.append(f"[{now}] {alert_type} on {asset} @ {price:.2f} - {reason}")

async def main():
    app = QApplication(sys.argv)
    loop = qasync.QEventLoop(app)
    asyncio.set_event_loop(loop)

    signals = RaptorAsyncSignals()
    order_mgr = RaptorAsyncOrderManager(signals)
    dashboard = RaptorPyQtDashboard(order_mgr, signals)
    dashboard.show()

    await order_mgr.start()
    with loop:
        loop.run_forever()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
