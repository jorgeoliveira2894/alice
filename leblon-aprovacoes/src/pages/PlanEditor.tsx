import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import type { Media, Plan, PlanBundle, Post, PostKind, Story, StoryFrame } from '../lib/types';
import { HASH_ROUTER, KIND_LABEL, monthLabel, newId, progress, scheduleLabel, shareUrl } from '../lib/format';
import { ConfirmButton, KindIcon, Modal, Spinner, StatusBadge } from '../components/ui';
import { byWeek, FeedGrid, StoryFrames, Thumb } from '../components/content';
import { Field } from './Dashboard';

type Tab = 'feed' | 'stories';

const WEEKDAYS = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];

export default function PlanEditor() {
  const { id = '' } = useParams();
  const nav = useNavigate();
  const [data, setData] = useState<PlanBundle | null | undefined>(undefined);
  const [tab, setTab] = useState<Tab>('feed');
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const load = useCallback(async () => setData(await api.getPlan(id)), [id]);
  useEffect(() => {
    load();
  }, [load]);

  if (data === undefined) return <Spinner />;
  if (data === null) return <p className="p-12 text-center text-sm text-stone">Plano não encontrado.</p>;

  const { plan, posts, stories } = data;
  const stats = progress(data);
  const requests = [
    ...posts.filter((p) => p.status === 'alteracoes').map((p) => ({ id: p.id, label: p.title, feedback: p.feedback, open: () => setEditingPost(p) })),
    ...stories.filter((s) => s.status === 'alteracoes').map((s) => ({ id: s.id, label: `Stories · ${s.title}`, feedback: s.feedback, open: () => setEditingStory(s) })),
  ];

  const blankPost = (): Post => ({
    id: newId(), plan_id: plan.id, position: posts.length ? Math.max(...posts.map((p) => p.position)) + 1 : 0,
    kind: 'post', title: '', caption: '', date: '', time: '18:00', media: [], status: 'pendente', feedback: '', reviewed_at: null,
  });
  const blankStory = (): Story => ({
    id: newId(), plan_id: plan.id, position: stories.length ? Math.max(...stories.map((s) => s.position)) + 1 : 0,
    week: stories.length ? Math.max(...stories.map((s) => s.week)) : 1, day: WEEKDAYS[0], title: '',
    frames: [{ text: '', options: [] }], status: 'pendente', feedback: '', reviewed_at: null,
  });

  const move = async (post: Post, dir: -1 | 1) => {
    const i = posts.findIndex((p) => p.id === post.id);
    const other = posts[i + dir];
    if (!other) return;
    await api.savePost({ ...post, position: other.position });
    await api.savePost({ ...other, position: post.position });
    await load();
  };

  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-8">
      <Link to="/" className="label transition hover:text-ink">← Clientes</Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="label">{[plan.client_name, plan.client_handle].filter(Boolean).join(' · ')}</p>
              <h1 className="mt-3 text-4xl font-light uppercase tracking-[0.14em]">{monthLabel(plan.month)}</h1>
              {plan.theme && <p className="mt-2 text-sm text-stone">{plan.theme}</p>}
            </div>
            <button className="label self-start transition hover:text-ink sm:self-auto" onClick={() => setEditingPlan(plan)}>Editar dados</button>
          </div>

          <div className="mt-8 flex gap-8 border-b border-line">
            {(['feed', 'stories'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`-mb-px border-b pb-3 text-[11px] font-medium uppercase tracking-wide2 transition ${tab === t ? 'border-ink text-ink' : 'border-transparent text-stone hover:text-ink'}`}
              >
                {t === 'feed' ? `Feed · ${posts.length}` : `Stories · ${stories.length}`}
              </button>
            ))}
          </div>

          <div className="mt-6">
            {tab === 'feed' ? (
              <>
                <p className="mb-4 text-sm text-stone">É assim que o cliente vê o feed. Clique numa publicação para a editar.</p>
                <FeedGrid
                  posts={posts}
                  onOpen={setEditingPost}
                  extra={
                    <button
                      onClick={() => setEditingPost(blankPost())}
                      className="flex aspect-[4/5] flex-col items-center justify-center gap-2 border border-dashed border-stone/50 text-stone transition hover:border-ink hover:text-ink"
                    >
                      <span className="text-3xl font-extralight">+</span>
                      <span className="label text-current">Nova publicação</span>
                    </button>
                  }
                />
              </>
            ) : (
              <div className="space-y-10">
                {byWeek(stories).map(([week, list]) => (
                  <section key={week}>
                    <p className="label mb-3 text-ink">Semana {week}</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {list.map((s) => (
                        <div key={s.id} role="button" tabIndex={0} onClick={() => setEditingStory(s)} onKeyDown={(e) => e.key === 'Enter' && setEditingStory(s)} className="cursor-pointer bg-ink p-5 text-left text-cream transition hover:bg-smoke">
                          <div className="flex items-center justify-between gap-2">
                            <span className="label text-cream/50">{s.day}</span>
                            <StatusBadge status={s.status} compact />
                          </div>
                          <h3 className="mt-2 font-light uppercase tracking-[0.08em]">{s.title || 'Sem título'}</h3>
                          <div className="mt-4 line-clamp-[8] text-sm opacity-90">
                            <StoryFrames story={s} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
                <button className="btn-line" onClick={() => setEditingStory(blankStory())}>+ Nova sequência de stories</button>
              </div>
            )}
          </div>
        </div>

        {/* Painel lateral: link + estado */}
        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <div className="space-y-4 bg-ink p-6 text-cream">
            <p className="label text-cream/50">Link para o cliente</p>
            <p className="text-sm leading-relaxed text-cream/80">Envie este link ao cliente. Não precisa de conta: vê o mês, aprova ou pede alterações.</p>
            <CopyLink token={plan.share_token} dark />
            {HASH_ROUTER ? (
              <Link to={`/c/${plan.share_token}`} className="btn-ghost-dark w-full">Ver como o cliente</Link>
            ) : (
              <a href={shareUrl(plan.share_token)} target="_blank" rel="noreferrer" className="btn-ghost-dark w-full">Ver como o cliente</a>
            )}
          </div>

          <div className="space-y-3 border border-line p-6">
            <p className="label">Estado</p>
            <Stat n={stats.approved} label="Aprovados" />
            <Stat n={stats.changes} label="Alterações pedidas" tone="clay" />
            <Stat n={stats.pending} label="Por aprovar" />
          </div>

          {requests.length > 0 && (
            <div className="space-y-3 border border-clay p-6">
              <p className="label text-clay">Pedidos do cliente</p>
              {requests.map((r) => (
                <button key={r.id} onClick={r.open} className="block w-full border-t border-line pt-3 text-left first:border-t-0 first:pt-0">
                  <span className="block text-[13px] font-medium">{r.label || 'Sem título'}</span>
                  <span className="mt-1 block whitespace-pre-line text-sm text-ink/75">“{r.feedback}”</span>
                </button>
              ))}
            </div>
          )}

          <ConfirmButton
            className="label text-stone transition hover:text-clay"
            label="Apagar plano"
            confirmLabel="Toque de novo para apagar o plano"
            onConfirm={async () => {
              await api.deletePlan(plan.id);
              nav('/');
            }}
          />
        </aside>
      </div>

      {editingPost && (
        <PostEditor
          post={editingPost}
          index={posts.findIndex((p) => p.id === editingPost.id)}
          total={posts.length}
          onMove={(dir) => move(editingPost, dir).then(() => setEditingPost(null))}
          onClose={() => setEditingPost(null)}
          onSaved={() => {
            setEditingPost(null);
            load();
          }}
        />
      )}
      {editingStory && (
        <StoryEditor
          story={editingStory}
          onClose={() => setEditingStory(null)}
          onSaved={() => {
            setEditingStory(null);
            load();
          }}
        />
      )}
      {editingPlan && (
        <PlanForm
          plan={editingPlan}
          onClose={() => setEditingPlan(null)}
          onSaved={() => {
            setEditingPlan(null);
            load();
          }}
        />
      )}
    </main>
  );
}

function Stat({ n, label, tone }: { n: number; label: string; tone?: 'clay' }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-sm text-ink/80">{label}</span>
      <span className={`text-xl font-light tabular-nums ${tone === 'clay' && n > 0 ? 'text-clay' : ''}`}>{n}</span>
    </div>
  );
}

export function CopyLink({ token, dark = false, compact = false }: { token: string; dark?: boolean; compact?: boolean }) {
  const [copied, setCopied] = useState(false);
  const url = shareUrl(token);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt('Copie o link:', url);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  if (compact)
    return (
      <button onClick={copy} className="label transition hover:text-ink">
        {copied ? 'Link copiado ✓' : 'Copiar link do cliente'}
      </button>
    );
  return (
    <div className={`flex items-stretch border ${dark ? 'border-cream/25' : 'border-line'}`}>
      <span className={`min-w-0 flex-1 truncate px-3 py-2.5 text-xs ${dark ? 'text-cream/70' : 'text-stone'}`}>{url}</span>
      <button onClick={copy} className={`shrink-0 px-4 text-[10px] font-medium uppercase tracking-label ${dark ? 'bg-cream text-ink' : 'bg-ink text-cream'}`}>
        {copied ? 'Copiado' : 'Copiar'}
      </button>
    </div>
  );
}

/** Se a agência mexe no conteúdo depois da resposta do cliente, volta a "Por aprovar". */
function resetIfChanged<T extends Post | Story>(before: T, after: T, keys: Array<keyof T>): T {
  const changed = keys.some((k) => JSON.stringify(before[k]) !== JSON.stringify(after[k]));
  return changed && after.status !== 'pendente' ? { ...after, status: 'pendente', reviewed_at: null } : after;
}

function PostEditor({
  post,
  index,
  total,
  onMove,
  onClose,
  onSaved,
}: {
  post: Post;
  index: number;
  total: number;
  onMove: (dir: -1 | 1) => void;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState<Post>(post);
  const [uploading, setUploading] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const isNew = index < 0;
  const set = (patch: Partial<Post>) => setDraft((d) => ({ ...d, ...patch }));

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setError('');
    setUploading(files.length);
    try {
      const added: Media[] = [];
      for (const f of Array.from(files)) {
        added.push(await api.uploadMedia(post.plan_id, f));
        setUploading((n) => n - 1);
      }
      setDraft((d) => {
        const media = [...d.media, ...added];
        const kind = d.kind === 'post' && media.length > 1 ? 'carrossel' : d.kind === 'post' && media[0]?.type === 'video' ? 'reel' : d.kind;
        return { ...d, media, kind };
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falhou o carregamento.');
    } finally {
      setUploading(0);
    }
  };

  const moveMedia = (i: number, dir: -1 | 1) => {
    const media = [...draft.media];
    const j = i + dir;
    if (j < 0 || j >= media.length) return;
    [media[i], media[j]] = [media[j], media[i]];
    set({ media });
  };

  const save = async () => {
    setBusy(true);
    setError('');
    try {
      await api.savePost(resetIfChanged(post, draft, ['kind', 'title', 'caption', 'date', 'time', 'media']));
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível guardar.');
      setBusy(false);
    }
  };

  return (
    <Modal open onClose={onClose} wide>
      <div className="grid md:grid-cols-[1fr_1.1fr]">
        {/* Ficheiros */}
        <div className="space-y-3 bg-sand p-6">
          <p className="label">Ficheiros · {draft.media.length}</p>
          <div className="grid grid-cols-3 gap-2">
            {draft.media.map((m, i) => (
              <div key={m.url + i} className="group relative">
                <Thumb media={m} className="aspect-[4/5] w-full" />
                <span className="absolute left-1 top-1 bg-ink/70 px-1.5 text-[10px] text-cream">{i + 1}</span>
                <div className="absolute inset-x-0 bottom-0 flex justify-between bg-ink/70 opacity-0 transition group-hover:opacity-100">
                  <button className="px-2 py-1 text-xs text-cream" onClick={() => moveMedia(i, -1)} aria-label="Mover para trás">←</button>
                  <button className="px-2 py-1 text-xs text-cream" onClick={() => set({ media: draft.media.filter((_, j) => j !== i) })} aria-label="Remover">✕</button>
                  <button className="px-2 py-1 text-xs text-cream" onClick={() => moveMedia(i, 1)} aria-label="Mover para a frente">→</button>
                </div>
              </div>
            ))}
            <label className="flex aspect-[4/5] cursor-pointer flex-col items-center justify-center gap-1 border border-dashed border-stone/60 text-stone transition hover:border-ink hover:text-ink">
              <span className="text-2xl font-extralight">{uploading ? '…' : '+'}</span>
              <span className="text-[9px] uppercase tracking-label">{uploading ? `A carregar ${uploading}` : 'Imagem / vídeo'}</span>
              <input type="file" accept="image/*,video/*" multiple className="hidden" onChange={(e) => upload(e.target.files)} disabled={!!uploading} />
            </label>
          </div>
          <p className="text-xs text-stone">Carrossel: carregue várias imagens pela ordem certa. Formato ideal 4:5 (1080×1350).</p>
        </div>

        {/* Dados */}
        <div className="space-y-5 p-6 sm:p-8">
          <p className="label">{isNew ? 'Nova publicação' : `Publicação Nº ${String(index + 1).padStart(2, '0')}`}</p>

          <div className="grid grid-cols-3 border border-line">
            {(['post', 'carrossel', 'reel'] as PostKind[]).map((k) => (
              <button
                key={k}
                onClick={() => set({ kind: k })}
                className={`flex items-center justify-center gap-2 py-2.5 text-[10px] font-medium uppercase tracking-label transition ${draft.kind === k ? 'bg-ink text-cream' : 'text-stone hover:text-ink'}`}
              >
                <KindIcon kind={k} className="h-3.5 w-3.5" />
                {KIND_LABEL[k]}
              </button>
            ))}
          </div>

          <Field label="Título interno">
            <input className="input" value={draft.title} onChange={(e) => set({ title: e.target.value })} placeholder="Ex.: 5 peças essenciais" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Data">
              <input className="input" type="date" value={draft.date} onChange={(e) => set({ date: e.target.value })} />
            </Field>
            <Field label="Hora">
              <input className="input" type="time" value={draft.time} onChange={(e) => set({ time: e.target.value })} />
            </Field>
          </div>
          <Field label="Legenda">
            <textarea className="input min-h-[160px] resize-y leading-relaxed" value={draft.caption} onChange={(e) => set({ caption: e.target.value })} />
          </Field>

          {!isNew && (
            <div className="space-y-2 border-t border-line pt-4">
              <div className="flex items-center justify-between">
                <span className="label">Resposta do cliente</span>
                <StatusBadge status={post.status} />
              </div>
              {post.feedback && <p className="whitespace-pre-line border-l-2 border-clay bg-sand px-3 py-2 text-sm">“{post.feedback}”</p>}
              {post.status !== 'pendente' && <p className="text-xs text-stone">Se alterar o conteúdo, volta a ficar “Por aprovar” para o cliente rever.</p>}
              {post.date && <p className="text-xs text-stone">Agendado: {scheduleLabel(post.date, post.time)}</p>}
            </div>
          )}

          {error && <p className="text-xs text-clay">{error}</p>}

          <div className="flex flex-wrap items-center gap-2">
            <button className="btn-ink flex-1" onClick={save} disabled={busy || !!uploading}>{busy ? 'A guardar…' : 'Guardar'}</button>
            {!isNew && (
              <>
                <button className="btn-line px-3" onClick={() => onMove(-1)} disabled={index === 0} title="Mover para trás no feed">←</button>
                <button className="btn-line px-3" onClick={() => onMove(1)} disabled={index === total - 1} title="Mover para a frente no feed">→</button>
                <ConfirmButton
                  className="btn border-transparent px-3 text-clay hover:border-clay"
                  label="Apagar"
                  onConfirm={async () => {
                    await api.deletePost(post.id);
                    onSaved();
                  }}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

function StoryEditor({ story, onClose, onSaved }: { story: Story; onClose: () => void; onSaved: () => void }) {
  const [draft, setDraft] = useState<Story>(story);
  const [busy, setBusy] = useState(false);
  const set = (patch: Partial<Story>) => setDraft((d) => ({ ...d, ...patch }));
  const setFrame = (i: number, patch: Partial<StoryFrame>) =>
    set({ frames: draft.frames.map((f, j) => (j === i ? { ...f, ...patch } : f)) });

  const save = async () => {
    setBusy(true);
    const frames = draft.frames
      .map((f) => ({ text: f.text.trim(), options: f.options.map((o) => o.trim()).filter(Boolean) }))
      .filter((f) => f.text || f.options.length);
    await api.saveStory(resetIfChanged(story, { ...draft, frames }, ['week', 'day', 'title', 'frames']));
    onSaved();
  };

  return (
    <Modal open onClose={onClose}>
      <div className="space-y-5 p-6 sm:p-8">
        <p className="label">Sequência de stories</p>
        <div className="grid grid-cols-[90px_1fr] gap-3">
          <Field label="Semana">
            <input className="input" type="number" min={1} max={6} value={draft.week} onChange={(e) => set({ week: Math.max(1, Number(e.target.value) || 1) })} />
          </Field>
          <Field label="Dia">
            <select className="input" value={draft.day} onChange={(e) => set({ day: e.target.value })}>
              {WEEKDAYS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Título">
          <input className="input" value={draft.title} onChange={(e) => set({ title: e.target.value })} placeholder="Ex.: Sequência de venda 1" />
        </Field>

        <div className="space-y-3">
          <span className="label block">Stories</span>
          {draft.frames.map((f, i) => (
            <div key={i} className="space-y-2 border border-line p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone">Story {i + 1}</span>
                <button className="text-xs text-stone hover:text-clay" onClick={() => set({ frames: draft.frames.filter((_, j) => j !== i) })}>Remover</button>
              </div>
              <textarea className="input min-h-[70px] resize-y" value={f.text} onChange={(e) => setFrame(i, { text: e.target.value })} placeholder="Texto do story" />
              <input
                className="input text-xs"
                value={f.options.join(', ')}
                onChange={(e) => setFrame(i, { options: e.target.value.split(',') })}
                placeholder="Enquete / botões (opcional, separados por vírgula)"
              />
            </div>
          ))}
          <button className="label transition hover:text-ink" onClick={() => set({ frames: [...draft.frames, { text: '', options: [] }] })}>+ Adicionar story</button>
        </div>

        {story.feedback && (
          <p className="whitespace-pre-line border-l-2 border-clay bg-sand px-3 py-2 text-sm">“{story.feedback}”</p>
        )}

        <div className="flex gap-2">
          <button className="btn-ink flex-1" onClick={save} disabled={busy}>{busy ? 'A guardar…' : 'Guardar'}</button>
          <ConfirmButton
            className="btn border-transparent px-3 text-clay hover:border-clay"
            label="Apagar"
            onConfirm={async () => {
              await api.deleteStory(story.id);
              onSaved();
            }}
          />
        </div>
      </div>
    </Modal>
  );
}

function PlanForm({ plan, onClose, onSaved }: { plan: Plan; onClose: () => void; onSaved: () => void }) {
  const [draft, setDraft] = useState(plan);
  return (
    <Modal open onClose={onClose}>
      <form
        className="space-y-5 p-8"
        onSubmit={async (e) => {
          e.preventDefault();
          await api.updatePlan(draft);
          onSaved();
        }}
      >
        <p className="label">Dados do plano</p>
        <Field label="Nome do cliente">
          <input className="input" required value={draft.client_name} onChange={(e) => setDraft({ ...draft, client_name: e.target.value })} />
        </Field>
        <Field label="Instagram">
          <input className="input" value={draft.client_handle} onChange={(e) => setDraft({ ...draft, client_handle: e.target.value })} />
        </Field>
        <Field label="Mês">
          <input className="input" type="month" required value={draft.month} onChange={(e) => setDraft({ ...draft, month: e.target.value })} />
        </Field>
        <Field label="Tema do mês">
          <input className="input" value={draft.theme} onChange={(e) => setDraft({ ...draft, theme: e.target.value })} />
        </Field>
        <button className="btn-ink w-full">Guardar</button>
      </form>
    </Modal>
  );
}
