export default function Card({ children, className = '', hover = false, glow = false, ...props }) {
  return (
    <div
      className={`
        bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-4
        ${hover ? 'hover:border-[var(--color-border-active)] hover:bg-[var(--color-bg-card-hover)] transition-all duration-200' : ''}
        ${glow ? 'shadow-[0_0_20px_rgba(99,102,241,0.08)]' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, icon }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        {icon && <span className="text-[var(--color-accent)] text-sm">{icon}</span>}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">{title}</h3>
          {subtitle && <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
