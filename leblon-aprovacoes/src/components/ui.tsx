import { useEffect, type ReactNode } from 'react';
import type { PostKind, Status } from '../lib/types';
import { KIND_LABEL, STATUS_LABEL } from '../lib/format';

export function Logo({ tone = 'ink', className = '' }: { tone?: 'ink' | 'cream'; className?: string }) {
  return <img src={`/leblon-mark-${tone}.png`} alt="LEBLON" className={`h-auto select-none ${className}`} draggable={false} />;
}

export function StatusBadge({ status, compact = false }: { status: Status; compact?: boolean }) {
  const styles: Record<Status, string> = {
    pendente: 'border-stone/50 text-stone bg-cream/90',
    aprovado: 'border-ink bg-ink text-cream',
    alteracoes: 'border-clay bg-clay text-cream',
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2 py-1 text-[9px] font-medium uppercase tracking-label ${styles[status]}`}
    >
      <StatusGlyph status={status} />
      {!compact && STATUS_LABEL[status]}
    </span>
  );
}

function StatusGlyph({ status }: { status: Status }) {
  if (status === 'aprovado')
    return (
      <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M1.5 5.2 4 7.6 8.5 2.6" />
      </svg>
    );
  if (status === 'alteracoes')
    return (
      <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 8 7.6 2.4M6 1.5l2.5 2.5" />
      </svg>
    );
  return <span className="h-1.5 w-1.5 rounded-full border border-current" />;
}

export function StatusDot({ status }: { status: Status }) {
  const c = status === 'aprovado' ? 'bg-cream' : status === 'alteracoes' ? 'bg-clay' : 'border border-cream/40';
  return <span className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${c}`} aria-label={STATUS_LABEL[status]} />;
}

export function KindIcon({ kind, className = '' }: { kind: PostKind; className?: string }) {
  const common = { width: 16, height: 16, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.3, className };
  if (kind === 'carrossel')
    return (
      <svg {...common} aria-label={KIND_LABEL[kind]}>
        <rect x="2" y="4.5" width="9" height="9.5" />
        <path d="M5 4.5V2h9v9.5h-3" />
      </svg>
    );
  if (kind === 'reel')
    return (
      <svg {...common} aria-label={KIND_LABEL[kind]}>
        <rect x="1.8" y="1.8" width="12.4" height="12.4" rx="3" />
        <path d="M6.5 5.6v4.8L10.5 8z" fill="currentColor" stroke="none" />
      </svg>
    );
  return (
    <svg {...common} aria-label={KIND_LABEL[kind]}>
      <rect x="2" y="2" width="12" height="12" />
    </svg>
  );
}

export function Spinner({ label = 'A carregar' }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <span className="label animate-pulse">{label}…</span>
    </div>
  );
}

export function Modal({ open, onClose, children, wide = false }: { open: boolean; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/70 backdrop-blur-sm sm:items-center sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className={`relative max-h-[94vh] w-full overflow-y-auto bg-cream shadow-2xl ${wide ? 'max-w-5xl' : 'max-w-xl'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center bg-cream/90 text-ink transition hover:bg-ink hover:text-cream"
          aria-label="Fechar"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.4">
            <path d="M1 1l12 12M13 1 1 13" />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
}

export function DemoBanner() {
  return (
    <div className="bg-ink px-4 py-2 text-center text-[10px] uppercase tracking-label text-cream/70">
      Modo demonstração · os dados ficam só neste browser · liga o Supabase para enviar links reais
    </div>
  );
}
