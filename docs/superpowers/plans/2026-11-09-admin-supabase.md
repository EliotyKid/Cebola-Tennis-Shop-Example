# Admin com Supabase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Área `/admin` autenticada para funcionários manterem produtos, categorias, imagens e estoque, com a loja lendo do Supabase.

**Architecture:** Postgres com RLS é a fronteira de segurança; a loja lê com a chave pública via `unstable_cache` (tag `catalog`) e o admin escreve por Server Actions com a sessão do usuário em cookies. As imagens são comprimidas no navegador e enviadas direto ao bucket `catalog`. A loja vai para o route group `app/(loja)`, para o admin ter layout próprio.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, `@supabase/supabase-js`, `@supabase/ssr`, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-09-admin-supabase-design.md`

## Global Constraints

- Copy em PT-BR: "você", sentence case, "sacola", preços como `R$ 1.599,90`, sem emoji.
- Tokens e componentes `cb-*`, sem Tailwind. Lime é ação; dourado só para logo e estrelas.
- Respeitar `prefers-reduced-motion`, foco visível, teclado, rótulo em todo campo.
- O app usa só `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Nenhuma chave `service_role`/`secret`.
- Proteção do servidor com `supabase.auth.getClaims()`, nunca `getSession()`. Verificar em toda Server Action, não só no proxy.
- `proxy.ts` (Next 16), não `middleware.ts`.
- Projeto sem git: pular commits; não rodar `git init` sem o usuário pedir. O registro de progresso fica em `/tmp/claude-1000/-home-elioty-Documents-Work-cebola-tenis-shop/d77220d8-ed39-4662-874e-849973d462f9/scratchpad/admin-progress.md`.
- Porta 3000 pode ser do usuário: testar em `PORT=3100` e só encerrar processos iniciados por este plano.
- Migrations rodam por `mcp__supabase__apply_migration`; cada arquivo em `supabase/migrations/` é a fonte versionada do que foi aplicado.

## Review Focus

1. Requisição sem sessão direto à API do Supabase ou à Server Action: recusada (Task 1 `check-rls`, Task 5 teste de sessão).
2. Dois funcionários salvando o mesmo produto: o segundo recebe conflito e nada é gravado (Task 5).
3. Preço digitado como `1.599,90`, `1599.9`, `abc` ou `old_price` menor que preço: valor correto ou erro no campo (Task 5).
4. Remover imagem de exemplo (`/sample/...`) ou imagem ainda em uso: nunca apaga arquivo errado do bucket (Task 5).
5. Sacola com item fora de estoque: mensagem do WhatsApp identifica o item e o total não o inclui (Task 3).

---

### Task 1: Banco, RLS e bucket

**Files:**
- Create: `supabase/migrations/20261109000000_catalog.sql`, `scripts/generate-seed.mjs`, `supabase/seed.sql` (gerado), `scripts/check-rls.mjs`
- Modify: `.env.local`, `.env.example`

**Interfaces:**
- Produces: tabelas `categories` e `products` conforme a spec, trigger de `updated_at`, bucket público `catalog`, script `npm run check:rls`.

- [ ] **Step 1:** `mcp__supabase__list_tables` confirma banco vazio.
- [ ] **Step 2:** Escrever a migration: tabelas com `in_stock boolean not null default true`; check `price >= 0`; check `old_price is null or old_price > price`; FK `on delete restrict`; trigger `before update` em `products` definindo `updated_at = now()`; `enable row level security` nas duas tabelas; policies `select` para `anon, authenticated`; `insert/update/delete` só para `authenticated`. Bucket `catalog` em `storage.buckets` com `public = true`, `file_size_limit = 5242880`, `allowed_mime_types = '{image/webp}'`; policies em `storage.objects` limitadas a `bucket_id = 'catalog'`, com escrita só para `authenticated`.
- [ ] **Step 3:** Aplicar com `apply_migration`. Rodar `get_advisors` se disponível; caso contrário, consultar `pg_policies` via `execute_sql`.
- [ ] **Step 4:** `scripts/generate-seed.mjs` lê `data/catalog.json` e grava `supabase/seed.sql` preservando `id`, com escape de aspas e `in_stock = true`. Aplicar com `execute_sql`. Esperado: `count(*)` = 35 produtos e 8 categorias.
- [ ] **Step 5:** Preencher `.env.local` com `get_project_url` e `get_publishable_keys`, sem imprimir no chat; acrescentar os nomes ao `.env.example`.
- [ ] **Step 6:** `scripts/check-rls.mjs` usa a chave pública e falha (exit 1) salvo se: `select` em `products` retorna linhas; `insert`, `update` e `delete` não alteram nada; upload ao bucket é recusado; `GET /auth/v1/settings` tem `disable_signup: true`. Adicionar `"check:rls": "node --env-file=.env.local scripts/check-rls.mjs"`.
- [ ] **Step 7:** Rodar `npm run check:rls`. Esperado: tudo passa. Se só `disable_signup` falhar, avisar o usuário e seguir; a Task 9 volta a exigir.

