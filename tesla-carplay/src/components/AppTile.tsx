import type { AppDef } from '../apps';
import { Icon } from './Icon';

export function AppIcon({ app, size = 'lg' }: { app: AppDef; size?: 'sm' | 'lg' }) {
  const box = size === 'lg' ? 'h-28 w-28 rounded-[30px]' : 'h-16 w-16 rounded-[18px]';
  const glyph = size === 'lg' ? 'h-14 w-14' : 'h-8 w-8';
  return (
    <span
      className={`${box} flex items-center justify-center text-white shadow-lg`}
      style={{ background: `linear-gradient(160deg, ${app.color}, ${app.color}cc)` }}
    >
      <Icon name={app.icon} className={glyph} />
    </span>
  );
}

export function AppGrid({ apps, onOpen }: { apps: AppDef[]; onOpen: (app: AppDef) => void }) {
  return (
    <div className="grid h-full grid-cols-4 content-center justify-items-center gap-x-6 gap-y-10 xl:grid-cols-6">
      {apps.map((app) => (
        <button
          key={app.id}
          onClick={() => onOpen(app)}
          className="press flex w-44 flex-col items-center gap-3"
        >
          <AppIcon app={app} />
          <span className="whitespace-nowrap text-lg font-medium">
            {app.name}
            {app.mode === 'navigate' && (
              <Icon name="external" className="ml-1 inline h-4 w-4 align-[-2px] text-dim" />
            )}
          </span>
        </button>
      ))}
    </div>
  );
}
