import type { PlanBundle, PostKind, Status } from './types';

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function monthLabel(month: string): string {
  const [y, m] = month.split('-').map(Number);
  if (!y || !m) return month;
  return `${MONTHS[m - 1]} ${y}`;
}

/** "Qua · 03/09 · 18h00" */
export function scheduleLabel(date: string, time: string): string {
  const parts: string[] = [];
  if (date) {
    const [y, m, d] = date.split('-').map(Number);
    const wd = WEEKDAYS[new Date(y, m - 1, d).getDay()];
    parts.push(wd, `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`);
  }
  if (time) parts.push(time.replace(':', 'h'));
  return parts.join(' · ');
}

export const KIND_LABEL: Record<PostKind, string> = {
  post: 'Post',
  carrossel: 'Carrossel',
  reel: 'Reels',
};

export const STATUS_LABEL: Record<Status, string> = {
  pendente: 'Por aprovar',
  aprovado: 'Aprovado',
  alteracoes: 'Alterações pedidas',
};

export function progress(bundle: PlanBundle) {
  const items = [...bundle.posts, ...bundle.stories];
  const total = items.length;
  const approved = items.filter((i) => i.status === 'aprovado').length;
  const changes = items.filter((i) => i.status === 'alteracoes').length;
  return { total, approved, changes, pending: total - approved - changes };
}

/** Build para alojamento sem reescrita de rotas (ex.: pré-visualização estática). */
export const HASH_ROUTER = import.meta.env.VITE_HASH_ROUTER === '1';

/** Subcaminho onde a app está publicada, sem barra final ('' na raiz). */
export const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, '');

export function shareUrl(token: string): string {
  if (HASH_ROUTER) return `${window.location.origin}${window.location.pathname}#/c/${token}`;
  return `${window.location.origin}${BASE_PATH}/c/${token}`;
}

export function newId(): string {
  return crypto.randomUUID();
}

export function newToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(18));
  return Array.from(bytes, (b) => b.toString(36).padStart(2, '0')).join('').slice(0, 24);
}
