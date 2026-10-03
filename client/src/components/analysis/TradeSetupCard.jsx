import Card, { CardHeader } from '../common/Card';
import Badge from '../common/Badge';
import { formatNumber } from '../../config/constants';

export default function TradeSetupCard({ signals }) {
  if (!signals || signals.setupType === 'no_trade_zone') {
    return (
      <Card>
        <CardHeader title="Trade Setup" />
        <div className="flex items-center justify-center py-4">
          <Badge variant="neutral">No Active Setup</Badge>
        </div>
      </Card>
    );
  }

  const isLong = signals.overallTrend === 'bullish';

  return (
    <Card>
      <CardHeader
        title="Trade Setup"
        action={
          <div className="flex items-center gap-2">
            <Badge variant={isLong ? 'bullish' : 'bearish'} dot>
              {signals.setupType?.replace(/_/g, ' ')}
            </Badge>
            <Badge variant="info">{signals.confidence}%</Badge>
          </div>
        }
      />

      {/* Entry Zone */}
      <div className="space-y-2.5 mb-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">Entry Zone</span>
          <span className="text-xs font-mono text-[var(--color-accent)]">
            ${formatNumber(signals.entryZone?.low)} — ${formatNumber(signals.entryZone?.high)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">Stop Loss</span>
          <span className="text-xs font-mono text-red-400">
            ${formatNumber(signals.stopLoss)}
          </span>
        </div>

        {/* Take Profit Targets */}
        {signals.takeProfit && signals.takeProfit.length > 0 && (
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">Targets</span>
            <div className="flex items-center gap-2 mt-1">
              {signals.takeProfit.map((tp, i) => (
                <span key={i} className="text-[11px] font-mono text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded">
                  TP{i + 1}: ${formatNumber(tp)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Risk/Reward */}
      <div className="pt-2.5 border-t border-[var(--color-border)] flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">Risk/Reward</span>
        <span className={`text-sm font-bold font-mono ${signals.riskReward >= 2 ? 'text-emerald-400' : signals.riskReward >= 1 ? 'text-amber-400' : 'text-red-400'}`}>
          1:{signals.riskReward}
        </span>
      </div>
    </Card>
  );
}
