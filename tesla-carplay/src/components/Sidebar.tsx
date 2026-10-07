import type { AppDef } from '../apps';
import type { Radio } from '../useRadio';
import { formatTime, useNow } from '../useNow';
import { AppIcon } from './AppTile';
import { Icon } from './Icon';

type Props = {
  recents: AppDef[];
  radio: Radio;
  onOpen: (app: AppDef) => void;
  onHome: () => void;
  onDashboard: () => void;
  onRadio: () => void;
  homeActive: boolean;
};

export function Sidebar({ recents, radio, onOpen, onHome, onDashboard, onRadio, homeActive }: Props) {
  const now = useNow();
  return (
    <aside className="flex w-32 shrink-0 flex-col items-center gap-6 border-r border-line bg-panel py-6">
      <div className="text-2xl font-semibold tabular-nums">{formatTime(now)}</div>

      <div className="flex flex-1 flex-col items-center gap-5 pt-2">
        {recents.map((app) => (
          <button key={app.id} onClick={() => onOpen(app)} className="press" aria-label={app.name}>
            <AppIcon app={app} size="sm" />
          </button>
        ))}
      </div>

      {radio.current && (
        <button
          onClick={radio.playing ? radio.toggle : onRadio}
          className="press flex h-16 w-16 items-center justify-center rounded-full bg-raised"
          aria-label={radio.playing ? 'Pausar rádio' : 'Abrir rádio'}
        >
          <Icon name={radio.playing ? 'pause' : 'radio'} className="h-7 w-7" />
        </button>
      )}

      {/* Like CarPlay's home button: toggles between the app grid and the dashboard. */}
      <button
        onClick={homeActive ? onDashboard : onHome}
        className="press flex h-20 w-20 items-center justify-center rounded-3xl bg-raised"
        aria-label={homeActive ? 'Painel' : 'Início'}
      >
        <Icon name={homeActive ? 'dashboard' : 'grid'} className="h-9 w-9" />
      </button>
    </aside>
  );
}
