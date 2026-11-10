# Cebola Tennis Shop — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Catálogo Next.js fiel ao design system da Cebola, em que o botão "Comprar" leva o cliente ao WhatsApp com o produto ou a lista de produtos já informados.

**Architecture:** App Router com páginas renderizadas no servidor a partir de `lib/catalog.ts`, único ponto de leitura de `data/catalog.json` (trocado por banco na fase do admin). Sacola e favoritos ficam em um contexto client persistido no `localStorage`. O CSS `cb-*` do design system é copiado sem alterações e continua sendo o sistema de estilo.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, lucide-react, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-09-loja-catalogo-design.md`

**Design source (`$DS`):** extrair `Cebola Tennis Shop Design System.zip` em uma pasta temporária fora do projeto. `$DS/readme.md` define copy e visual; `$DS/ui_kits/website/*.jsx` é a referência de cada tela.

## Global Constraints

- Copy PT-BR, "você", sentence case, "sacola", sem emoji, no máximo um "!" em mensagens de sucesso.
- Preços no formato `R$ 1.599,90` com espaço não separável.
- Lime `#B9E80F` = ação; verde quadra `#1B592D` = superfície de marca; dourado `#F8C819` só em logo e estrelas.
- Sem Tailwind. Sem `_ds_bundle.js`, Babel no navegador ou CDN de ícones.
- Sem `useIsMobile` no render inicial: responsividade por media queries em `styles/site.css`.
- Sem checkout, cupom, frete calculado, conta ou busca.
- Imagens de exemplo apenas em `public/sample/`, ignorada pelo git. Boards de `uploads/` nunca são copiados.
- Next 16: `params` e `searchParams` são `Promise` e precisam de `await`.
- Git: a pasta ainda não é repositório. Só rodar `git init` e commits se o usuário pedir; sem isso, ignorar os passos de commit.

## Review Focus

1. `localStorage` com JSON corrompido: a loja abre com sacola vazia, sem erro. Teste na Task 3.
2. Produto salvo na sacola que saiu do catálogo: o item é descartado e o total continua correto. Teste na Task 3.
3. Nome de produto com `&`, `#` ou `+`, ou aspas: a mensagem chega inteira ao WhatsApp. Teste na Task 3.
4. Query string inválida (`?page=abc`, `?page=999`, `?min=x`): mostra uma página válida. Teste na Task 2.
5. Foto de exemplo ausente (deploy sem `public/sample/`): placa neutra no lugar da imagem quebrada. Verificação na Task 5.

---

### Task 1: Projeto e fundação visual

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `vitest.config.ts`, `.gitignore`, `.env.example`, `app/layout.tsx`, `app/page.tsx` (provisória), `styles/tokens/*.css`, `styles/components.css`, `styles/site.css`, `public/brand/logo/cebola-logo-{dark,light}.png`, `public/brand/fonts/*.woff2`

**Interfaces:**
- Produces: classes `cb-*`, tokens CSS, variável `NEXT_PUBLIC_WHATSAPP_NUMBER`, script `npm test`.

- [ ] **Step 1:** Criar `package.json` à mão (a pasta não está vazia, então não usar `create-next-app`) com `next@16`, `react@19`, `react-dom@19`, `lucide-react`, e dev `typescript`, `@types/react`, `@types/node`, `vitest`. Scripts: `dev`, `build`, `start`, `test` = `vitest run`. Rodar `npm install`.
- [ ] **Step 2:** `.gitignore` com `node_modules`, `.next`, `.env*.local`, `public/sample/`, `*.zip`. `.env.example` com `NEXT_PUBLIC_WHATSAPP_NUMBER=` e o comentário "somente dígitos com DDI, ex.: 5511999999999".
- [ ] **Step 3:** Copiar `$DS/tokens/*.css` e `$DS/components/components.css`; logo dark/light e fontes para `public/brand/`. Em `styles/tokens/fonts.css`, corrigir os caminhos das fontes para `/brand/fonts/`. Em `app/layout.tsx`, importar os CSS na ordem de `$DS/styles.css`, mais `kit.css` incorporado a `site.css`; `<html lang="pt-BR">`; metadata com título "Cebola Tennis Shop".
- [ ] **Step 4:** `npm run build`. Esperado: build sem erros.
- [ ] **Step 5:** Commit `chore: scaffold Next app with design tokens`.

### Task 2: Catálogo e formatação

**Files:**
- Create: `lib/types.ts`, `lib/catalog.ts`, `lib/format.ts`, `data/catalog.json` (fixture mínima, completada na Task 4)
- Test: `tests/catalog.test.ts`, `tests/format.test.ts`

**Interfaces:**
- Produces, em `lib/types.ts`:
  - `Category = { id: string; slug: string; label: string; image: string }`
  - `ProductOption = { label: string; values: string[] }`
  - `Product = { id: string; slug: string; name: string; brand: string; categoryId: string; price: number; oldPrice?: number; images: string[]; badge?: { label: string; tone?: 'lime'|'dark'|'sale'|'light' }; description: string; options: ProductOption[]; sku?: string; featured?: boolean; isNew?: boolean }`
  - `CatalogQuery = { brands: string[]; onSale: boolean; isNew: boolean; min?: number; max?: number; sort: 'relevancia'|'menor-preco'|'maior-preco'; page: number }`
- Produces, em `lib/catalog.ts`: `getCategories(): Promise<(Category & { count: number })[]>`, `getCategoryBySlug(slug): Promise<Category | null>`, `getProducts(): Promise<Product[]>`, `getProductBySlug(slug): Promise<Product | null>`, `getProductsByIds(ids: string[]): Promise<Product[]>`, `getRelated(product, limit = 5): Promise<Product[]>`, e as puras `parseCatalogQuery(raw: Record<string, string | string[] | undefined>): CatalogQuery`, `applyCatalogQuery(products, query): { items: Product[]; total: number; page: number; pageCount: number }`. `PAGE_SIZE = 12`.
- Produces, em `lib/format.ts`: `brl(n: number): string`, `installments(n): string`, `pixPrice(n): number`. Constantes `INSTALLMENTS = 10`, `PIX_DISCOUNT = 0.05`.

- [ ] **Step 1: Testes que falham.** `brl(1599.9)` é `R$ 1.599,90`; `installments(1599.9)` é `10x de R$ 159,99 sem juros`; `pixPrice(1599.9)` arredonda para `1519.91`. `parseCatalogQuery({ page: 'abc', min: 'x' })` dá `page: 1` e `min` indefinido; `sort` desconhecido vira `relevancia`; `marca` aceita string ou array e preenche `brands`. `applyCatalogQuery` com `page: 999` devolve a última página; com `page` válida devolve 12 itens; filtra por marca, promoção (`oldPrice` definido), faixa de preço; ordena por preço. `getCategories` calcula `count`; `getProductBySlug('nao-existe')` é `null`.
- [ ] **Step 2:** `npm test`. Esperado: FAIL, módulos inexistentes.
- [ ] **Step 3:** Implementar. As telas nunca importam `data/catalog.json`.
- [ ] **Step 4:** `npm test`. Esperado: PASS.
- [ ] **Step 5:** Commit `feat: add catalog data layer and BRL formatting`.

### Task 3: WhatsApp e estado da sacola

**Files:**
- Create: `lib/whatsapp.ts`, `lib/cart.ts`, `components/StoreProvider.tsx`
- Test: `tests/whatsapp.test.ts`, `tests/cart.test.ts`

**Interfaces:**
- Produces, em `lib/cart.ts`: `CartLine = { key: string; id: string; qty: number; attrs: { label: string; value: string }[] }`, `lineKey(id, attrs): string`, `addLine(lines, id, qty, attrs): CartLine[]`, `parseStored<T>(raw: string | null, fallback: T): T`, `resolveLines(lines, products): (CartLine & { product: Product })[]`.
- Produces, em `lib/whatsapp.ts`: `WaItem = { name: string; qty: number; price: number; attrs: { label: string; value: string }[] }`, `buildMessage(items: WaItem[]): string`, `buildWhatsAppUrl(number: string | undefined, message: string): string | null`.
- Produces, em `StoreProvider.tsx`: `useStore(): { cart: CartLine[]; favorites: string[]; hydrated: boolean; addToCart(id, qty, attrs): void; setQty(key, qty): void; remove(key): void; toggleFavorite(id): void; toast: string | null }`. Chaves `cebola-cart` e `cebola-favorites`. Ler o `localStorage` só em `useEffect`.

- [ ] **Step 1: Testes que falham.** Um item: mensagem começa com `Olá! Tenho interesse neste produto:`; contém `1x Raquete Wilson Burn 100 V5.0 (Grip: L2)`. Dois itens: começa com `Olá! Tenho interesse nestes produtos:` e contém `Total estimado: R$ …` com a soma de `price × qty`. `buildWhatsAppUrl('55 (11) 99999-9999', 'a & b #1 + "c"')` é `https://wa.me/5511999999999?text=` seguido de `encodeURIComponent` da mensagem, e o texto decodificado é idêntico ao original. `buildWhatsAppUrl(undefined, 'x')` e `buildWhatsAppUrl('', 'x')` são `null`. `addLine` soma a quantidade para a mesma chave e cria nova linha para opções diferentes. `parseStored('{quebrado', [])` é `[]`; `parseStored('{"a":1}', [])` é `[]` quando o fallback é array e o valor não é. `resolveLines` descarta `id` fora do catálogo.
- [ ] **Step 2:** `npm test`. Esperado: FAIL.
- [ ] **Step 3:** Implementar. Formato da linha: `- {qty}x {name} ({label}: {value}, …) — {brl(price)} cada`. Mensagem termina com `Pode me ajudar?`. Parênteses omitidos se não houver opções.
- [ ] **Step 4:** `npm test`. Esperado: PASS.
- [ ] **Step 5:** Commit `feat: add WhatsApp message builder and cart state`.

### Task 4: Conteúdo de exemplo

**Files:**
- Create: `public/sample/**` (ignorada pelo git), `scripts/fetch-sample-images.sh`
- Modify: `data/catalog.json`

**Interfaces:**
- Consumes: tipos `Product` e `Category` da Task 2.

- [ ] **Step 1:** Copiar `$DS/assets/img/{products,categories,lifestyle}` para `public/sample/`.
- [ ] **Step 2:** Buscar em Unsplash ou Pexels fotos para o que falta: bonés (3), cordas (2), grips/overgrips (2), munhequeira e bolsas se preciso. Registrar URLs e `curl` em `scripts/fetch-sample-images.sh`, para refazer a pasta em outra máquina.
- [ ] **Step 3:** Preencher o JSON com as 8 categorias da spec (`raquetes`, `calcados`, `bolas`, `bones-e-viseiras`, `vestuario`, `bolsas`, `cordas-e-grips`, `acessorios`) e pelo menos 30 produtos, partindo de `$DS/ui_kits/website/data.js`, com `Tipo + Marca + Modelo`. Opções: raquetes `Grip: L1–L4`; calçados `Tamanho: 37–44`; vestuário `Tamanho: P, M, G, GG`; bolas sem opções. Descrição concreta (padrão de cordas, peso etc.).
- [ ] **Step 4:** Adicionar a `tests/catalog.test.ts`: todo `categoryId` existe, `slug` é único, `images` não vazio, cada categoria tem ao menos 1 produto. `npm test`. Esperado: PASS.
- [ ] **Step 5:** Commit `feat: add sample catalog content`.

### Task 5: Componentes e layout

**Files:**
- Create: `components/cb/*.tsx` (Logo, Icon, Button, IconButton, CarouselNav, Input, Select, Checkbox, OptionChip, QuantityStepper, PriceRange, Breadcrumbs, Pagination, SiteHeader, SiteFooter, ProductCard, CategoryTile, CartItem, OrderSummary, SectionHeader, GlassLabel, Accordion, FeatureCard, TestimonialCard, BrandMarquee), `components/BuyButton.tsx`, `components/SafeImage.tsx`, `components/ProductTile.tsx`, `components/ProductRail.tsx`, `components/Reveal.tsx`, `components/TopBar.tsx`, `components/MobileMenu.tsx`, `components/Toast.tsx`
- Modify: `app/layout.tsx`, `styles/site.css`

**Interfaces:**
- Consumes: `useStore`, `buildMessage`, `buildWhatsAppUrl`.
- Produces: `<BuyButton items={WaItem[]} label="Comprar" block? />`, `<ProductTile product={Product} size? aspect? />`, `<ProductRail title products />`, `<SafeImage src alt className />`. Props dos `cb/*` iguais aos `.d.ts` do kit, com exceção de `OrderSummary` (sem `discount`, `shipping`, `onPromo`, `onAllPromos`, `onCheckout`; recebe `action: ReactNode`) e de `Logo` (caminho `/brand/logo/…`).

- [ ] **Step 1:** Portar os componentes de `$DS/components/` para TSX, mantendo as classes `cb-*`. `Icon` mapeia nomes para `lucide-react` com `strokeWidth={1.5}`; se a versão atual não tiver ícones de marca (`instagram`, `youtube`), usar SVG inline. `ProductCard` e `CategoryTile` viram links reais (`next/link`) e usam `SafeImage`.
- [ ] **Step 2:** `SafeImage`: no `onError`, esconde a imagem e deixa visível a placa `--surface-media`. Usar `<img>` nativo enquanto as imagens forem de exemplo.
- [ ] **Step 3:** `BuyButton`: `<a target="_blank" rel="noopener">` quando a URL existe. Sem URL, botão `disabled` e a nota "WhatsApp ainda não configurado".
- [ ] **Step 4:** Layout com `StoreProvider`, `TopBar` (overlay em `/` até 70% da altura da tela, senão solid), `MobileMenu`, `Toast`, `SiteFooter`. Links do header: Catálogo, Raquetes, Promoções. Trocar o layout desktop/compact do header por CSS.
- [ ] **Step 5:** Verificar: `npm run build` passa; com `public/sample` renomeada, a página mostra placas neutras sem ícone de imagem quebrada.
- [ ] **Step 6:** Commit `feat: port design system components and site shell`.

### Task 6: Home

**Files:**
- Modify: `app/page.tsx`
- Create: `components/home/*.tsx` conforme as seções, `data/home.ts`

**Interfaces:**
- Consumes: `getProducts`, `getCategories`, `ProductRail`.

- [ ] **Step 1:** Portar `$DS/ui_kits/website/HomeScreen.jsx`, seção por seção: hero com vídeo Vimeo (`$DS/ui_kits/website/data.js`, `heroVideo`), Novidades, Categorias, marcas, "Por que escolher a Cebola", Consultoria, Recomendados, depoimentos. Conteúdo textual em `data/home.ts`. "Falar com consultor" usa `BuyButton`-equivalente com mensagem `Olá! Gostaria de falar com um consultor.`.
- [ ] **Step 2:** Verificar em 1440px e 390px contra o UI kit, com `prefers-reduced-motion` respeitado.
- [ ] **Step 3:** Commit `feat: build home page`.

### Task 7: Catálogo

**Files:**
- Create: `app/catalogo/page.tsx`, `app/catalogo/[categoria]/page.tsx`, `components/catalog/CatalogView.tsx`, `components/catalog/Filters.tsx`

**Interfaces:**
- Consumes: `parseCatalogQuery`, `applyCatalogQuery`, `getCategoryBySlug`.

- [ ] **Step 1:** Portar `CatalogScreen.jsx`. `Filters` é client e altera a query string por `useRouter().replace`. Promoções: link `/catalogo?promocao=1`. Sidebar no desktop, bottom sheet no mobile.
- [ ] **Step 2:** Categoria inexistente chama `notFound()`. `generateStaticParams` e `generateMetadata` por categoria. Lista vazia mostra "Nenhum produto com esses filtros" e "Limpar filtros".
- [ ] **Step 3:** Verificar: filtros refletem na URL; recarregar mantém o estado; `/catalogo/xyz` dá 404; `?page=abc` abre a primeira página.
- [ ] **Step 4:** Commit `feat: build catalog pages with URL filters`.

### Task 8: Produto

**Files:**
- Create: `app/produto/[slug]/page.tsx`, `components/product/ProductView.tsx`, `components/product/Gallery.tsx`

**Interfaces:**
- Consumes: `getProductBySlug`, `getRelated`, `BuyButton`, `useStore`.

- [ ] **Step 1:** Portar `ProductScreen.jsx`: galeria, opções como chips, quantidade, Pix e parcelas, acordeão, relacionados, barra fixa no mobile. Sem o select de encordoamento, que não entra nos dados. "Comprar" (primário) usa `BuyButton` com o produto, opções e quantidade atuais; "Adicionar à sacola" é secundário. A barra fixa mobile traz "Comprar".
- [ ] **Step 2:** Primeira opção de cada grupo vem pré-selecionada, para a mensagem nunca sair incompleta. `generateMetadata` com título, descrição e `openGraph.images`. Slug inexistente chama `notFound()`.
- [ ] **Step 3:** Verificar: alterar grip e quantidade muda o link `wa.me` no botão.
- [ ] **Step 4:** Commit `feat: build product page with direct WhatsApp purchase`.

### Task 9: Sacola, favoritos e 404

**Files:**
- Create: `app/sacola/page.tsx`, `app/favoritos/page.tsx`, `app/not-found.tsx`, `components/cart/CartView.tsx`, `components/FavoritesView.tsx`

**Interfaces:**
- Consumes: `useStore`, `resolveLines`, `buildMessage`, `BuyButton`, `getProducts` (passados como prop pelo server component).

- [ ] **Step 1:** Portar `CartScreen.jsx` sem `CheckoutSteps` e sem cupom. `OrderSummary` mostra `Produtos, N un.`, total estimado, `BuyButton` "Comprar" com a lista e a nota `Frete e pagamento são combinados no atendimento.`. Estado vazio segue o kit. Enquanto `hydrated` for falso, mostrar a área reservada, sem piscar "sacola vazia".
- [ ] **Step 2:** `/favoritos` usa `ProductTile`, com estado vazio e link para o catálogo. `not-found` com link para a home.
- [ ] **Step 3:** Verificar: adicionar 2 produtos, alterar quantidade, recarregar, conferir o texto decodificado do link `wa.me`.
- [ ] **Step 4:** Commit `feat: add bag and favorites pages`.

### Task 10: Verificação final

**Files:** ajustes pontuais conforme achados.

- [ ] **Step 1:** `npm test` e `npm run build`. Esperado: tudo verde.
- [ ] **Step 2:** `npm start` e captura de tela de todas as rotas em 1440px e 390px; comparar com o UI kit e corrigir diferenças. Conferir que não há rolagem horizontal em 390px e nem erros de hidratação no console.
- [ ] **Step 3:** Conferir que `git check-ignore public/sample` confirma a exclusão (se o repositório existir) e que a busca por `Ir para entrega`, `cupom` e `checkout` em `app/` e `components/` não encontra nada visível.
- [ ] **Step 4:** Criar `README.md` curto: como rodar, variável do WhatsApp, `scripts/fetch-sample-images.sh`, lista de conteúdo provisório da spec.
- [ ] **Step 5:** Commit `docs: add README`.
