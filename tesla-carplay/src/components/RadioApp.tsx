import { useEffect, useState } from 'react';
import type { Radio, Station } from '../useRadio';
import { Icon } from './Icon';
import { Screen } from './Screen';

function StationLogo({ station, className }: { station: Station; className: string }) {
  const [broken, setBroken] = useState(false);
  if (!station.favicon || broken)
    return (
      <span className={`${className} flex items-center justify-center bg-[#ff375f]`}>
        <Icon name="radio" className="h-1/2 w-1/2" />
      </span>
    );
  return (
    <img
      src={station.favicon}
      alt=""
      onError={() => setBroken(true)}
      className={`${className} bg-white object-contain`}
    />
  );
}

export function NowPlaying({ radio, onOpen }: { radio: Radio; onOpen?: () => void }) {
  const { current, playing, toggle } = radio;
  return (
    <div className="flex h-full items-center gap-6 rounded-3xl bg-panel p-6">
      {current ? (
        <StationLogo station={current} className="h-28 w-28 shrink-0 rounded-2xl" />
      ) : (
        <span className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl bg-raised text-dim">
          <Icon name="radio" className="h-12 w-12" />
        </span>
      )}
      <button onClick={onOpen} className="min-w-0 flex-1 text-left">
        <div className="text-sm uppercase tracking-wider text-dim">
          {current ? (playing ? 'A tocar' : 'Em pausa') : 'Rádio'}
        </div>
        <div className="truncate text-2xl font-semibold">{current?.name ?? 'Escolher estação'}</div>
      </button>
      {current && (
        <button
          onClick={toggle}
          className="press flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white text-black"
          aria-label={playing ? 'Pausar' : 'Tocar'}
        >
          <Icon name={playing ? 'pause' : 'playSolid'} className="h-9 w-9" />
        </button>
      )}
    </div>
  );
}

export function RadioApp({ radio, onBack }: { radio: Radio; onBack: () => void }) {
  const { stations, status, current, playing, loadStations, play } = radio;

  useEffect(() => {
    loadStations();
  }, [loadStations]);

  return (
    <Screen title="Rádio" onBack={onBack}>
      <div className="flex h-full flex-col gap-4">
        <div className="h-40 shrink-0">
          <NowPlaying radio={radio} />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {status === 'loading' && <p className="p-6 text-xl text-dim">A carregar estações…</p>}
          {status === 'error' && (
            <p className="p-6 text-xl text-dim">Não foi possível carregar as estações. Verifica a ligação.</p>
          )}
          <div className="grid grid-cols-3 gap-4 xl:grid-cols-4">
            {stations.map((s) => {
              const active = current?.id === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => play(s)}
                  className={`press flex items-center gap-4 rounded-2xl p-4 text-left ${
                    active ? 'bg-accent' : 'bg-panel'
                  }`}
                >
                  <StationLogo station={s} className="h-16 w-16 shrink-0 rounded-xl" />
                  <span className="min-w-0">
                    <span className="block truncate text-xl font-medium">{s.name}</span>
                    <span className="block truncate text-sm text-white/60">
                      {active && playing ? 'A tocar' : s.tags.split(',').slice(0, 2).join(' · ')}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Screen>
  );
}
