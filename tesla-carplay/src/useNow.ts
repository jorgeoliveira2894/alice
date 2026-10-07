import { useEffect, useState } from 'react';

export function useNow(intervalMs = 10_000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return now;
}

export const formatTime = (d: Date) =>
  d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
