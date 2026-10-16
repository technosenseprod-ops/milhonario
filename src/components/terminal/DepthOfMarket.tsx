import React from 'react';
import { useRaptor } from '../../context/RaptorContext';
import { Layers } from 'lucide-react';

export const DepthOfMarket: React.FC = () => {
  const { selectedAsset, quotes } = useRaptor();
  const quote = quotes[selectedAsset];
  const defaultPrice = selectedAsset === 'GOLD' ? 4160.0 : selectedAsset === 'US100' ? 30800.0 : selectedAsset === 'HK.CASH' ? 23980.0 : 7830.0;
  const price = quote?.price || defaultPrice;
  const spread = quote?.spread || 0.25;

  const step = spread * 1.2;

  const asks = [
    { price: price + step * 3, volume: '48,2 oz', val: '$132,1K' },
    { price: price + step * 2, volume: '31,0 oz', val: '$85,0K' },
    { price: price + step, volume: '22,4 oz', val: '$61,4K' },
  ];

  const bids = [
    { price: price - step, volume: '42,8 oz', val: '$117,3K' },
    { price: price - step * 2, volume: '54,0 oz', val: '$148,0K' },
    { price: price - step * 3, volume: '68,5 oz', val: '$187,7K' },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs font-mono text-xs flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <h4 className="font-bold text-slate-900 text-xs font-sans">
              Profundidade do Livro de Ofertas
            </h4>
          </div>
          <span className="text-[10px] text-slate-400">Agregado N2 (10 Níveis)</span>
        </div>

        {/* Dual Progress Bar */}
        <div className="my-2.5">
          <div className="flex justify-between text-[10px] font-bold mb-1">
            <span className="text-emerald-700">COMPRA 62,4% (312 Lotes)</span>
            <span className="text-rose-700">VENDA 37,6% (188 Lotes)</span>
          </div>
          <div className="w-full h-1.5 bg-rose-500 rounded-full overflow-hidden flex">
            <div className="bg-emerald-500 h-full" style={{ width: '62.4%' }} />
          </div>
        </div>

        {/* Asks (Venda) */}
        <div className="space-y-0.5">
          {asks.map((ask, i) => (
            <div key={i} className="flex items-center justify-between py-0.5 px-2 bg-rose-50/50 rounded text-[11px]">
              <span className="font-bold text-rose-600">{ask.price.toFixed(2)}</span>
              <span className="text-slate-600">{ask.volume}</span>
              <span className="text-slate-400">{ask.val}</span>
            </div>
          ))}
        </div>

        {/* Linha Central do Spread */}
        <div className="py-1 px-2 my-1.5 bg-slate-50 border border-slate-200 rounded flex items-center justify-between text-[10px] font-bold text-slate-600">
          <span className="text-slate-700">SPREAD: {spread.toFixed(2)} pt (0,009%)</span>
          <span>CUSTO: $0,25/oz</span>
          <span className="text-emerald-700">BBO EQUILIBRADO</span>
        </div>

        {/* Bids (Compra) */}
        <div className="space-y-0.5">
          {bids.map((bid, i) => (
            <div key={i} className="flex items-center justify-between py-0.5 px-2 bg-emerald-50/50 rounded text-[11px]">
              <span className="font-bold text-emerald-600">{bid.price.toFixed(2)}</span>
              <span className="text-slate-600">{bid.volume}</span>
              <span className="text-slate-400">{bid.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
