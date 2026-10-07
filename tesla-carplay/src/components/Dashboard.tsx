import type { Coords } from '../useCoords';
import type { Radio } from '../useRadio';
import type { Weather } from '../useWeather';
import { NowPlaying } from './RadioApp';
import { mapEmbedUrl } from './Screen';
import { WeatherCard } from './WeatherApp';

type Props = {
  coords: Coords;
  radio: Radio;
  weather: Weather | null;
  onMaps: () => void;
  onRadio: () => void;
  onWeather: () => void;
};

// CarPlay's dashboard: a large map next to compact media and info cards.
export function Dashboard({ coords, radio, weather, onMaps, onRadio, onWeather }: Props) {
  return (
    <div className="grid h-full grid-cols-[3fr_2fr] gap-4">
      <div className="relative overflow-hidden rounded-3xl bg-panel">
        <iframe
          title="Mapa"
          src={mapEmbedUrl(`${coords.lat},${coords.lon}`, 15)}
          className="pointer-events-none h-full w-full border-0"
        />
        <button onClick={onMaps} className="absolute inset-0" aria-label="Abrir mapas" />
      </div>
      <div className="grid grid-rows-2 gap-4">
        <NowPlaying radio={radio} onOpen={onRadio} />
        <button onClick={onWeather} className="text-left">
          <WeatherCard weather={weather} coords={coords} />
        </button>
      </div>
    </div>
  );
}
