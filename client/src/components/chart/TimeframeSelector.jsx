import { TIMEFRAMES } from '../../config/constants';

export default function TimeframeSelector({ active, onChange }) {
  return (
    <div className="flex items-center gap-1">
      {TIMEFRAMES.map(({ label, value }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={`
            px-2.5 py-1 text-[10px] font-semibold tracking-wider rounded-md transition-all duration-150
            ${active === value
              ? 'bg-[var(--color-accent)] text-white shadow-[0_0_12px_rgba(99,102,241,0.3)]'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)]'
            }
          `}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