### Task 2: Loja lendo do Supabase

**Files:**
- Create: `lib/supabase/public.ts`, `lib/catalog-db.ts`, `app/(loja)/layout.tsx`, `app/(loja)/error.tsx`, `app/(loja)/[...resto]/page.tsx`
- Move: `app/{page.tsx,catalogo,produto,sacola,favoritos,not-found.tsx}` para `app/(loja)/`
- Modify: `lib/catalog.ts`, `lib/types.ts`, `app/layout.tsx`, `tests/catalog.test.ts`, `package.json`
- Test: `tests/catalog-db.test.ts`

**Interfaces:**
- Produces: `Product.inStock: boolean` (obrigatório); `ProductRow`, `CategoryRow`; `toProduct(row: ProductRow): Product`; `toCategory(row: CategoryRow): Category`; `CATALOG_TAG = 'catalog'`; funções atuais de `lib/catalog.ts` com as mesmas assinaturas.

- [ ] **Step 1:** Testes: `toProduct` converte `category_id`, `old_price` nulo em `undefined`, `price` string `"1599.90"` em `1599.9`, `badge` nulo em `undefined`, `in_stock` em `inStock`.
- [ ] **Step 2:** Rodar `npx vitest run tests/catalog-db.test.ts`. Esperado: FAIL, módulo inexistente.
- [ ] **Step 3:** Instalar `@supabase/supabase-js` e `@supabase/ssr`. Implementar os mappers. Reescrever `lib/catalog.ts`: uma leitura `loadCatalog` em `unstable_cache(fn, ['catalog'], { tags: [CATALOG_TAG] })`, que lança erro se o Supabase falhar; categorias por `position`. `parseCatalogQuery` e `applyCatalogQuery` não mudam.
- [ ] **Step 4:** Em `tests/catalog.test.ts`, incluir `inStock: true` em `make`; os testes de integridade que chamavam `getProducts`/`getCategories` passam a ler `data/catalog.json` diretamente.
- [ ] **Step 5:** Mover a loja para `app/(loja)`. `app/layout.tsx` fica só com `html`, `body` e CSS global; `(loja)/layout.tsx` recebe `StoreProvider`, `TopBar`, rodapé e `Toast`. `[...resto]/page.tsx` chama `notFound()` para URLs inexistentes manterem o layout da loja. `error.tsx` mostra mensagem amigável e "Tentar novamente".
- [ ] **Step 6:** `npm test` e `npm run build`. Esperado: passam; as 35 páginas de produto são geradas do banco.

### Task 3: Fora de estoque na loja

**Files:**
- Modify: `lib/whatsapp.ts`, `components/BuyButton.tsx` (se preciso), `components/cb/commerce.tsx`, `components/ProductTile.tsx`, `components/product/ProductView.tsx`, `components/cart/CartView.tsx`, `styles/site.css`
- Test: `tests/whatsapp.test.ts`

**Interfaces:**
- Produces: `WaItem.outOfStock?: boolean`; `ProductCard` recebe `outOfStock?: boolean`.

- [ ] **Step 1:** Testes em `whatsapp.test.ts`, com asserções exatas:
  - Só item fora de estoque: começa com `Olá! Este produto está fora de estoque:`, contém `Quero saber quando volta ou como encomendar.` e não contém `Total estimado`.
  - Misto: total soma só os itens em estoque; a seção `Fora de estoque (quero saber quando volta ou como encomendar):` lista o outro item sem preço.
- [ ] **Step 2:** Rodar e ver FAIL.
- [ ] **Step 3:** Implementar em `buildMessage`. A saída para itens em estoque não muda.
- [ ] **Step 4:** Card mostra selo "Fora de estoque" e esconde o quick-add. `ProductView`: botão `BuyButton` com `label="Consultar disponibilidade"` nas áreas fixa e principal; "Adicionar à sacola" desabilitado. `CartView`: item marcado, com `outOfStock` em `WaItem`, e total da tela sem ele.
- [ ] **Step 5:** `npm test`; conferência visual em `PORT=3100` com um produto temporariamente `in_stock = false`, revertido depois.

