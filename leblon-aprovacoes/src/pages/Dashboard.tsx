import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import type { PlanBundle } from '../lib/types';
import { monthLabel, progress } from '../lib/format';
import { Modal, Spinner } from '../components/ui';
import { Thumb } from '../components/content';
import { CopyLink } from './PlanEditor';

function nextMonth(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function Dashboard() {
  const nav = useNavigate();
  const [plans, setPlans] = useState<PlanBundle[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ client_name: '', client_handle: '', month: nextMonth(), theme: '' });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.listPlans().then(setPlans);
  }, []);

  const create = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const plan = await api.createPlan(form);
      nav(`/plano/${plan.id}`);
    } finally {
      setBusy(false);
    }
  };

  if (!plans) return <Spinner />;

  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-12 sm:px-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="label">Planos de conteúdo</p>
          <h1 className="mt-3 text-4xl font-light uppercase tracking-[0.14em]">Clientes</h1>
        </div>
        <button className="btn-ink" onClick={() => setCreating(true)}>+ Novo plano</button>
      </div>

      {plans.length === 0 ? (
        <p className="mt-12 border border-dashed border-line px-6 py-20 text-center text-sm text-stone">
          Ainda não há planos. Crie o primeiro para enviar ao cliente.
        </p>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((b) => {
            const s = progress(b);
            return (
              <article key={b.plan.id} className="group flex flex-col border border-line bg-cream transition hover:border-ink">
                <Link to={`/plano/${b.plan.id}`} className="block">
                  <div className="grid grid-cols-3 gap-px bg-line">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Thumb key={i} media={b.posts[i]?.media[0]} className="aspect-[4/5] w-full" />
                    ))}
                  </div>
                  <div className="space-y-1 px-5 pt-5">
                    <p className="label">{monthLabel(b.plan.month)}</p>
                    <h2 className="text-lg font-light uppercase tracking-[0.08em]">{b.plan.client_name}</h2>
                    <p className="text-sm text-stone">{b.plan.client_handle}</p>
                  </div>
                </Link>
                <div className="mt-auto space-y-3 px-5 pb-5 pt-4">
                  <div className="h-px w-full bg-line">
                    <div className="h-px bg-ink" style={{ width: `${s.total ? (s.approved / s.total) * 100 : 0}%` }} />
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] uppercase tracking-[0.14em] text-stone">
                    <span className="text-ink">{s.approved} aprovados</span>
                    {s.changes > 0 && <span className="text-clay">{s.changes} alterações</span>}
                    <span>{s.pending} por aprovar</span>
                  </div>
                  <CopyLink token={b.plan.share_token} compact />
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Modal open={creating} onClose={() => setCreating(false)}>
        <form onSubmit={create} className="space-y-5 p-8">
          <p className="label">Novo plano</p>
          <h2 className="text-xl font-light uppercase tracking-[0.08em]">Cliente e mês</h2>
          <Field label="Nome do cliente">
            <input className="input" required value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} />
          </Field>
          <Field label="Instagram">
            <input className="input" placeholder="@cliente" value={form.client_handle} onChange={(e) => setForm({ ...form, client_handle: e.target.value })} />
          </Field>
          <Field label="Mês">
            <input className="input" type="month" required value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} />
          </Field>
          <Field label="Tema do mês (opcional)">
            <input className="input" value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value })} />
          </Field>
          <button className="btn-ink w-full" disabled={busy}>{busy ? 'A criar…' : 'Criar plano'}</button>
        </form>
      </Modal>
    </main>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="label block">{label}</span>
      {children}
    </label>
  );
}
