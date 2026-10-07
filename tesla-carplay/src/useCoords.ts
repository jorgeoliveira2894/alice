import { useEffect, useState } from 'react';

export type Coords = { lat: number; lon: number; approximate: boolean };

// Lisbon, used until (or if never) the browser shares a location.
const FALLBACK: Coords = { lat: 38.7223, lon: -9.1393, approximate: true };

export function useCoords(): Coords {
  const [coords, setCoords] = useState<Coords>(FALLBACK);

  useEffect(() => {
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude, approximate: false }),
      () => {},
      { timeout: 10_000, maximumAge: 5 * 60_000 },
    );
  }, []);

  return coords;
}
