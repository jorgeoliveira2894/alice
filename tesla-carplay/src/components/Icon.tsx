// Simple stroke icons, drawn at 24×24 and scaled by the caller.
const PATHS = {
  map: 'M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zm0 0v14m6-12v14',
  waze: 'M5 15a7 7 0 1 1 14 0h-3M5 15H3m2 0a2 2 0 1 0 4 0m6 0a2 2 0 1 0 4 0M10 10h.01M14 10h.01',
  radio: 'M4 9h16v11H4zM4 9l12-5M8 14.5h.01M15 13a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z',
  music: 'M4 9c5-1.5 11-1.5 16 1M5.5 13c4-1 9-1 13 .8M7 16.5c3-.6 7-.6 10 .6',
  play: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zm-2 5.5v7l6-3.5-6-3.5z',
  note: 'M9 18V6l11-2v12M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm11-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
  podcast:
    'M12 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm-1 2h2l-.5 6h-1zM7.5 15.5a6 6 0 1 1 9 0M5 18a9 9 0 1 1 14 0',
  sun: 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0-5v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  bolt: 'M13 2 4 14h7l-1 8 9-12h-7l1-8z',
  plug: 'M9 2v5m6-5v5M6 7h12v4a6 6 0 0 1-12 0V7zm6 10v5',
  notes: 'M5 3h14v18H5zM9 8h6m-6 4h6m-6 4h4',
  gear: 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm7.4 3a7.4 7.4 0 0 0-.1-1.3l2-1.6-2-3.4-2.4 1a7.5 7.5 0 0 0-2.2-1.3L14.4 2h-4l-.4 2.6a7.5 7.5 0 0 0-2.2 1.3l-2.4-1-2 3.4 2 1.6a7.4 7.4 0 0 0 0 2.6l-2 1.6 2 3.4 2.4-1a7.5 7.5 0 0 0 2.2 1.3l.4 2.6h4l.4-2.6a7.5 7.5 0 0 0 2.2-1.3l2.4 1 2-3.4-2-1.6c.1-.4.1-.9.1-1.3z',
  grid: 'M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 0h6v6h-6z',
  dashboard: 'M3 4h11v16H3zm14 0h4v7h-4zm0 10h4v6h-4z',
  back: 'M15 5l-7 7 7 7',
  pause: 'M8 5v14m8-14v14',
  playSolid: 'M7 4v16l13-8L7 4z',
  stop: 'M6 6h12v12H6z',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm9 16-4-4',
  external: 'M14 4h6v6m0-6-9 9M18 14v6H4V6h6',
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, className = 'h-6 w-6' }: { name: IconName; className?: string }) {
  const solid = name === 'playSolid' || name === 'stop';
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={solid ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
