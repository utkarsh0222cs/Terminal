import { useState } from 'react';

export default function ExpandableSection({ title, children, defaultOpen = false, badge = null }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-[var(--color-border)] last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 px-1 text-left hover:text-[var(--color-text-primary)] transition-colors group"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)]">
            {title}
          </span>
          {badge}
        </div>
        <svg
          className={`w-3.5 h-3.5 text-[var(--color-text-muted)] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="pb-3 px-1 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}
