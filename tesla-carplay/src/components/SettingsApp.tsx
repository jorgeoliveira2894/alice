import type { Coords } from '../useCoords';
import { Screen } from './Screen';

// A community trick: links opened through YouTube's redirect page make the
// Tesla browser switch to full screen. Tesla may change this in an update.
const fullscreenUrl = () =>
  'https://www.youtube.com/redirect?q=' + encodeURIComponent(window.location.href);

export function SettingsApp({ coords, onBack }: { coords: Coords; onBack: () => void }) {
  return (
    <Screen title="Definições" onBack={onBack}>
      <div className="grid h-full grid-cols-2 content-start gap-4 overflow-y-auto">
        <section className="rounded-3xl bg-panel p-6">
          <h2 className="mb-2 text-2xl font-semibold">Ecrã inteiro</h2>
          <p className="mb-4 text-lg text-dim">
            O browser do Tesla não deixa os sites pedir ecrã inteiro. Há um truque: abrir esta página
            através do redirecionamento do YouTube. Toca no botão e depois no link que aparece. Pode
            deixar de funcionar com uma atualização do carro.
          </p>
          <a href={fullscreenUrl()} className="press inline-flex h-14 items-center rounded-2xl bg-accent px-6 text-xl font-semibold">
            Abrir em ecrã inteiro
          </a>
        </section>

        <section className="rounded-3xl bg-panel p-6">
          <h2 className="mb-2 text-2xl font-semibold">Localização</h2>
          <p className="text-lg text-dim">
            {coords.approximate
              ? 'O browser não partilhou a localização. Os mapas e o tempo usam Lisboa.'
              : `A usar a localização do browser (${coords.lat.toFixed(3)}, ${coords.lon.toFixed(3)}).`}
          </p>
        </section>

        <section className="col-span-2 rounded-3xl bg-panel p-6">
          <h2 className="mb-2 text-2xl font-semibold">Sobre</h2>
          <p className="text-lg text-dim">
            Este painel imita o aspeto do CarPlay, mas não é CarPlay e não se liga ao iPhone. As apps
            marcadas com ↗ abrem o site respetivo no browser; usa o botão Voltar do browser para
            regressar. Com o carro em andamento, o Tesla bloqueia vídeo: o som funciona, a imagem não.
          </p>
        </section>
      </div>
    </Screen>
  );
}
