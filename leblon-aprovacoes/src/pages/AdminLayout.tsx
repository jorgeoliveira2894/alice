import { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { DemoBanner, Logo, Spinner } from '../components/ui';

/** Protege a área da agência e desenha o cabeçalho comum. */
export default function AdminLayout() {
  const nav = useNavigate();
  const [user, setUser] = useState<{ email: string } | null | undefined>(undefined);

  useEffect(() => {
    api.getUser().then((u) => {
      if (!u) nav('/entrar', { replace: true });
      setUser(u);
    });
  }, [nav]);

  if (!user) return <Spinner />;

  return (
    <div className="min-h-screen bg-cream">
      {api.demo && <DemoBanner />}
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-8">
          <Link to="/" className="flex items-center gap-4">
            <Logo tone="ink" className="w-12" />
            <span className="label hidden sm:inline">Aprovação de conteúdos</span>
          </Link>
          {!api.demo && (
            <button
              className="label transition hover:text-ink"
              onClick={async () => {
                await api.signOut();
                nav('/entrar');
              }}
            >
              Sair
            </button>
          )}
        </div>
      </header>
      <Outlet />
    </div>
  );
}
