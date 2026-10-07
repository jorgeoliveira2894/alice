import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Logo } from '../components/ui';

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.signIn(email, password);
      nav('/');
    } catch {
      setError('Email ou palavra-passe incorretos.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-6">
      <form onSubmit={submit} className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-5">
          <Logo tone="cream" className="w-28" />
          <p className="label text-cream/50">Aprovação de conteúdos</p>
        </div>
        <div className="space-y-3">
          <input className="input border-cream/20 bg-transparent text-cream focus:border-cream" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          <input className="input border-cream/20 bg-transparent text-cream focus:border-cream" type="password" placeholder="Palavra-passe" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        </div>
        {error && <p className="text-center text-xs text-clay">{error}</p>}
        <button className="btn w-full border-cream bg-cream text-ink hover:bg-sand" disabled={busy}>{busy ? 'A entrar…' : 'Entrar'}</button>
      </form>
    </div>
  );
}
