import Card, { CardHeader } from '../common/Card';

const ScenarioBar = ({ label, probability, color, reasoning, confirmation }) => (
  <div className="mb-3 last:mb-0">
    <div className="flex items-center justify-between mb-1">
      <span className="text-[11px] text-[var(--color-text-secondary)]">{label}</span>
      <span className={`text-xs font-semibold font-mono ${color}`}>{probability}%</span>
    </div>
    <div className="w-full h-1.5 bg-[var(--color-bg-primary)] rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ease-out ${
          color.includes('emerald') ? 'bg-emerald-500' : color.includes('red') ? 'bg-red-500' : 'bg-amber-500'
        }`}
        style={{ width: `${Math.min(probability, 100)}%` }}
      />
    </div>
    {reasoning && <p className="text-[10px] text-[var(--color-text-muted)] mt-1 leading-relaxed">{reasoning}</p>}
  </div>
);

export default function ScenarioCard({ scenarios }) {
  if (!scenarios) return null;

  return (
    <Card>
      <CardHeader title="Scenario Outlook" subtitle="Probability-weighted forecast" />

      <ScenarioBar
        label="Bullish Continuation"
        probability={scenarios.bullishContinuation?.probability || 0}
        color="text-emerald-400"
        reasoning={scenarios.bullishContinuation?.reasoning}
        confirmation={scenarios.bullishContinuation?.confirmation}
      />
      <ScenarioBar
        label="Rejection / Pullback"
        probability={scenarios.rejectionPullback?.probability || 0}
        color="text-red-400"
        reasoning={scenarios.rejectionPullback?.reasoning}
        confirmation={scenarios.rejectionPullback?.confirmation}
      />
      <ScenarioBar
        label="Sideways / Consolidation"
        probability={scenarios.sidewaysConsolidation?.probability || 0}
        color="text-amber-400"
        reasoning={scenarios.sidewaysConsolidation?.reasoning}
        confirmation={scenarios.sidewaysConsolidation?.confirmation}
      />
    </Card>
  );
}
