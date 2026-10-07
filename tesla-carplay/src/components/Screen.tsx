import type { ReactNode } from 'react';
import { Icon } from './Icon';

export function Screen({
  title,
  onBack,
  actions,
  children,
}: {
  title: string;
  onBack: () => void;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full flex-col gap-4">
      <header className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="press flex h-14 w-14 items-center justify-center rounded-2xl bg-raised"
          aria-label="Voltar"
        >
          <Icon name="back" className="h-8 w-8" />
        </button>
        <h1 className="flex-1 text-3xl font-semibold">{title}</h1>
        {actions}
      </header>
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}

export const mapEmbedUrl = (query: string, zoom = 14) =>
  `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=${zoom}&output=embed`;
