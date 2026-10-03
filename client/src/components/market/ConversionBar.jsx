import { useState, useRef, useEffect, useMemo } from 'react';
import useConverter from '../../hooks/useConverter';

/* ────────────────────────────────────
   Searchable Dropdown (shared)
   ──────────────────────────────────── */
function Dropdown({ items, selected, onSelect, renderItem, renderSelected, searchable = false, className = '' }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const filtered = useMemo(() => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter(item =>
      (typeof item === 'string' ? item : item.label || '').toLowerCase().includes(q)
    );
  }, [items, search]);

  return (
    <div ref={ref} className={`converter-dropdown ${className}`}>
      <button
        type="button"
        className="converter-dropdown-trigger"
        onClick={() => { setOpen(!open); setSearch(''); }}
      >
        {renderSelected ? renderSelected(selected) : (
          <span className="converter-dropdown-label">{selected}</span>
        )}
        <svg className={`converter-chevron ${open ? 'open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="converter-dropdown-menu animate-fade-in">
          {searchable && (
            <div className="converter-dropdown-search-wrap">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="converter-dropdown-search"
                autoFocus
              />
            </div>
          )}
          <div className="converter-dropdown-list">
            {filtered.map((item) => {
              const key = typeof item === 'string' ? item : item.value;
              const isActive = key === selected;
              return (
                <button
                  key={key}
                  type="button"
                  className={`converter-dropdown-item ${isActive ? 'active' : ''}`}
                  onClick={() => { onSelect(key); setOpen(false); setSearch(''); }}
                >
                  {renderItem ? renderItem(item, isActive) : (
                    <span>{key}</span>
                  )}
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="converter-dropdown-empty">No results</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────
   Animated Number Display
   ──────────────────────────────────── */
function AnimatedValue({ value, className = '' }) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    if (value === prevRef.current) return;
    prevRef.current = value;

    // Quick crossfade
    const el = document.getElementById('converter-result-value');
    if (el) {
      el.classList.add('converter-value-flash');
      setTimeout(() => el.classList.remove('converter-value-flash'), 400);
    }
    setDisplay(value);
  }, [value]);

  return (
    <span id="converter-result-value" className={`converter-result-num ${className}`}>
      {display}
    </span>
  );
}

/* ────────────────────────────────────
   MAIN COMPONENT: ConversionBar
   ──────────────────────────────────── */
export default function ConversionBar({ activeSymbol }) {
  const {
    amount, setAmount,
    crypto, setCrypto,
    currency, setCurrency,
    loading, error,
    formattedValue,
    change24h,
    cryptoList,
    cryptoMap,
    quickCurrencies,
  } = useConverter(activeSymbol);

  return (
    <div className="conversion-bar" id="global-conversion-bar">
      <div className="conversion-bar-inner">

        {/* ─── Converter Row ─── */}
        <div className="converter-row">

          {/* Amount Input */}
          <div className="converter-input-group">
            <input
              type="text"
              inputMode="decimal"
              id="converter-amount"
              value={amount}
              onChange={(e) => {
                const v = e.target.value;
                if (v === '' || /^\d*\.?\d*$/.test(v)) setAmount(v);
              }}
              className="converter-amount-input"
              placeholder="1"
            />
          </div>

          {/* Crypto Selector */}
          <Dropdown
            items={cryptoList}
            selected={crypto}
            onSelect={setCrypto}
            searchable
            className="converter-crypto-dd"
            renderSelected={(val) => (
              <span className="converter-dropdown-label">
                <span className="converter-crypto-symbol">{val}</span>
              </span>
            )}
            renderItem={(item, isActive) => (
              <div className="converter-crypto-item">
                <span className="font-mono font-semibold">{item}</span>
                <span className="converter-crypto-name">{cryptoMap[item]?.name}</span>
              </div>
            )}
          />

          {/* Equals Sign */}
          <span className="converter-equals">=</span>

          {/* Result */}
          <div className="converter-result-group">
            {loading ? (
              <span className="converter-result-loader">
                <span className="converter-dot-pulse" />
              </span>
            ) : error ? (
              <span className="converter-result-error" title={error}>⚠</span>
            ) : (
              <AnimatedValue value={formattedValue} />
            )}
          </div>

          {/* Currency Selector */}
          <Dropdown
            items={[]}  
            selected={currency.toUpperCase()}
            onSelect={(val) => setCurrency(val.toLowerCase())}
            className="converter-currency-dd"
            renderSelected={(val) => (
              <span className="converter-dropdown-label">
                <span className="converter-currency-label">{val}</span>
              </span>
            )}
          />

          {/* 24h change badge */}
          {change24h != null && (
            <span className={`converter-change-badge ${change24h >= 0 ? 'bullish' : 'bearish'}`}>
              {change24h >= 0 ? '↑' : '↓'} {Math.abs(change24h).toFixed(1)}%
            </span>
          )}
        </div>

        {/* ─── Quick Currency Chips ─── */}
        <div className="converter-chips">
          {quickCurrencies.map((c) => (
            <button
              key={c}
              type="button"
              className={`converter-chip ${currency === c ? 'active' : ''}`}
              onClick={() => setCurrency(c)}
            >
              {c.toUpperCase()}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