### Task 4: Autenticação e casca do admin

**Files:**
- Create: `lib/supabase/server.ts`, `lib/supabase/browser.ts`, `lib/admin/auth.ts`, `proxy.ts`, `app/admin/login/page.tsx`, `app/admin/login/actions.ts`, `app/admin/(painel)/layout.tsx`, `components/admin/AdminShell.tsx`, `styles/admin.css`
- Test: `tests/admin-auth.test.ts`

**Interfaces:**
- Produces: `createServerSupabase(): Promise<SupabaseClient>`; `createBrowserSupabase(): SupabaseClient`; `getAdminUser(client): Promise<string | null>` (retorna `sub` via `getClaims`); `safeNext(next: string | null): string`; `ActionResult = { ok: true; id?: string } | { ok: false; error: 'validation'; fields: Record<string, string> } | { ok: false; error: 'session' | 'conflict' | 'unknown'; message: string }`.

- [ ] **Step 1:** Testes de `safeNext`: `/admin/produtos/1` mantém; `https://evil.com`, `//evil.com`, `/catalogo` e `null` viram `/admin`.
- [ ] **Step 2:** Ver FAIL; implementar; ver PASS.
- [ ] **Step 3:** Clientes `@supabase/ssr` conforme a orientação Next.js do Supabase. `proxy.ts` com matcher `/admin/:path*`: renova o token, redireciona sem sessão para `/admin/login?next=...`, redireciona quem tem sessão e abre o login para `/admin`, e devolve a resposta com os cookies do `setAll`.
- [ ] **Step 4:** Login com erro único `E-mail ou senha incorretos.`, ação "Sair" e layout `(painel)` com `getAdminUser` e `redirect`. `AdminShell`: lateral no desktop, barra no celular, "Produtos", "Categorias", "Ver loja", "Sair". `metadata.robots` `noindex`. Reaproveitar logo e `Button`.
- [ ] **Step 5:** Em `PORT=3100`: `curl -I /admin` sem cookie retorna redirecionamento para `/admin/login`. Login real depende da conta criada pelo usuário.

### Task 5: Regras de produto no servidor

**Files:**
- Create: `lib/admin/validation.ts`, `lib/admin/images.ts`, `lib/admin/products.ts`, `app/admin/(painel)/produtos/actions.ts`
- Test: `tests/admin-validation.test.ts`, `tests/admin-products.test.ts`

**Interfaces:**
- Consumes: `ActionResult`, `getAdminUser`, `createServerSupabase`, `CATALOG_TAG`.
- Produces: `slugify(s: string): string`; `parseBrl(s: string): number | null`; `parseProductInput(raw: unknown): { ok: true; value: ProductInput } | { ok: false; fields: Record<string, string> }`; `unusedStoragePaths(before: string[], after: string[], publicBase: string): string[]`; `saveProduct(client, input, id?: string, expectedUpdatedAt?: string): Promise<ActionResult>`; Server Actions `saveProductAction`, `deleteProductAction(id: string)`.

- [ ] **Step 1:** Testes:
  - `slugify('Raquete Pró – Ação 97')` = `raquete-pro-acao-97`.
  - `parseBrl`: `'1.599,90'` = 1599.9; `'1599.9'` = 1599.9; `'89'` = 89; `'abc'`, `''`, `'-1'` = `null`.
  - `parseProductInput`: exige nome, marca, categoria, preço, descrição e 1 imagem; `old_price` menor ou igual ao preço gera `fields.oldPrice`; opção sem valores gera erro.
  - `unusedStoragePaths`: devolve só URLs do `publicBase` que saíram da lista; ignora `/sample/a.jpg`.
  - `saveProduct` com cliente falso: em edição filtra por `updated_at`; 0 linhas retorna `error: 'conflict'`; código Postgres `23505` retorna `fields.slug`.
  - `saveProductAction` sem usuário retorna `error: 'session'` e não chama o banco.
- [ ] **Step 2:** Ver FAIL.
- [ ] **Step 3:** Implementar. O `updated_at` trafega como string original, sem passar por `Date`, para não perder microssegundos. Após gravar: `updateTag(CATALOG_TAG)` e `revalidatePath('/', 'layout')`, depois remover do bucket as imagens de `unusedStoragePaths`. Falha nessa remoção não desfaz o salvamento.
- [ ] **Step 4:** `npm test`. Esperado: passa.

