import type { Media, Plan, Post, Story } from './types';
import { newId, newToken } from './format';

/** Capa de exemplo em SVG, na linguagem LEBLON (carvão + creme). */
function cover(title: string, dark: boolean): Media {
  const bg = dark ? '#171715' : '#F3EDE3';
  const fg = dark ? '#FFFBF4' : '#171715';
  const words = title.toUpperCase().split(' ');
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length > 14) {
      lines.push(line.trim());
      line = w;
    } else line += ' ' + w;
  }
  lines.push(line.trim());
  const text = lines
    .map((l, i) => `<text x="90" y="${720 + i * 92}" font-size="78" letter-spacing="6">${l}</text>`)
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350">
<rect width="1080" height="1350" fill="${bg}"/>
<g fill="${fg}" font-family="Jost, Futura, 'Century Gothic', Helvetica, Arial, sans-serif" font-weight="400">
<rect x="90" y="600" width="140" height="6"/>
${text}
<text x="90" y="1250" font-size="28" letter-spacing="14" opacity="0.7">LEBLON</text>
</g></svg>`;
  return { type: 'image', url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}` };
}

export function seedData(): { plans: Plan[]; posts: Post[]; stories: Story[] } {
  const plan: Plan = {
    id: newId(),
    client_name: 'Casa Aurora',
    client_handle: '@casaaurora',
    month: '2026-11',
    theme: 'Lançamento da coleção de inverno',
    share_token: newToken(),
    created_at: new Date().toISOString(),
  };

  const base = { plan_id: plan.id, status: 'pendente' as const, feedback: '', reviewed_at: null };
  const raw: Array<Pick<Post, 'kind' | 'title' | 'caption' | 'date' | 'time'> & { slides?: string[] }> = [
    { kind: 'reel', title: 'A coleção chegou', date: '2026-11-03', time: '18:00',
      caption: 'A coleção de inverno chegou à loja. Tecidos naturais, cores de terra e peças pensadas para durar.\n\nVisita-nos esta semana e conhece cada detalhe.\n\n#casaaurora #inverno' },
    { kind: 'carrossel', title: '5 peças essenciais', date: '2026-11-05', time: '12:30',
      slides: ['5 peças essenciais', 'O casaco de lã', 'A malha grossa', 'As botas de couro'],
      caption: 'Cinco peças que resolvem o inverno inteiro. Guarda este post para a próxima ida às compras.' },
    { kind: 'post', title: 'Feito à mão em Portugal', date: '2026-11-07', time: '19:00',
      caption: 'Cada peça passa por mãos portuguesas antes de chegar às tuas. É assim desde o primeiro dia.' },
    { kind: 'carrossel', title: 'Como cuidar da lã', date: '2026-11-10', time: '12:30',
      slides: ['Como cuidar da lã', 'Lavar a frio', 'Secar na horizontal'],
      caption: 'Três gestos simples para a tua lã durar anos. Desliza para ver.' },
    { kind: 'reel', title: 'Bastidores do atelier', date: '2026-11-12', time: '18:00',
      caption: 'Um dia no atelier, do primeiro esboço à última costura.' },
    { kind: 'post', title: 'Novembro em casa', date: '2026-11-14', time: '19:00',
      caption: 'Mantas, chá quente e tempo para nós. Novembro pede calma.' },
  ];

  const posts: Post[] = raw.map((r, i) => {
    const dark = i % 2 === 0;
    const media = r.slides
      ? r.slides.map((s, j) => cover(s, j % 2 === 0 ? dark : !dark))
      : [cover(r.title, dark)];
    return {
      ...base,
      id: newId(),
      position: i,
      kind: r.kind,
      title: r.title,
      caption: r.caption,
      date: r.date,
      time: r.time,
      media,
    };
  });

  const stories: Story[] = [
    {
      ...base,
      id: newId(),
      position: 0,
      week: 1,
      day: 'Segunda-feira',
      title: 'Sequência 1: Despertar o desejo',
      frames: [
        { text: 'Já sentiste que o teu casaco não aguenta mais um inverno?', options: ['Sim, todos os anos', 'Ainda aguenta'] },
        { text: 'A nova coleção foi desenhada para durar dez anos, não uma estação.', options: [] },
        { text: 'Amanhã mostramos-te a peça favorita da equipa. Ativa as notificações.', options: [] },
      ],
    },
    {
      ...base,
      id: newId(),
      position: 1,
      week: 1,
      day: 'Quinta-feira',
      title: 'Caixa de perguntas',
      frames: [
        { text: 'Dúvidas sobre tamanhos ou tecidos? Pergunta aqui.', options: ['Caixa de perguntas'] },
        { text: 'Respostas em vídeo amanhã, às 18h.', options: [] },
      ],
    },
    {
      ...base,
      id: newId(),
      position: 2,
      week: 2,
      day: 'Terça-feira',
      title: 'Sequência 2: Prova social',
      frames: [
        { text: '"Comprei o casaco em 2019 e continua como novo." Marta, Lisboa', options: [] },
        { text: 'Mostra-nos a tua peça Casa Aurora com a hashtag #casaaurora.', options: [] },
      ],
    },
  ];

  return { plans: [plan], posts, stories };
}
