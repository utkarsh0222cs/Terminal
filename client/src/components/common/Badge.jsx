const VARIANTS = {
  bullish: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  bearish: 'bg-red-500/10 text-red-400 border-red-500/20',
  neutral: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  info: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  critical: 'bg-red-600/15 text-red-400 border-red-500/30',
  warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  default: 'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border-[var(--color-border)]',
};

export default function Badge({ children, variant = 'default', dot = false, className = '' }) {
  return (
    <span className={`
      inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide
      border rounded-md ${VARIANTS[variant] || VARIANTS.default} ${className}
    `}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${variant === 'bullish' ? 'bg-emerald-400' : variant === 'bearish' ? 'bg-red-400' : 'bg-amber-400'}`} />}
      {children}
    </span>
  );
}