### Task 6: Formulário de produto

**Files:**
- Create: `lib/admin/compress.ts`, `components/admin/ImageManager.tsx`, `components/admin/OptionsEditor.tsx`, `components/admin/ProductForm.tsx`, `app/admin/(painel)/produtos/novo/page.tsx`, `app/admin/(painel)/produtos/[id]/page.tsx`
- Test: `tests/admin-images.test.ts`

**Interfaces:**
- Consumes: `saveProductAction`, `slugify`, `createBrowserSupabase`.
- Produces: `validateImageFile(f: { type: string; size: number }): string | null`; `compressImage(file: File): Promise<Blob>`; `moveItem<T>(list: T[], from: number, to: number): T[]`.

- [ ] **Step 1:** Testes: `validateImageFile` aceita JPEG, PNG e WebP até 10 MB; recusa GIF e 10 MB + 1 com mensagem em PT-BR; `moveItem` respeita limites.
- [ ] **Step 2:** Ver FAIL; implementar; ver PASS.
- [ ] **Step 3:** `compressImage` via canvas: WebP, lado maior até 1600 px, qualidade 0.82. `ImageManager`: envio múltiplo, progresso, capa, "Mover para esquerda/direita", remover, erro por arquivo.
- [ ] **Step 4:** `ProductForm` em seções, conforme a spec: inclui checkbox "Em estoque", slug editável gerado do nome, preço BR, erros junto ao campo, estado "Salvando...", aviso `beforeunload`. Em `session`: reabre o login em nova aba e mantém o formulário. Em `conflict`: avisa e oferece "Recarregar produto".
- [ ] **Step 5:** `npm run build`.

### Task 7: Lista de produtos

**Files:**
- Create: `app/admin/(painel)/page.tsx`, `components/admin/ProductList.tsx`, `components/admin/ConfirmDialog.tsx`
- Test: `tests/admin-list.test.ts`

**Interfaces:**
- Produces: `filterAdminProducts(products: Product[], q: string, categoryId: string): Product[]`; `ConfirmDialog` baseado em `<dialog>` nativo, usado também na Task 8.

- [ ] **Step 1:** Testes: busca sem acento e sem caixa por nome, marca e SKU; combina com categoria.
- [ ] **Step 2:** Ver FAIL; implementar; ver PASS.
- [ ] **Step 3:** A lista lê dados sem cache com o cliente do servidor. Mostra miniatura, nome, marca, preço, estado de estoque, editar, excluir com confirmação citando o nome. Tabela no desktop, cartões no celular. Estados vazio, sem resultado e erro de conexão.

### Task 8: Categorias

**Files:**
- Create: `app/admin/(painel)/categorias/page.tsx`, `app/admin/(painel)/categorias/actions.ts`, `components/admin/CategoryManager.tsx`
- Test: `tests/admin-categories.test.ts`

**Interfaces:**
- Consumes: `slugify`, `ConfirmDialog`, `ImageManager`, `moveItem`, `getAdminUser`.
- Produces: `parseCategoryInput(raw: unknown)`; `deleteCategoryAction(id: string): Promise<ActionResult>`.

- [ ] **Step 1:** Testes: exige nome e imagem; violação de FK (`23503`) vira `A categoria ainda tem produtos.`; sem usuário retorna `session`.
- [ ] **Step 2:** Ver FAIL; implementar; ver PASS.
- [ ] **Step 3:** Tela com contagem, criar, editar nome/imagem, mover ordem, excluir. Excluir fica indisponível com contagem > 0, com a quantidade visível. Revalida como na Task 5.

### Task 9: Verificação final e documentação

**Files:**
- Modify: `README.md`, `lib/catalog.ts` (comentário)

- [ ] **Step 1:** README: variáveis, migrations, seed, criar/trocar senha de funcionário no painel, desligar cadastro público, plano gratuito e pausa.
- [ ] **Step 2:** `npm test`, `npm run build`, `npm run check:rls`. Esperado: tudo passa, inclusive `disable_signup`.
- [ ] **Step 3:** Com conta de funcionário criada pelo usuário, em `PORT=3100`: login; criar produto com upload; editar; ver a alteração na loja sem rebuild; marcar fora de estoque; conflito com duas abas; excluir e confirmar remoção do arquivo no bucket; categoria com produtos bloqueada; logout. Remover os dados de teste.
- [ ] **Step 4:** Capturas de login, lista, formulário e categorias em desktop e 390 px.
