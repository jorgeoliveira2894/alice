import { useState, type ReactNode } from 'react';
import type { Media, Post, Status, Story } from '../lib/types';
import { KIND_LABEL, scheduleLabel } from '../lib/format';
import { KindIcon, StatusBadge } from './ui';

export function Thumb({ media, className = '' }: { media?: Media; className?: string }) {
  if (!media) return <div className={`flex items-center justify-center bg-sand ${className}`}><span className="label">Sem ficheiro</span></div>;
  if (media.type === 'video')
    return <video src={`${media.url}#t=0.1`} muted playsInline preload="metadata" className={`object-cover ${className}`} />;
  return <img src={media.url} alt="" loading="lazy" className={`object-cover ${className}`} />;
}

/** Grelha do feed, igual à do Instagram (4:5, 3 colunas). */
export function FeedGrid({ posts, onOpen, extra }: { posts: Post[]; onOpen: (p: Post) => void; extra?: ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-[3px] sm:gap-1">
      {posts.map((p, i) => (
        <button
          key={p.id}
          onClick={() => onOpen(p)}
          className="group relative aspect-[4/5] overflow-hidden bg-sand text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ink"
        >
          <Thumb media={p.media[0]} className="h-full w-full transition-transform duration-700 ease-soft group-hover:scale-[1.03]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1/5 bg-gradient-to-b from-ink/30 to-transparent" />
          <span className="absolute left-2 top-2 text-[10px] font-medium tracking-label text-cream sm:left-3 sm:top-3">
            {String(i + 1).padStart(2, '0')}
          </span>
          <KindIcon kind={p.kind} className="absolute right-2 top-2 text-cream sm:right-3 sm:top-3" />
          <span className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3">
            <span className="sm:hidden"><StatusBadge status={p.status} compact /></span>
            <span className="hidden sm:inline"><StatusBadge status={p.status} /></span>
          </span>
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink/0 opacity-0 transition duration-500 ease-soft group-hover:bg-ink/30 group-hover:opacity-100">
            <span className="border border-cream px-4 py-2 text-[10px] uppercase tracking-label text-cream">Ver</span>
          </span>
        </button>
      ))}
      {extra}
    </div>
  );
}

export function MediaViewer({ media }: { media: Media[] }) {
  const [i, setI] = useState(0);
  const current = media[Math.min(i, media.length - 1)];
  const go = (d: number) => setI((v) => (v + d + media.length) % media.length);

  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden bg-ink">
      {!current && <div className="flex h-full items-center justify-center"><span className="label text-cream/50">Sem ficheiro</span></div>}
      {current?.type === 'video' && (
        <video key={current.url} src={current.url} controls playsInline className="h-full w-full object-contain" />
      )}
      {current?.type === 'image' && <img key={current.url} src={current.url} alt="" className="h-full w-full object-contain" />}

      {media.length > 1 && (
        <>
          <Arrow dir="left" onClick={() => go(-1)} />
          <Arrow dir="right" onClick={() => go(1)} />
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {media.map((_, j) => (
              <button
                key={j}
                onClick={() => setI(j)}
                aria-label={`Slide ${j + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${j === i ? 'w-5 bg-cream' : 'w-1.5 bg-cream/50'}`}
              />
            ))}
          </div>
          <span className="absolute right-3 top-3 bg-ink/70 px-2 py-1 text-[10px] tracking-label text-cream">
            {i + 1}/{media.length}
          </span>
        </>
      )}
    </div>
  );
}

function Arrow({ dir, onClick }: { dir: 'left' | 'right'; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={dir === 'left' ? 'Anterior' : 'Seguinte'}
      className={`absolute top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center bg-cream/90 text-ink transition hover:bg-cream ${dir === 'left' ? 'left-3' : 'right-3'}`}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d={dir === 'left' ? 'M8 1 3 6l5 5' : 'M4 1l5 5-5 5'} />
      </svg>
    </button>
  );
}

