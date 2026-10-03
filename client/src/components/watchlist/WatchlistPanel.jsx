import Card, { CardHeader } from '../common/Card';
import { useWatchlist } from '../../context/WatchlistContext';
import { useMarket } from '../../context/MarketContext';
import { SYMBOL_NAMES, formatPercent } from '../../config/constants';
import { useState } from 'react';

export default function WatchlistPanel() {
  const { symbols, prices, loading, addSymbol, removeSymbol } = useWatchlist();
  const { activeSymbol, setActiveSymbol } = useMarket();
  const [adding, setAdding] = useState(false);
  const [newSymbol, setNewSymbol] = useState('');

  const handleAdd = async () => {
    if (newSymbol.trim()) {
      await addSymbol(newSymbol.trim().toUpperCase() + (newSymbol.includes('USDT') ? '' : 'USDT'));
      setNewSymbol('');
      setAdding(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader
        title="Watchlist"
        action={
          <button
            onClick={() => setAdding(!adding)}
            className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] text-xs transition-colors"
          >
            {adding ? '✕' : '+ Add'}
          </button>
        }
      />

      {adding && (
        <div className="flex gap-1.5 mb-3 animate-fade-in">
          <input
            type="text"
            placeholder="e.g. BTC"
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className="flex-1 px-2 py-1 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-accent)] font-mono"
            autoFocus
          />
          <button onClick={handleAdd} className="px-2 py-1 bg-[var(--color-accent)] text-white text-[10px] font-semibold rounded hover:bg-[var(--color-accent-hover)] transition-colors">
            Add
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-0.5 -mx-1">
        {symbols.map((symbol) => {
          const priceData = prices.find((p) => p.symbol === symbol);
          const isActive = symbol === activeSymbol;
          const change = priceData?.change24h || 0;

          return (
            <button
              key={symbol}
              onClick={() => setActiveSymbol(symbol)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all duration-150 group ${
                isActive
                  ? 'bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20'
                  : 'hover:bg-[var(--color-bg-elevated)] border border-transparent'
              }`}
            >
              <div>
                <span className={`text-xs font-semibold font-mono ${isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-primary)]'}`}>
                  {symbol.replace('USDT', '')}
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)] ml-1">{SYMBOL_NAMES[symbol] || ''}</span>
              </div>
              <div className="text-right">
                {priceData && (
                  <>
                    <div className="text-[11px] font-mono text-[var(--color-text-secondary)]">
                      ${priceData.price > 100 ? priceData.price.toFixed(2) : priceData.price.toFixed(4)}
                    </div>
                    <div className={`text-[10px] font-mono ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {formatPercent(change)}
                    </div>
                  </>
                )}
              </div>
              {/* Remove button */}
              <button
                onClick={(e) => { e.stopPropagation(); removeSymbol(symbol); }}
                className="opacity-0 group-hover:opacity-100 ml-1 text-[var(--color-text-muted)] hover:text-red-400 transition-all text-xs"
              >
                ×
              </button>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
