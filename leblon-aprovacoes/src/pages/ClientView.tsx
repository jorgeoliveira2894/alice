import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import type { ItemKind, PlanBundle, Post, Status } from '../lib/types';
import { monthLabel, progress } from '../lib/format';
import { DemoBanner, Logo, Modal, Spinner, StatusBadge, StatusDot } from '../components/ui';
import { byWeek, Caption, FeedGrid, MediaViewer, PostMeta, ReviewPanel, StoryFrames, Thumb } from '../components/content';

type Tab = 'feed' | 'stories';

export default function ClientView() {
  const { token = '' } = useParams();
  const [data, setData] = useState<PlanBundle | null | undefined>(undefined);
  const [tab, setTab] = useState<Tab>('feed');
  const [openId, setOpenId] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [confirmAll, setConfirmAll] = useState(false);

  const load = useCallback(async () => {
    try {
      setData(await api.getByToken(token));
    } catch {
      setData(null);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const review = async (kind: ItemKind, id: string, status: Status, feedback: string) => {
    await api.review(token, kind, id, status, feedback);
    // Atualiza já no ecrã; o servidor é a fonte de verdade no próximo carregamento.
    setData((d) => {
      if (!d) return d;
      const patch = { status, feedback, reviewed_at: new Date().toISOString() };
      return kind === 'post'
        ? { ...d, posts: d.posts.map((p) => (p.id === id ? { ...p, ...patch } : p)) }
        : { ...d, stories: d.stories.map((s) => (s.id === id ? { ...s, ...patch } : s)) };
    });
  };

  const approveAllPending = async () => {
    if (!data) return;
    setBulkBusy(true);
    try {
      for (const p of data.posts.filter((x) => x.status === 'pendente')) await review('post', p.id, 'aprovado', '');
      for (const s of data.stories.filter((x) => x.status === 'pendente')) await review('story', s.id, 'aprovado', '');
    } finally {
      setBulkBusy(false);
      setConfirmAll(false);
    }
  };

  const stats = useMemo(() => (data ? progress(data) : null), [data]);

  if (data === undefined) return <Spinner />;
  if (data === null)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-ink px-6 text-center text-cream">
        <Logo tone="cream" className="w-28" />
        <p className="label text-cream/60">Este link não existe ou já não está ativo.</p>
      </div>
    );

  const { plan, posts, stories } = data;
  const openIndex = posts.findIndex((p) => p.id === openId);
  const openPost: Post | undefined = posts[openIndex];
  const pct = stats!.total ? Math.round((stats!.approved / stats!.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-cream">
      {api.demo && <DemoBanner />}
      <div className="lg:flex">
        {/* Barra lateral */}
        <aside className="bg-ink text-cream lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-80 lg:shrink-0 lg:flex-col">
          <div className="px-6 pb-6 pt-8 lg:px-8 lg:pt-10">
            <Logo tone="cream" className="mb-8 w-16 lg:w-20" />
            <div>
              <p className="label text-cream/50">Plano de conteúdo</p>
              <h2 className="mt-3 text-2xl font-light uppercase tracking-[0.08em]">{plan.client_name}</h2>
              <p className="mt-1 text-sm text-cream/60">{plan.client_handle}</p>
              {plan.theme && <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/70">{plan.theme}</p>}
            </div>
          </div>

          <div className="px-6 pb-6 lg:px-8">
            <div className="flex items-baseline justify-between">
              <span className="label text-cream/50">Aprovados</span>
              <span className="text-sm tabular-nums">{stats!.approved}/{stats!.total}</span>
            </div>
            <div className="mt-2 h-px w-full bg-cream/15">
              <div className="h-px bg-cream transition-all duration-700 ease-soft" style={{ width: `${pct}%` }} />
            </div>
            {stats!.changes > 0 && <p className="mt-2 text-[11px] text-cream/60">{stats!.changes} com alterações pedidas</p>}
          </div>

          <nav className="hidden flex-1 overflow-y-auto border-t border-cream/10 px-4 py-4 lg:block">
            <p className="label px-4 pb-2 text-cream/40">Conteúdos do mês</p>
            {posts.map((p, i) => (
              <button
                key={p.id}
                onClick={() => {
                  setTab('feed');
                  setOpenId(p.id);
                }}
                className="flex w-full items-center gap-3 px-4 py-2 text-left transition hover:bg-cream/5"
              >
                <Thumb media={p.media[0]} className="h-9 w-9 shrink-0" />
                <span className="min-w-0 flex-1 truncate text-[13px] text-cream/85">
                  <span className="mr-2 text-cream/40 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                  {p.title || 'Sem título'}
                </span>
                <StatusDot status={p.status} />
              </button>
            ))}
            {stories.length > 0 && (
              <button onClick={() => setTab('stories')} className="mt-2 flex w-full items-center justify-between px-4 py-2 text-left text-[13px] text-cream/85 transition hover:bg-cream/5">
                <span>Stories · {stories.length} sequências</span>
                <span className="text-cream/40">→</span>
              </button>
            )}
          </nav>

        </aside>

        {/* Conteúdo */}
        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-3xl px-4 pb-24 pt-10 sm:px-8 lg:pt-14">
            <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="label">{plan.client_handle || plan.client_name} · para aprovação</p>
                <h1 className="mt-3 text-4xl font-light uppercase tracking-[0.14em] sm:text-5xl">{monthLabel(plan.month)}</h1>
              </div>
              {stats!.pending > 0 && (
                <button className="btn-ink whitespace-nowrap" onClick={() => setConfirmAll(true)} disabled={bulkBusy}>
                  Aprovar pendentes ({stats!.pending})
                </button>
              )}
            </header>

            {stats!.total > 0 && stats!.pending === 0 && (
              <div className="mt-8 border border-ink px-5 py-4">
                <p className="label text-ink">Revisão concluída</p>
                <p className="mt-1 text-sm text-ink/80">
                  Obrigado. {stats!.changes > 0 ? `Vamos tratar dos ${stats!.changes} pedidos de alteração e voltamos a enviar.` : 'Está tudo aprovado. Agora é connosco.'}
                </p>
              </div>
            )}

            <div className="mt-10 flex gap-8 border-b border-line">
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
                posts.length ? (
                  <>
                    <p className="mb-4 text-sm text-stone">Toque em cada publicação para ver em detalhe, ler a legenda e aprovar.</p>
                    <FeedGrid posts={posts} onOpen={(p) => setOpenId(p.id)} />
                  </>
                ) : (
                  <Empty text="Ainda não há publicações neste plano." />
                )
              ) : stories.length ? (
                <div className="space-y-12">
                  {byWeek(stories).map(([week, list]) => (
                    <section key={week}>
                      <p className="label mb-4 text-ink">Semana {week}</p>
                      <div className="space-y-6">
                        {list.map((s) => (
                          <article key={s.id} className="overflow-hidden border border-ink">
                            <div className="bg-ink px-5 py-6 text-cream sm:px-7">
                              <div className="flex items-center justify-between gap-3">
                                <span className="label text-cream/50">{s.day} · {s.frames.length} stories</span>
                                <StatusBadge status={s.status} compact />
                              </div>
                              <h3 className="mt-3 text-lg font-light uppercase tracking-[0.08em]">{s.title}</h3>
                              <div className="mt-5">
                                <StoryFrames story={s} />
                              </div>
                            </div>
                            <div className="px-5 pb-5 sm:px-7">
                              <ReviewPanel
                                key={`${s.status}-${s.feedback}`}
                                status={s.status}
                                feedback={s.feedback}
                                onSubmit={(st, fb) => review('story', s.id, st, fb)}
                              />
                            </div>
                          </article>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              ) : (
                <Empty text="Ainda não há stories neste plano." />
              )}
            </div>

            <footer className="mt-20 flex items-center justify-between border-t border-line pt-6">
              <span className="label">Preparado por</span>
              <Logo tone="ink" className="w-14" />
            </footer>
          </div>
        </main>
      </div>

      {/* Detalhe da publicação */}
      <Modal open={!!openPost} onClose={() => setOpenId(null)} wide>
        {openPost && (
          <div className="grid md:grid-cols-[1.05fr_1fr]">
            <MediaViewer key={openPost.id} media={openPost.media} />
            <div className="flex flex-col gap-5 p-6 sm:p-8">
              <PostMeta post={openPost} index={openIndex} />
              <h2 className="pr-8 text-xl font-light uppercase tracking-[0.08em]">{openPost.title || 'Sem título'}</h2>
              <div>
                <p className="label mb-2">Legenda</p>
                <Caption text={openPost.caption} />
              </div>
              <div className="mt-auto">
                <ReviewPanel
                  key={`${openPost.id}-${openPost.status}`}
                  status={openPost.status}
                  feedback={openPost.feedback}
                  onSubmit={(st, fb) => review('post', openPost.id, st, fb)}
                />
                <div className="mt-5 flex justify-between">
                  <button className="label transition hover:text-ink disabled:opacity-30" disabled={openIndex <= 0} onClick={() => setOpenId(posts[openIndex - 1].id)}>
                    ← Anterior
                  </button>
                  <button className="label transition hover:text-ink disabled:opacity-30" disabled={openIndex >= posts.length - 1} onClick={() => setOpenId(posts[openIndex + 1].id)}>
                    Seguinte →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={confirmAll} onClose={() => setConfirmAll(false)}>
        <div className="space-y-5 p-8">
          <p className="label">Confirmar</p>
          <h2 className="text-xl font-light uppercase tracking-[0.08em]">Aprovar {stats!.pending} conteúdos?</h2>
          <p className="text-sm text-ink/80">
            Todas as publicações e stories ainda por aprovar ficam aprovadas. Os pedidos de alteração que já fez mantêm-se.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button className="btn-line" onClick={() => setConfirmAll(false)} disabled={bulkBusy}>Voltar</button>
            <button className="btn-ink" onClick={approveAllPending} disabled={bulkBusy}>{bulkBusy ? 'A aprovar…' : 'Aprovar'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="border border-dashed border-line px-6 py-16 text-center text-sm text-stone">{text}</p>;
}
