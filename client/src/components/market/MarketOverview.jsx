import Card from '../common/Card';
import { formatNumber, formatCurrency, formatPercent } from '../../config/constants';
import { SkeletonCard } from '../common/Loader';

const StatCard = ({ label, value, sub, variant }) => {
  const colorClass = variant === 'bullish' ? 'text-emerald-400' : variant === 'bearish' ? 'text-red-400' : 'text-[var(--color-text-primary)]';

  return (
    <Card hover className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5">{label}</p>
      <p className={`text-sm font-semibold font-mono truncate ${colorClass}`}>{value}</p>
      {sub && <p className="text-[10px] text-[var(--color-text-muted)] mt-1 truncate">{sub}</p>}
    </Card>
  );
};

export default function MarketOverview({ marketData, indicators, loading }) {
  if (loading) {
    return (
      <div className="stat-grid">
        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (!marketData) return null;

  const change = marketData.change24h || 0;
  const trendVariant = change >= 0 ? 'bullish' : 'bearish';

  const rsi = indicators?.rsi14;
  const rsiVariant = rsi > 70 ? 'bearish' : rsi < 30 ? 'bullish' : null;

  const macdState = indicators?.macdState;
  const macdVariant = macdState?.includes('bullish') ? 'bullish' : macdState?.includes('bearish') ? 'bearish' : null;

  const trendClass = indicators?.trendClass;
  const trendCardVariant = trendClass === 'bullish' ? 'bullish' : trendClass === 'bearish' ? 'bearish' : null;

  return (
    <div className="stat-grid">
      <StatCard
        label="Price"
        value={`$${formatNumber(marketData.price, marketData.price > 100 ? 2 : 4)}`}
        variant={trendVariant}
      />
      <StatCard
        label="24h Change"
        value={formatPercent(change)}
        variant={trendVariant}
      />
      <StatCard
        label="24h Volume"
        value={formatCurrency(marketData.volume24h)}
      />
      <StatCard
        label="Volatility"
        value={indicators?.volatility != null ? `${indicators.volatility}/100` : '—'}
        sub={indicators?.atr14 ? `ATR: ${indicators.atr14}` : ''}
      />
      <StatCard
        label="RSI (14)"
        value={rsi != null ? rsi.toFixed(1) : '—'}
        sub={rsi > 70 ? 'Overbought' : rsi < 30 ? 'Oversold' : rsi > 50 ? 'Bullish' : 'Bearish'}
        variant={rsiVariant}
      />
      <StatCard
        label="MACD"
        value={indicators?.macd ? indicators.macd.histogram.toFixed(2) : '—'}
        sub={macdState?.replace('_', ' ') || ''}
        variant={macdVariant}
      />
      <StatCard
        label="Trend"
        value={indicators?.trendScore != null ? `${indicators.trendScore > 0 ? '+' : ''}${indicators.trendScore}` : '—'}
        sub={trendClass || ''}
        variant={trendCardVariant}
      />
      <StatCard
        label="S / R"
        value={indicators?.support ? `${formatNumber(indicators.support, 0)}` : '—'}
        sub={indicators?.resistance ? `R: ${formatNumber(indicators.resistance, 0)}` : ''}
      />
    </div>
  );
}
