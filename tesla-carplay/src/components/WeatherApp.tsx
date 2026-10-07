import type { Coords } from '../useCoords';
import { describe, type Weather } from '../useWeather';
import { Screen } from './Screen';

const weekday = (date: string) =>
  new Date(date + 'T12:00').toLocaleDateString('pt-PT', { weekday: 'short' }).replace('.', '');

export function WeatherCard({ weather, coords }: { weather: Weather | null; coords: Coords }) {
  if (!weather)
    return <div className="flex h-full items-center rounded-3xl bg-panel p-6 text-xl text-dim">A obter o tempo…</div>;
  const now = describe(weather.code);
  const today = weather.days[0];
  return (
    <div className="flex h-full items-center gap-6 rounded-3xl bg-panel p-6">
      <span className="text-7xl">{now.emoji}</span>
      <div>
        <div className="text-5xl font-semibold tabular-nums">{Math.round(weather.temp)}°</div>
        <div className="text-xl text-dim">
          {now.label}
          {today && ` · ${Math.round(today.max)}° / ${Math.round(today.min)}°`}
        </div>
        {coords.approximate && <div className="text-sm text-dim">Lisboa (localização não partilhada)</div>}
      </div>
    </div>
  );
}

export function WeatherApp({
  weather,
  coords,
  onBack,
}: {
  weather: Weather | null;
  coords: Coords;
  onBack: () => void;
}) {
  return (
    <Screen title="Tempo" onBack={onBack}>
      <div className="flex h-full flex-col gap-4">
        <div className="h-44">
          <WeatherCard weather={weather} coords={coords} />
        </div>
        {weather && (
          <div className="grid flex-1 grid-cols-5 gap-4">
            {weather.days.map((d) => {
              const w = describe(d.code);
              return (
                <div key={d.date} className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-panel p-4">
                  <div className="text-xl capitalize text-dim">{weekday(d.date)}</div>
                  <div className="text-6xl">{w.emoji}</div>
                  <div className="text-2xl font-semibold tabular-nums">
                    {Math.round(d.max)}° <span className="text-dim">{Math.round(d.min)}°</span>
                  </div>
                  <div className="text-center text-base text-dim">{w.label}</div>
                </div>
              );
            })}
          </div>
        )}
        <p className="text-sm text-dim">Dados: Open-Meteo · vento {weather ? Math.round(weather.wind) : '–'} km/h</p>
      </div>
    </Screen>
  );
}
