import Card, { CardHeader } from '../common/Card';
import ExpandableSection from '../common/ExpandableSection';
import Badge from '../common/Badge';
import Loader from '../common/Loader';
import ErrorState from '../common/ErrorState';

export default function AIAnalysisPanel({ analysis, loading, error, onRetry }) {
  if (loading) return <Card className="col-span-full"><Loader text="Generating AI analysis..." /></Card>;
  if (error) return <Card className="col-span-full"><ErrorState message={error} onRetry={onRetry} /></Card>;
  if (!analysis) return (
    <Card className="col-span-full">
      <div className="flex flex-col items-center justify-center py-8 gap-3">
        <div className="w-10 h-10 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center">
          <svg className="w-5 h-5 text-[var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <p className="text-xs text-[var(--color-text-muted)]">Click "Analyze" to generate AI insights</p>
      </div>
    </Card>
  );

  const biasVariant = analysis.trendBias === 'Bullish' ? 'bullish' : analysis.trendBias === 'Bearish' ? 'bearish' : 'neutral';

  return (
    <Card glow className="animate-fade-in">
      <CardHeader title="AI Analysis" subtitle={analysis._source === 'gemini' ? 'Powered by Gemini' : 'Signal Engine Fallback'} action={
        <div className="flex items-center gap-2">
          <Badge variant={biasVariant} dot>{analysis.trendBias || 'Neutral'}</Badge>
          <Badge variant={analysis.riskLevel === 'High' || analysis.riskLevel === 'Extreme' ? 'bearish' : analysis.riskLevel === 'Low' ? 'bullish' : 'neutral'}>
            {analysis.riskLevel || 'Medium'} Risk
          </Badge>
        </div>
      } />

      {/* Summary */}
      <p className="text-sm text-[var(--color-text-primary)] leading-relaxed mb-4">{analysis.summary}</p>

      <ExpandableSection title="Detailed Analysis" defaultOpen>
        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{analysis.detailedAnalysis}</p>
      </ExpandableSection>

      <ExpandableSection title="Bullish Case" badge={<Badge variant="bullish">Bull</Badge>}>
        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{analysis.bullishCase}</p>
      </ExpandableSection>

      <ExpandableSection title="Bearish Case" badge={<Badge variant="bearish">Bear</Badge>}>
        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{analysis.bearishCase}</p>
      </ExpandableSection>

      <ExpandableSection title="Risk Warning">
        <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3">
          <p className="text-xs text-red-300/80 leading-relaxed">{analysis.riskWarning}</p>
        </div>
      </ExpandableSection>

      <ExpandableSection title="Beginner Explanation" badge={<Badge variant="info">Simple</Badge>}>
        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{analysis.beginnerExplanation}</p>
      </ExpandableSection>

      {/* Suggested Action */}
      <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Suggested Action</span>
          <span className="text-xs font-semibold text-[var(--color-accent)]">{analysis.suggestedAction}</span>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-[9px] text-[var(--color-text-muted)] mt-3 italic">
        This is analytical commentary for educational purposes only, not financial advice.
      </p>
    </Card>
  );
}
