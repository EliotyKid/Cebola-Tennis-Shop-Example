# Cebola Tennis Shop — catálogo com pedido por WhatsApp

Data: 2026-11-09. Fonte visual: `Cebola Tennis Shop Design System.zip` (design system e UI kit).

## Intenção

Site de catálogo da Cebola Tennis Shop, loja brasileira especializada em tênis (o esporte). O cliente descobre produtos, monta uma sacola e é levado ao WhatsApp, onde um atendente tira dúvidas e fecha a venda. O site não vende: ele leva o cliente até a conversa com a sacola já descrita.

Esta é a primeira fase. Depois virá uma página admin para adicionar, alterar e remover produtos e categorias, então a leitura de dados precisa estar pronta para essa troca.

## Objetivos

- Portar fielmente o design: tokens, fontes, componentes `cb-*`, telas Home, Catálogo, Produto e Sacola, em desktop e mobile.
- Produtos de exemplo cobrindo raquetes, calçados, bolas, bonés, vestuário, bolsas, cordas e acessórios.
- Sacola que termina em um link do WhatsApp com a mensagem pronta.
- Páginas de produto e categoria geradas no servidor, com título, descrição e imagem de compartilhamento (SEO e prévia de link).

## Fora de escopo

Checkout, pagamento, frete calculado, cupom, conta de usuário, controle de estoque, busca (não desenhada) e o admin (próxima fase).

## O que não pode acontecer

- Site visualmente genérico ou distante do design system.
- Fotos de exemplo indo para produção.
- Texto que prometa uma etapa inexistente, como "Ir para entrega" ou "Pagar".

## Restrições

- Copy em PT-BR, conforme `readme.md` do design system: "você", sentence case, "sacola", preços como `R$ 1.599,90`, sem emoji.
- Lime é ação, verde quadra é superfície de marca, dourado só para logo e estrelas.
- Respeitar `prefers-reduced-motion`.

## Abordagens consideradas

| Abordagem | Vantagem | Custo |
|---|---|---|
| **Next.js, dados em arquivo (escolhida pelo usuário)** | SEO e prévia de links; admin entra no mesmo projeto | Hospedagem com Node |
| Vite + React | Porte mais direto, hospedagem estática | SEO fraco; admin exige backend separado |
| Astro com partes em React | Site mais leve | Interatividade em quase toda página; admin encaixa pior |

## Decisões do usuário

- Next.js.
- A sacola termina no WhatsApp, com um atendente; sem checkout.
- Nome: "Cebola Tennis Shop".
- Imagens são apenas de exemplo e não vão para o build final nem para produção.
- Admin fica para depois.

## Decisões técnicas (propostas pelo Claude)

### Estrutura

- Next.js App Router, TypeScript, sem Tailwind: `tokens/*.css` e `components/components.css` são copiados e continuam sendo o sistema de estilo.
- Portar para TSX apenas os componentes usados, usando os `.d.ts` do kit como contrato de props. Não usar `_ds_bundle.js` nem Babel no navegador.
- Fontes Lexend e Manrope auto-hospedadas, a partir de `fonts/`.
- Ícones Lucide com `lucide-react` e traço 1.5, no lugar do download via CDN do componente `Icon`.
- Layout responsivo por CSS (media queries). O `useIsMobile` do kit lê `window` e causaria divergência de hidratação no servidor; só usar JS para comportamento que não afete o primeiro render.

### Rotas

| Rota | Conteúdo |
|---|---|
| `/` | Hero com vídeo Vimeo, Novidades, Categorias, marcas, "Por que escolher a Cebola", Consultoria, Recomendados, depoimentos |
| `/catalogo` | Todos os produtos, filtros, ordenação, paginação |
| `/catalogo/[categoria]` | Mesma tela, filtrada por categoria |
| `/produto/[slug]` | Galeria, opções, quantidade, acordeão, relacionados, barra fixa no mobile |
| `/sacola` | Itens da sacola, resumo e botão do WhatsApp |
| `/favoritos` | Produtos favoritados; o coração do header precisa de um destino |

Filtros e ordenação ficam na query string, para que os links possam ser compartilhados.

### Dados e preparo para o admin

- `data/catalog.json` com `categories` e `products`.
- `lib/catalog.ts` é o único ponto de leitura, com funções assíncronas (`getProducts`, `getProductBySlug`, `getCategories`…). As telas nunca importam o JSON. No admin, só este arquivo muda para ler o banco.
- Produto: `id`, `slug`, `name`, `brand`, `categoryId`, `price`, `oldPrice?`, `images[]`, `badge?`, `description`, `options[]` (por exemplo, Grip ou Tamanho, com valores), `sku?`, `featured?`.
- Categoria: `id`, `slug`, `label`, `image`. A contagem de produtos é calculada, nunca digitada.
- Categorias por tipo de produto: Raquetes, Calçados, Bolas, Bonés e viseiras, Vestuário, Bolsas, Cordas e grips, Acessórios. O kit agrupa quase tudo em `feminino`; isso não será mantido.
- Sacola e favoritos no `localStorage`, via client components. A sacola começa vazia (o seed do kit não é portado) e guarda apenas `id`, opções e quantidade; preço e nome vêm sempre do catálogo.

### WhatsApp

- Número em `NEXT_PUBLIC_WHATSAPP_NUMBER`. Enquanto não houver número real, o botão aparece desabilitado com aviso, em vez de abrir uma conversa errada.
- O botão "Comprar" (decisão do usuário) abre `https://wa.me/<número>?text=<mensagem codificada>` já informando ao atendente o interesse do cliente.
- Na sacola, "Comprar" envia a lista: itens, opções, quantidades, preços e total estimado.
- No produto, "Comprar" envia só aquele produto, com opções e quantidade escolhidas; "Adicionar à sacola" continua como ação secundária.
- `CheckoutSteps`, cupom e frete calculado não são portados. "Ir para entrega" vira "Comprar". O resumo informa que frete e pagamento são combinados no atendimento.
- Linhas de Pix e parcelamento continuam como referência, calculadas por constantes únicas em `lib/`.

### Imagens de exemplo

- Ficam em `public/sample/`, que entra no `.gitignore` e não vai para o repositório nem para o deploy.
- Reaproveitar as fotos de `assets/img/` do kit e buscar na internet o que falta (bonés, cordas, grips e outros).
- As imagens são referenciadas só pelos dados do catálogo. Se o arquivo faltar, o card mostra a placa neutra do design, sem quebrar o layout.
- Logo e fontes são da marca e ficam em `public/brand/`, incluídos no build. Os boards de `uploads/` não são copiados.

### Verificação

- Testes pequenos para a montagem da mensagem do WhatsApp, a formatação de preços e os filtros do catálogo.
- `next build` passando e conferência visual das telas em desktop e mobile, comparando com o UI kit.

## Conteúdo provisório a revisar antes de publicar

Vêm do kit ou são inventados, e não são fatos da loja: depoimentos, "frete grátis acima de R$ 499", "envio em até 24h", "troca em 30 dias", endereço e contatos do rodapé, preços e produtos de exemplo. O número do WhatsApp também precisa ser informado.

## Deixado para quem implementar

Organização interna de pastas, divisão entre server e client components, e paginação exata (mantendo a aparência do kit).
