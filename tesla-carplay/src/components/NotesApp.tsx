import { useState } from 'react';
import { load, save } from '../storage';
import { Screen } from './Screen';

const KEY = 'tesla-carplay:notes';

export function NotesApp({ onBack }: { onBack: () => void }) {
  const [text, setText] = useState(() => load(KEY, ''));
  return (
    <Screen title="Notas" onBack={onBack}>
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          save(KEY, e.target.value);
        }}
        placeholder="Escreve aqui (fica guardado neste browser)…"
        className="h-full w-full resize-none rounded-3xl bg-panel p-6 text-2xl leading-relaxed outline-none placeholder:text-dim"
      />
    </Screen>
  );
}
