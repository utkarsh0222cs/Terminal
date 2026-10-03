import { useState, useMemo } from 'react';
import { SUPPORTED_SYMBOLS, SYMBOL_NAMES } from '../../config/constants';

export default function PairSelector({ active, onSelect, className = '' }) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return SUPPORTED_SYMBOLS;
    const q = search.toUpperCase();
    return SUPPORTED_SYMBOLS.filter(s =>
      s.includes(q) || (SYMBOL_NAMES[s] || '').toUpperCase().includes(q)
    );
  }, [search]);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg hover:border-[var(--color-border-active)] transition-colors"
      >
        <span className="text-xs font-semibold font-mono">{active.replace('USDT', '')}</span>
        <span className="text-[10px] text-[var(--color-text-muted)]">/ USDT</span>
        <svg className={`w-3 h-3 text-[var(--color-text-muted)] transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-[min(14rem,85vw)] bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">
          <div className="p-2">
            <input
              type="text"
              placeholder="Search pair..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-1.5 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-accent)]"
              autoFocus
            />
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filtered.map(symbol => (
              <button
                key={symbol}
                onClick={() => { onSelect(symbol); setOpen(false); setSearch(''); }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-[var(--color-bg-elevated)] transition-colors ${
                  active === symbol ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]' : 'text-[var(--color-text-secondary)]'
                }`}
              >
                <span className="font-mono font-semibold">{symbol.replace('USDT', '')}</span>
                <span className="text-[10px] text-[var(--color-text-muted)]">{SYMBOL_NAMES[symbol]}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-3 py-4 text-xs text-[var(--color-text-muted)] text-center">No pairs found</p>
            )}
          </div>
        </div>
      )}

      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
    </div>
  );
}