export function PostMeta({ post, index }: { post: Post; index: number }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <span className="label text-ink">{`Nº ${String(index + 1).padStart(2, '0')}`}</span>
      <span className="label inline-flex items-center gap-1.5"><KindIcon kind={post.kind} className="h-3 w-3" />{KIND_LABEL[post.kind]}</span>
      {(post.date || post.time) && <span className="label">{scheduleLabel(post.date, post.time)}</span>}
    </div>
  );
}

export function Caption({ text }: { text: string }) {
  if (!text.trim()) return <p className="text-sm italic text-stone">Sem legenda.</p>;
  return <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink/90">{text}</p>;
}

/** Aprovar / pedir alterações. Usado pelo cliente em posts e stories. */
export function ReviewPanel({
  status,
  feedback,
  onSubmit,
}: {
  status: Status;
  feedback: string;
  onSubmit: (status: Status, feedback: string) => Promise<void>;
}) {
  const [mode, setMode] = useState<'idle' | 'changes'>('idle');
  const [text, setText] = useState(status === 'alteracoes' ? feedback : '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (s: Status, f: string) => {
    setBusy(true);
    setError('');
    try {
      await onSubmit(s, f);
      setMode('idle');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível guardar.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4 border-t border-line pt-5">
      <div className="flex items-center justify-between gap-3">
        <span className="label">Estado</span>
        <StatusBadge status={status} />
      </div>

      {status === 'alteracoes' && feedback && mode === 'idle' && (
        <div className="border-l-2 border-clay bg-sand px-4 py-3">
          <p className="label mb-1 text-clay">O seu pedido</p>
          <p className="whitespace-pre-line text-sm text-ink/90">{feedback}</p>
        </div>
      )}

      {mode === 'changes' ? (
        <div className="space-y-3">
          <label className="label block" htmlFor="feedback">O que gostaria de alterar?</label>
          <textarea
            id="feedback"
            autoFocus
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ex.: trocar a segunda imagem, encurtar a legenda…"
            className="input resize-none"
          />
          <div className="flex gap-2">
            <button className="btn-line flex-1" onClick={() => setMode('idle')} disabled={busy}>Cancelar</button>
            <button className="btn flex-1 border-clay bg-clay text-cream hover:opacity-90" onClick={() => submit('alteracoes', text.trim())} disabled={busy || !text.trim()}>
              Enviar pedido
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <button className="btn-line" onClick={() => setMode('changes')} disabled={busy}>
            Pedir alterações
          </button>
          {status === 'aprovado' ? (
            <button className="btn-line" onClick={() => submit('pendente', '')} disabled={busy}>Anular aprovação</button>
          ) : (
            <button className="btn-ink" onClick={() => submit('aprovado', '')} disabled={busy}>Aprovar</button>
          )}
        </div>
      )}
      {error && <p className="text-xs text-clay">{error}</p>}
    </div>
  );
}

export function StoryFrames({ story }: { story: Story }) {
  return (
    <ol className="space-y-3">
      {story.frames.map((f, i) => (
        <li key={i} className="flex gap-3">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current text-[10px] opacity-70">{i + 1}</span>
          <div className="space-y-2">
            <p className="whitespace-pre-line text-[15px] leading-relaxed">{f.text}</p>
            {f.options.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {f.options.map((o, j) => (
                  <span key={j} className="rounded-full border border-current/40 px-3 py-1 text-[11px] uppercase tracking-[0.12em] opacity-80">{o}</span>
                ))}
              </div>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Agrupa stories por semana, ordenadas. */
export function byWeek(stories: Story[]): Array<[number, Story[]]> {
  const map = new Map<number, Story[]>();
  for (const s of stories) map.set(s.week, [...(map.get(s.week) ?? []), s]);
  return [...map.entries()].sort((a, b) => a[0] - b[0]);
}
