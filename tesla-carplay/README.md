# Painel Tesla (estilo CarPlay)

Uma página web com aspeto de CarPlay, feita para o browser do Tesla: ícones grandes,
barra lateral com relógio e apps recentes, e um painel com mapa, rádio e tempo.

> **Não é CarPlay.** Não se liga ao iPhone nem mostra as tuas apps. O iPhone só envia
> CarPlay para recetores com um chip de autenticação da Apple, e o browser do Tesla não
> tem acesso a USB nem a Bluetooth. Para CarPlay verdadeiro é preciso hardware extra
> (por exemplo, um dongle Carlinkit ligado a um Raspberry Pi).

## O que tem

| App | Como funciona |
| --- | --- |
| Mapas | Google Maps dentro da página, com pesquisa; o botão **Ir** abre a navegação no site do Google Maps |
| Waze | Mapa ao vivo do Waze dentro da página |
| Rádio | Estações portuguesas da [Radio Browser](https://www.radio-browser.info/), sem chave de API. Continua a tocar quando mudas de ecrã |
| Tempo | Previsão de 5 dias da [Open-Meteo](https://open-meteo.com/), sem chave de API |
| Notas | Texto guardado neste browser |
| Spotify, YouTube Music, Apple Music, Podcasts, Carregadores, PlugShare (↗) | Estes sites não deixam ser embebidos, por isso o separador vai para lá. Volta com o botão Voltar do browser |

O botão em baixo na barra lateral alterna entre a grelha de apps e o **Painel**.
Os mapas e o tempo usam a localização do browser e, se ela não for partilhada, Lisboa.

## Desenvolver

```bash
cd tesla-carplay
npm install
npm run dev      # abre em http://localhost:5173 (e na rede local, com --host)
npm run build    # gera dist/
```

## Usar no Tesla

O browser do Tesla precisa de um endereço público. Publica a pasta `dist/` num alojamento
estático. Por exemplo:

- **Vercel / Netlify:** importa o repositório, define `tesla-carplay` como pasta do projeto,
  comando `npm run build` e pasta de saída `dist`.
- **GitHub Pages:** publica o conteúdo de `dist/`. O `base: './'` do Vite já usa caminhos relativos.

Depois abre o endereço no browser do carro e guarda-o nos favoritos.

### Ecrã inteiro

O browser do Tesla não deixa os sites pedir ecrã inteiro. Em **Definições** há um botão que
abre a página através de `youtube.com/redirect`. É um truque da comunidade que põe o browser
em ecrã inteiro, mas uma atualização do carro pode fazê-lo deixar de funcionar.

### Limitações

- Com o carro em andamento, o Tesla bloqueia vídeo; o som (rádio, Spotify Web) continua a funcionar.
- Só tocam estações com stream HTTPS, porque a página é servida por HTTPS.
