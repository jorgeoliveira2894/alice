import { useState, type FormEvent } from 'react';
import type { Coords } from '../useCoords';
import { Icon } from './Icon';
import { Screen, mapEmbedUrl } from './Screen';

export function MapsApp({ coords, onBack }: { coords: Coords; onBack: () => void }) {
  const here = `${coords.lat},${coords.lon}`;
  const [input, setInput] = useState('');
  const [query, setQuery] = useState(here);

  const search = (e: FormEvent) => {
    e.preventDefault();
    setQuery(input.trim() || here);
  };

  // Turn-by-turn needs the full Google Maps site, which can't be embedded.
  const directions =
    'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(query);

  return (
    <Screen
      title="Mapas"
      onBack={onBack}
      actions={
        <form onSubmit={search} className="flex items-center gap-3">
          <div className="flex h-14 w-[28rem] items-center gap-3 rounded-2xl bg-raised px-4">
            <Icon name="search" className="h-6 w-6 text-dim" />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Procurar destino"
              className="flex-1 bg-transparent text-xl outline-none placeholder:text-dim"
            />
          </div>
          {query !== here && (
            <a href={directions} className="press flex h-14 items-center rounded-2xl bg-accent px-6 text-xl font-semibold">
              Ir
            </a>
          )}
        </form>
      }
    >
      <iframe title="Mapa" src={mapEmbedUrl(query)} className="h-full w-full rounded-3xl border-0" />
    </Screen>
  );
}

export function WazeApp({ coords, onBack }: { coords: Coords; onBack: () => void }) {
  return (
    <Screen
      title="Waze"
      onBack={onBack}
      actions={
        <a href="https://www.waze.com/live-map/" className="press flex h-14 items-center rounded-2xl bg-raised px-6 text-xl">
          Abrir site
        </a>
      }
    >
      <iframe
        title="Waze"
        src={`https://embed.waze.com/iframe?zoom=14&lat=${coords.lat}&lon=${coords.lon}&ct=livemap`}
        className="h-full w-full rounded-3xl border-0"
      />
    </Screen>
  );
}
