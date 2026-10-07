# LEBLON · Aprovação de conteúdos

Portal para enviar aos clientes o plano de conteúdo do mês e recolher a aprovação, com a identidade LEBLON.

- **Agência** (`/`): cria um plano por cliente e mês, carrega imagens, carrosséis e reels, escreve legenda, data e hora, e planeia os stories por semana. Vê o que foi aprovado e os pedidos de alteração.
- **Cliente** (`/c/<link-secreto>`): não precisa de conta. Vê o feed tal como vai ficar no Instagram, abre cada publicação (carrossel, vídeo, legenda) e carrega em **Aprovar** ou **Pedir alterações** com um comentário. Pode aprovar tudo de uma vez.
- Se a agência alterar uma publicação depois da resposta do cliente, ela volta a ficar **Por aprovar**.

## Experimentar já (modo demonstração)

```bash
npm install
npm run dev        # http://localhost:5173
```

Sem configuração, a app corre em modo demonstração com um plano de exemplo. Os dados ficam guardados só nesse browser, por isso o link do cliente só abre no mesmo browser. Serve para ver e testar, não para enviar a clientes.

## Pôr a funcionar a sério (Supabase + Vercel, planos gratuitos chegam)

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Em **SQL Editor**, cole e corra `supabase/schema.sql`. Cria as tabelas, as regras de acesso e o espaço para os ficheiros.
3. Em **Authentication > Users > Add user**, crie o utilizador da agência (email e palavra-passe). Em **Authentication > Sign In / Providers**, desative "Allow new users to sign up" para ninguém mais criar conta.
4. Copie `.env.example` para `.env` e preencha com os valores de **Project Settings > API** (`Project URL` e `anon public key`).
5. Publique na [Vercel](https://vercel.com) e adicione as duas variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`. Há duas formas:
   - **Projeto com vários serviços** (o `vercel.json` na raiz do repositório): a galeria fica em `/` e este portal em `/aprovacoes`. Importe o repositório sem mudar o *Root Directory*.
   - **Projeto só para o portal**: escolha `leblon-aprovacoes` como *Root Directory*; o `vercel.json` desta pasta trata das rotas e a app fica na raiz do domínio.

   Para publicar num subcaminho noutro alojamento, compile com `BASE_PATH=/subcaminho/ npm run build`.

Depois é entrar com o email da agência, criar o plano, carregar os conteúdos e enviar ao cliente o link do painel "Link para o cliente".

## Segurança

- A agência só vê os seus próprios planos (Row Level Security no Supabase).
- O cliente só chega aos dados através de duas funções (`get_plan_by_token` e `review_item`) que exigem o link secreto de 24 caracteres. Quem tem o link pode ver e aprovar esse plano, por isso trate-o como uma palavra-passe.
- Os ficheiros carregados ficam num bucket público (URLs aleatórias), para as imagens e vídeos abrirem no link do cliente.

## Estrutura

```
src/lib/types.ts       modelo de dados (plano, publicação, stories)
src/lib/api.ts         interface única; escolhe Supabase ou demonstração
src/lib/supabase.ts    implementação real
src/lib/demo.ts        implementação local (IndexedDB) + dados de exemplo em seed.ts
src/pages/ClientView   página do cliente
src/pages/Dashboard    lista de planos
src/pages/PlanEditor   editor do plano (publicações, stories, link)
supabase/schema.sql    base de dados
```

Stack: React, Vite, TypeScript, Tailwind, Supabase. Tipografia Jost; cores LEBLON `#171715` e `#FFFBF4`.
