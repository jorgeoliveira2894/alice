import { useCallback, useEffect, useRef, useState } from 'react';

export type Station = {
  id: string;
  name: string;
  url: string;
  favicon: string;
  tags: string;
};

type ApiStation = {
  stationuuid: string;
  name: string;
  url_resolved: string;
  favicon: string;
  tags: string;
};

// Radio Browser is a free, keyless directory of internet radio stations.
const API =
  'https://de1.api.radio-browser.info/json/stations/bycountrycodeexact/PT' +
  '?order=clickcount&reverse=true&hidebroken=true&limit=60';

export type Radio = ReturnType<typeof useRadio>;

export function useRadio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [current, setCurrent] = useState<Station | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = new Audio();
    audio.addEventListener('playing', () => setPlaying(true));
    audio.addEventListener('pause', () => setPlaying(false));
    audio.addEventListener('error', () => setPlaying(false));
    audioRef.current = audio;
    return () => audio.pause();
  }, []);

  const loadStations = useCallback(async () => {
    if (stations.length || status === 'loading') return;
    setStatus('loading');
    try {
      const res = await fetch(API);
      const data = (await res.json()) as ApiStation[];
      const seen = new Set<string>();
      const list = data
        // The page is served over HTTPS, so plain-HTTP streams would be blocked.
        .filter((s) => s.url_resolved.startsWith('https://'))
        .filter((s) => !seen.has(s.name.trim()) && seen.add(s.name.trim()))
        .slice(0, 24)
        .map((s) => ({
          id: s.stationuuid,
          name: s.name.trim(),
          url: s.url_resolved,
          favicon: s.favicon,
          tags: s.tags,
        }));
      setStations(list);
      setStatus('idle');
    } catch {
      setStatus('error');
    }
  }, [stations.length, status]);

  const play = useCallback((station: Station) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = station.url;
    setCurrent(station);
    audio.play().catch(() => setPlaying(false));
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !current) return;
    if (audio.paused) audio.play().catch(() => setPlaying(false));
    else audio.pause();
  }, [current]);

  return { stations, status, current, playing, loadStations, play, toggle };
}
