export default function Loader({ size = 'md', text = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-6">
      <div className={`${sizes[size]} border-2 border-[var(--color-border)] border-t-[var(--color-accent)] rounded-full animate-spin`} />
      {text && <span className="text-xs text-[var(--color-text-muted)]">{text}</span>}
    </div>
  );
}

export function SkeletonLine({ width = '100%', height = '14px' }) {
  return <div className="skeleton" style={{ width, height }} />;
}

export function SkeletonCard() {
  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-4 space-y-3">
      <SkeletonLine width="40%" height="10px" />
      <SkeletonLine width="60%" height="20px" />
      <SkeletonLine width="80%" height="12px" />
    </div>
  );
}
