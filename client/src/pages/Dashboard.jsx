import { useEffect, useCallback } from 'react';
import { useMarket } from '../context/MarketContext';
import { useSocket } from '../context/SocketContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import CandlestickChart from '../components/chart/CandlestickChart';
import TimeframeSelector from '../components/chart/TimeframeSelector';
import PairSelector from '../components/market/PairSelector';
import MarketOverview from '../components/market/MarketOverview';
import ConversionBar from '../components/market/ConversionBar';
import AIAnalysisPanel from '../components/analysis/AIAnalysisPanel';
import SignalPanel from '../components/analysis/SignalPanel';
import ScenarioCard from '../components/analysis/ScenarioCard';
import TradeSetupCard from '../components/analysis/TradeSetupCard';
import WatchlistPanel from '../components/watchlist/WatchlistPanel';
import AlertPanel from '../components/alerts/AlertPanel';
import ErrorBoundary from '../components/common/ErrorBoundary';

export default function Dashboard() {
  const {
    activeSymbol, timeframe, marketData, candles, indicators, signals, aiAnalysis,
    loading, errors, setActiveSymbol, setTimeframe, fetchMarketData, fetchCandles, fetchAIAnalysis,
  } = useMarket();

  const { subscribe, unsubscribe, priceUpdates } = useSocket();

  // Fetch data on symbol/timeframe change
  useEffect(() => {
    fetchMarketData(activeSymbol);
    fetchCandles(activeSymbol, timeframe);
  }, [activeSymbol, timeframe, fetchMarketData, fetchCandles]);

  // Subscribe to real-time updates
  useEffect(() => {
    subscribe(activeSymbol);
    return () => unsubscribe(activeSymbol);
  }, [activeSymbol, subscribe, unsubscribe]);

  // Auto-refresh market data every 30s
  useEffect(() => {
    const interval = setInterval(() => fetchMarketData(activeSymbol), 30000);
    return () => clearInterval(interval);
  }, [activeSymbol, fetchMarketData]);

  const handleTimeframeChange = useCallback((tf) => {
    setTimeframe(tf);
  }, [setTimeframe]);

  const handleAnalyze = useCallback(() => {
    fetchAIAnalysis(activeSymbol);
  }, [activeSymbol, fetchAIAnalysis]);

  /* ──────────────────────────────────────────
     Shared sub-panels to avoid repetition
     ────────────────────────────────────────── */
  const leftSidebarContent = (
    <>
      <div className="flex-1 overflow-y-auto p-2">
        <ErrorBoundary fallbackMessage="Watchlist failed to load">
          <WatchlistPanel />
        </ErrorBoundary>
      </div>
      <div className="border-t border-[var(--color-border)] p-2 max-h-[35%] overflow-y-auto">
        <ErrorBoundary fallbackMessage="Alerts failed to load">
          <AlertPanel />
        </ErrorBoundary>
      </div>
    </>
  );

  const rightSidebarContent = (
    <div className="p-3 space-y-3">
      <AIAnalysisPanel
        analysis={aiAnalysis}
        loading={loading.ai}
        error={errors.ai}
        onRetry={handleAnalyze}
      />
      <ScenarioCard scenarios={aiAnalysis?.scenarios} />
      <TradeSetupCard signals={signals} />
    </div>
  );

  const chartHeader = (
    <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] shrink-0 gap-2 flex-wrap">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <PairSelector active={activeSymbol} onSelect={setActiveSymbol} />
        {/* Live price from socket */}
        {priceUpdates[activeSymbol] && (
          <span className="text-sm font-semibold font-mono text-[var(--color-text-primary)]">
            ${priceUpdates[activeSymbol].price > 100
              ? priceUpdates[activeSymbol].price.toFixed(2)
              : priceUpdates[activeSymbol].price.toFixed(4)
            }
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <TimeframeSelector active={timeframe} onChange={handleTimeframeChange} />
        <button
          id="analyze-button"
          onClick={handleAnalyze}
          disabled={loading.ai}
          className="px-3 py-1.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] disabled:opacity-50 text-white text-[10px] font-semibold uppercase tracking-wider rounded-lg transition-all duration-200 shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:shadow-[0_0_25px_rgba(99,102,241,0.35)]"
        >
          {loading.ai ? 'Analyzing...' : '✦ Analyze'}
        </button>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      {({ leftDrawerOpen, rightDrawerOpen, closeLeft, closeRight }) => (
        <>
          {/* ═══ MOBILE / TABLET DRAWERS ═══ */}

          {/* Left Drawer — Watchlist (< xl) */}
          {leftDrawerOpen && (
            <>
              <div className="drawer-overlay" onClick={closeLeft} />
              <div className="drawer-left flex flex-col pt-14">
                <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--color-border)]">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">Watchlist</span>
                  <button
                    onClick={closeLeft}
                    className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {leftSidebarContent}
              </div>
            </>
          )}

          {/* Right Drawer — Analysis (< lg on tablet, < xl concept but we use lg here) */}
          {rightDrawerOpen && (
            <>
              <div className="drawer-overlay" onClick={closeRight} />
              <div className="drawer-right pt-14">
                <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--color-border)]">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">Analysis</span>
                  <button
                    onClick={closeRight}
                    className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {rightSidebarContent}
              </div>
            </>
          )}

          {/* ═══ MAIN DASHBOARD GRID ═══ */}
          <div className="dashboard-grid">

            {/* LEFT SIDEBAR — Desktop only (≥ xl / 1280px) */}
            <div className="hidden xl:flex flex-col border-r border-[var(--color-border)] overflow-hidden">
              {leftSidebarContent}
            </div>

            {/* CENTER — Chart + Market Stats + Signals */}
            <div className="flex flex-col overflow-hidden min-h-0">
              {/* Chart Header */}
              {chartHeader}

              {/* Chart */}
              <div className="flex-1 min-h-0 bg-[var(--color-bg-card)]" style={{ minHeight: '250px' }}>
                <ErrorBoundary fallbackMessage="Chart failed to render">
                  <CandlestickChart data={candles} loading={loading.candles} />
                </ErrorBoundary>
              </div>

              {/* Conversion Bar — inline tool below chart */}
              <ErrorBoundary fallbackMessage="Converter unavailable">
                <ConversionBar activeSymbol={activeSymbol} />
              </ErrorBoundary>

              {/* Market Stats */}
              <div className="p-2 sm:p-3 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)] shrink-0">
                <MarketOverview marketData={marketData} indicators={indicators} loading={loading.market} />
              </div>

              {/* Signals Panel — desktop inline, mobile stacked */}
              <div className="p-2 sm:p-3 border-t border-[var(--color-border)] overflow-y-auto max-h-[30vh] lg:max-h-[30%]">
                <SignalPanel signals={signals} />
              </div>

              {/* Mobile/Tablet: Inline analysis below chart (< lg) */}
              <div className="lg:hidden border-t border-[var(--color-border)] overflow-y-auto">
                {rightSidebarContent}
              </div>
            </div>

            {/* RIGHT SIDEBAR — Laptop+ (≥ lg / 1024px) */}
            <div className="hidden lg:block border-l border-[var(--color-border)] overflow-y-auto bg-[var(--color-bg-secondary)]">
              {rightSidebarContent}
            </div>

          </div>
        </>
      )}
    </DashboardLayout>
  );
}
