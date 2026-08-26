# Task Manager

## O que é

Task Manager é uma aplicação web para organizar tarefas e acompanhar seu andamento. Além da lista manual de tarefas, o projeto inclui um assistente de IA que transforma uma meta descrita em linguagem natural em uma lista de tarefas com estimativas de esforço e tempo. Pensado para quem quer organizar tarefas pessoais de forma simples, e para recrutadores ou avaliadores técnicos que querem ver, na prática, um assistente de IA com streaming e tool calling funcionando em produção.

## Screenshots

![Task list view](./screenshots/tasks.png)

![AI assistant view](./screenshots/assistant.png)

## Como rodar localmente

### Requisitos

- Node.js 22 ou superior
- npm
- Uma chave da API da Anthropic para testar o fluxo real do assistente

### Passo a passo

1. Clone o repositório:

   ```bash
   git clone https://github.com/Caroljamarco/task-manager-next.git
   cd task-manager-next
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Crie um arquivo `.env.local` na raiz do projeto e adicione sua chave da Anthropic:

   ```env
   ANTHROPIC_API_KEY=sua_chave_aqui
   ```

4. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

5. Abra [http://localhost:3000](http://localhost:3000). A lista de tarefas fica em `/tasks` e o assistente de IA em `/assistant`.

## Exemplo de uso

No `/assistant`, digite uma meta em linguagem natural, por exemplo:

> "Plan a weekend trip"

O assistente quebra a meta em uma lista de 4 a 8 tarefas concretas (ex: "Book accommodation", "Research local activities", "Pack essentials"), chama a ferramenta `estimateTaskEffort` para cada uma, e exibe o resultado em cards coloridos por nível de esforço (verde/âmbar/vermelho) com uma estimativa de tempo.

**Nota:** chamadas reais dependem de crédito ativo na API da Anthropic — veja a seção "Limitações conhecidas" abaixo.

## Variáveis de ambiente

| Variável | O que faz | Obrigatória? | Onde conseguir |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | Autentica as chamadas server-side para a API da Anthropic. | Sim para usar o assistente com chamadas reais. | [console.anthropic.com](https://console.anthropic.com/) |

## Arquitetura

O projeto usa o Next.js App Router. As principais áreas são:

| Caminho | Responsabilidade |
|---|---|
| `app/tasks/page.tsx` | Lista de tarefas, adição, conclusão e remoção de tarefas. |
| `app/assistant/page.tsx` | Página do assistente de IA. |
| `app/components/Chat.tsx` | Interface do chat e estados do streaming. |
| `app/components/ToolCard.tsx` | Exibe estados e resultados da ferramenta de estimativa. |
| `app/api/chat/route.ts` | Rota server-side que conversa com a Anthropic. |
| `lib/ai/config.ts` | Modelo, parâmetros e prompt do assistente. |
| `lib/ai/estimate-task-effort.ts` | Ferramenta de estimativa com schema Zod. |
| `lib/ai/rate-limit.ts` | Rate limiting e limite de tamanho de mensagem. |
| `tests/` e `e2e/` | Testes unitários e de navegador. |

### Fluxo do streaming de IA

1. O componente de chat envia as mensagens do cliente para `POST /api/chat`.
2. A rota converte as mensagens para o formato do modelo e chama `streamText` do Vercel AI SDK.
3. O provider `@ai-sdk/anthropic` encaminha a solicitação para o modelo Anthropic configurado.
4. A resposta volta em streaming para o navegador com `toUIMessageStreamResponse()`, permitindo que a interface seja atualizada enquanto a resposta é gerada.

### Tool calling

Quando o assistente identifica uma meta que pode ser dividida em tarefas, ele gera de 4 a 8 títulos e chama `estimateTaskEffort`. A ferramenta valida a entrada com Zod, estima nível de esforço (`low`, `medium` ou `high`) e minutos usando uma tabela local de palavras-chave, e devolve os resultados para o componente `ToolCard`.

### Rate limiting

Antes de chamar a API, a rota identifica o IP pelo header `x-forwarded-for` e aplica um limite de 5 requisições por minuto. A última mensagem do usuário também é limitada a 2000 caracteres. Requisições acima do limite recebem HTTP 429; mensagens maiores recebem HTTP 413.

## Avaliação da lógica de estimativa de esforço

Para validar a lógica de `estimateTaskEffort` sem depender de crédito de API (essa função não chama a Anthropic — usa uma tabela local de palavras-chave), criei um eval executável em `evals/estimate-task-effort.eval.ts`, rodável com `npm run eval:effort`.

**Resultado:** testado localmente com 17 tarefas de exemplo, cobrindo casos óbvios e ambíguos. Taxa de acerto: 12/17 (70,6%).

**Casos que falharam:** tarefas iniciadas por palavras não presentes na tabela de palavras-chave, como "Send", "Prepare", "Compare", "Schedule" e "Learn".

**Limitação revelada:** a lógica depende da primeira palavra do título e de um conjunto específico de palavras-chave em inglês; termos não mapeados recebem a classificação padrão `medium`, o que pode gerar estimativas imprecisas para frases fora desse vocabulário.

## Decisões técnicas

- **Next.js App Router:** organiza páginas, layouts e rotas de API no mesmo projeto, com uma separação clara entre interface e código server-side.
- **Edge runtime na rota de IA:** reduz a distância entre a requisição e a API externa e combina com o modelo de resposta em streaming.
- **Vercel AI SDK:** fornece as abstrações de streaming, mensagens de UI e tool calling usadas pelo chat.
- **Rate limit em memória:** `Map` e timestamps resolvem a proteção básica sem adicionar Redis, Upstash ou outro serviço externo. Isso é simples de explicar e suficiente para um projeto de portfólio.
- **Zod:** valida a entrada e a saída da ferramenta de estimativa com schemas explícitos.
- **Vitest e Testing Library:** cobrem os componentes React em testes rápidos e focados no comportamento.
- **Playwright:** verifica o fluxo da interface em um navegador real.

## Limitações conhecidas

- A conta Anthropic usada neste projeto não tem crédito pago no momento. Chamadas reais retornam `"Your credit balance is too low to access the Anthropic API."` com HTTP 400, conforme confirmado pelos logs de produção da Vercel.
- O código e a autenticação da API estão corretos e funcionais. Essa falha é uma limitação da conta, não da implementação.
- O rate limiting é mantido em memória. Instâncias simultâneas de edge function possuem contagens independentes, portanto o limite não é perfeitamente preciso em escala. Isso é aceitável para um projeto de portfólio, mas não seria adequado para uma aplicação de alta escala.
- As tarefas da página `/tasks` ficam somente no estado do navegador e não possuem persistência em banco de dados.
- O assistente depende de uma chave válida e de crédito disponível na conta Anthropic para executar chamadas reais.

## How AI tools built this

Esta seção descreve o processo de forma direta:

- A estrutura inicial do projeto, incluindo os comandos para criar e baixar pastas e a organização inicial, foi feita pela autora sem ajuda de IA.
- A IA foi usada pela primeira vez para gerar partes de código como `app/api/chat/route.ts`, páginas do aplicativo e configurações relacionadas ao `package.json`.
- A IA foi usada principalmente para debugar conflitos de versão entre o VS Code, o GitHub e o macOS.
- Nos pontos de bifurcação, a IA sugeriu caminhos possíveis. A decisão final foi sempre da autora, avaliando o que era capaz de realizar e explicar de acordo com seu nível.
- Em alguns momentos a IA sugeriu código com erros simples, como tags sem fechamento. Esses problemas foram identificados e corrigidos com facilidade.
- A IA também realizou o trabalho final de testar o projeto e preparar este README.

## Testes

Os 14 testes unitários podem ser executados com:

```bash
npm test
```

Eles cobrem o componente de chat, incluindo estados vazios, envio, streaming, erro e resultado de ferramenta; a lista de tarefas, incluindo adicionar, concluir e remover; e os quatro estados visuais do `ToolCard`.

O teste E2E usa Playwright e pode ser executado com:

```bash
npx playwright install
npm run test:e2e
```

No GitHub Actions, o workflow configura Node.js 22, instala as dependências, executa `npm test`, instala o Chromium do Playwright e executa `npm run test:e2e` em pushes e pull requests para `main`.

## Auditoria de acessibilidade

O fluxo principal do assistente foi auditado manualmente. O resultado registrado em [AUDIT.md](./AUDIT.md) inclui Lighthouse Accessibility 95 e WAVE com zero erros após as correções. A auditoria também registra Lighthouse Performance 100, Best Practices 100 e SEO 100.
