import { useEffect, useState } from 'react';
import type { Coords } from './useCoords';

export type Weather = {
  temp: number;
  wind: number;
  code: number;
  days: { date: string; max: number; min: number; code: number }[];
};

export function useWeather({ lat, lon }: Coords): Weather | null {
  const [weather, setWeather] = useState<Weather | null>(null);

  useEffect(() => {
    let cancelled = false;
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      '&current=temperature_2m,weather_code,wind_speed_10m' +
      '&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=5';

    const fetchWeather = () =>
      fetch(url)
        .then((r) => r.json())
        .then((d) => {
          if (cancelled) return;
          setWeather({
            temp: d.current.temperature_2m,
            wind: d.current.wind_speed_10m,
            code: d.current.weather_code,
            days: d.daily.time.map((date: string, i: number) => ({
              date,
              max: d.daily.temperature_2m_max[i],
              min: d.daily.temperature_2m_min[i],
              code: d.daily.weather_code[i],
            })),
          });
        })
        .catch(() => {});

    fetchWeather();
    const timer = setInterval(fetchWeather, 15 * 60_000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [lat, lon]);

  return weather;
}

// WMO weather codes, as used by Open-Meteo.
export function describe(code: number): { label: string; emoji: string } {
  if (code === 0) return { label: 'Céu limpo', emoji: '☀️' };
  if (code <= 2) return { label: 'Pouco nublado', emoji: '🌤️' };
  if (code === 3) return { label: 'Nublado', emoji: '☁️' };
  if (code <= 48) return { label: 'Nevoeiro', emoji: '🌫️' };
  if (code <= 57) return { label: 'Chuvisco', emoji: '🌦️' };
  if (code <= 67) return { label: 'Chuva', emoji: '🌧️' };
  if (code <= 77) return { label: 'Neve', emoji: '🌨️' };
  if (code <= 82) return { label: 'Aguaceiros', emoji: '🌦️' };
  if (code <= 86) return { label: 'Neve', emoji: '🌨️' };
  return { label: 'Trovoada', emoji: '⛈️' };
}
