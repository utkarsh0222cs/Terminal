import Card, { CardHeader } from '../common/Card';

export default function SignalPanel({ signals }) {
  if (!signals) return null;

  return (
    <Card>
      <CardHeader title="Signal Analysis" subtitle={`Setup: ${(signals.setupType || 'none').replace(/_/g, ' ')}`} />

      <div className="grid grid-cols-2 gap-3">
        {/* Bullish Factors */}
        <div>
          <h4 className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
            Bullish Factors
          </h4>
          <ul className="space-y-1.5">
            {(signals.bullishFactors || []).length === 0 ? (
              <li className="text-[11px] text-[var(--color-text-muted)] italic">None identified</li>
            ) : (
              signals.bullishFactors.map((f, i) => (
                <li key={i} className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed flex items-start gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  {f}
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Bearish Factors */}
        <div>
          <h4 className="text-[10px] font-semibold uppercase tracking-wider text-red-400 mb-2 flex items-center gap-1.5">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
            Bearish Factors
          </h4>
          <ul className="space-y-1.5">
            {(signals.bearishFactors || []).length === 0 ? (
              <li className="text-[11px] text-[var(--color-text-muted)] italic">None identified</li>
            ) : (
              signals.bearishFactors.map((f, i) => (
                <li key={i} className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed flex items-start gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-red-400 mt-1.5 shrink-0" />
                  {f}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* Invalidation */}
      {signals.invalidation && (
        <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Invalidation</p>
          <p className="text-[11px] text-amber-300/70 leading-relaxed">{signals.invalidation}</p>
        </div>
      )}
    </Card>
  );
}
