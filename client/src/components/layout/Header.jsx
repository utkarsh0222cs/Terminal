import { useSocket } from '../../context/SocketContext';
import { useMarket } from '../../context/MarketContext';
import { SYMBOL_NAMES } from '../../config/constants';
import StaleIndicator from '../common/StaleIndicator';
import ThemeToggle from '../common/ThemeToggle';

export default function Header({ onToggleLeftDrawer, onToggleRightDrawer }) {
  const { connected } = useSocket();
  const { activeSymbol, lastUpdated } = useMarket();

  return (
    <header className="h-12 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] flex items-center justify-between px-3 sm:px-4 shrink-0">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        {/* Mobile: Watchlist drawer toggle */}
        <button
          id="menu-toggle-left"
          onClick={onToggleLeftDrawer}
          className="xl:hidden flex items-center justify-center w-8 h-8 rounded-lg
            hover:bg-[var(--color-bg-elevated)] transition-colors text-[var(--color-text-secondary)]"
          aria-label="Open watchlist"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h16" />
          </svg>
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="6" fill="#6366f1" />
            <path d="M8 22L12 10L16 18L20 8L24 22" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="20" cy="8" r="2" fill="#22d3ee" />
          </svg>
          <span className="text-sm font-bold tracking-tight hidden sm:inline">
            <span className="text-[var(--color-accent)]">TERMINAL</span>
          </span>
          {/* Compact on mobile */}
          <span className="text-sm font-bold tracking-tight sm:hidden">
            Σ<span className="text-[var(--color-accent)]">T</span>
          </span>
        </div>

        <div className="h-4 w-px bg-[var(--color-border)] hidden sm:block" />

        <span className="text-xs text-[var(--color-text-muted)] font-mono truncate hidden sm:inline">
          {SYMBOL_NAMES[activeSymbol] || activeSymbol} / USDT
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden sm:block">
          <StaleIndicator lastUpdated={lastUpdated} />
        </div>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Connection status */}
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-400' : 'bg-red-400 animate-pulse-slow'}`} />
          <span className="text-[10px] text-[var(--color-text-muted)] font-mono hidden sm:inline">
            {connected ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>

        {/* Mobile: Analysis drawer toggle */}
        <button
          id="menu-toggle-right"
          onClick={onToggleRightDrawer}
          className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg
            hover:bg-[var(--color-bg-elevated)] transition-colors text-[var(--color-text-secondary)]"
          aria-label="Open analysis panel"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </button>
      </div>
    </header>
  );
}
