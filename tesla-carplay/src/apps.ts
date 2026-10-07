import type { IconName } from './components/Icon';

// How an app opens:
// - internal: a screen inside this page (some wrap an embeddable map)
// - navigate: a site that blocks iframes; the tab goes there and the
//             browser's back button returns to the panel
export type AppMode = 'internal' | 'navigate';

export type AppDef = {
  id: string;
  name: string;
  icon: IconName;
  color: string;
  mode: AppMode;
  url?: string;
};

export const APPS: AppDef[] = [
  { id: 'maps', name: 'Mapas', icon: 'map', color: '#34c759', mode: 'internal' },
  { id: 'waze', name: 'Waze', icon: 'waze', color: '#33ccff', mode: 'internal' },
  { id: 'radio', name: 'Rádio', icon: 'radio', color: '#ff375f', mode: 'internal' },
  {
    id: 'spotify',
    name: 'Spotify',
    icon: 'music',
    color: '#1db954',
    mode: 'navigate',
    url: 'https://open.spotify.com/',
  },
  {
    id: 'ytmusic',
    name: 'YouTube Music',
    icon: 'play',
    color: '#ff0000',
    mode: 'navigate',
    url: 'https://music.youtube.com/',
  },
  {
    id: 'applemusic',
    name: 'Apple Music',
    icon: 'note',
    color: '#fa2d48',
    mode: 'navigate',
    url: 'https://music.apple.com/',
  },
  {
    id: 'podcasts',
    name: 'Podcasts',
    icon: 'podcast',
    color: '#b150e2',
    mode: 'navigate',
    url: 'https://podcasts.apple.com/',
  },
  { id: 'weather', name: 'Tempo', icon: 'sun', color: '#0a84ff', mode: 'internal' },
  {
    id: 'chargers',
    name: 'Carregadores',
    icon: 'bolt',
    color: '#e82127',
    mode: 'navigate',
    url: 'https://www.tesla.com/pt_PT/findus?filters=supercharger',
  },
  {
    id: 'plugshare',
    name: 'PlugShare',
    icon: 'plug',
    color: '#ff9f0a',
    mode: 'navigate',
    url: 'https://www.plugshare.com/',
  },
  { id: 'notes', name: 'Notas', icon: 'notes', color: '#ffd60a', mode: 'internal' },
  { id: 'settings', name: 'Definições', icon: 'gear', color: '#8e8e93', mode: 'internal' },
];

export const appById = (id: string) => APPS.find((a) => a.id === id);
