export default function StaleIndicator({ lastUpdated }) {
  if (!lastUpdated) return null;

  const ageMs = Date.now() - new Date(lastUpdated).getTime();
  const ageSec = Math.floor(ageMs / 1000);
  const isStale = ageSec > 120;

  const label = ageSec < 60 ? `${ageSec}s ago` : `${Math.floor(ageSec / 60)}m ago`;

  return (
    <div className={`flex items-center gap-1.5 text-[10px] font-mono ${isStale ? 'text-amber-400' : 'text-[var(--color-text-muted)]'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isStale ? 'bg-amber-400 animate-pulse-slow' : 'bg-emerald-400'}`} />
      <span>{isStale ? 'Stale — ' : ''}{label}</span>
    </div>
  );
}
