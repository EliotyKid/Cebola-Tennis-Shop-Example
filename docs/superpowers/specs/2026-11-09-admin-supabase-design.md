# Cebola Tennis Shop — admin com Supabase

Data: 2026-11-09. Continua `2026-11-09-loja-catalogo-design.md`, que deixou o admin para esta fase.

## Intenção

Funcionários da loja mantêm o catálogo sem depender de desenvolvedor: adicionam, alteram e removem produtos, categorias e imagens. O que salvam aparece na loja. O admin é ferramenta de trabalho interna: limpo, rápido e difícil de usar errado.

## Objetivos

- Área `/admin` protegida por login, com conta individual para cada funcionário.
- CRUD de produtos e categorias, com upload, ordenação e remoção de imagens.
- Loja lendo do Supabase, sem mudança visível para o cliente.
- Os 35 produtos e 8 categorias de exemplo migrados para o banco.
- Uso confortável em desktop e celular.

## Fora de escopo

Perfis de permissão, tela de gestão de funcionários, histórico de alterações, controle de quantidade em estoque, rascunho ou ocultar produto, pedidos, relatórios, edição dos textos da home (depoimentos, consultoria) e importação em massa.

## O que não pode acontecer

- Alguém sem conta autorizada conseguir escrever no banco, mesmo chamando a API do Supabase diretamente.
- Chave `service_role`/`secret` no código, no navegador ou no chat.
- Um funcionário sobrescrever sem aviso a alteração de outro.
- Perder o que foi digitado por erro de validação ou sessão expirada.
- Salvar no admin e a loja continuar mostrando o dado antigo.

## Restrições

- Plano gratuito agora; plano pago ao ir para produção (decisão do usuário). Limites confirmados: 500 MB de banco, 1 GB de arquivos, 2 projetos. O gratuito pode pausar por inatividade, o que só afeta a fase de desenvolvimento.
- Copy em PT-BR, conforme o design system: "você", sentence case, preços como `R$ 1.599,90`, sem emoji.
- Tokens e fontes do design system, sem Tailwind. Lime é ação; dourado só para logo e estrelas.
- Respeitar `prefers-reduced-motion`, foco visível, navegação por teclado e rótulos em todos os campos.

## Abordagens consideradas

| Abordagem | Vantagem | Custo |
|---|---|---|
| **Supabase completo (escolhida pelo usuário)** | Banco, login, imagens e backups prontos; menos código | Pausa por inatividade no gratuito; login e imagens são mais trabalhosos de migrar |
| Supabase + Prisma | Migrations e tipos do Prisma | Dependência e configuração extras para 2 tabelas |
| Servidor próprio com Postgres + Prisma | Controle total, sem limites de plano | VPS, atualizações, backups, segurança, login e armazenamento por nossa conta |

## Decisões do usuário

- Supabase completo, no plano gratuito por enquanto.
- Vários funcionários, todos com as mesmas permissões de criar e alterar.
- Rotas protegidas por autenticação.
- Design limpo, respeitando boas práticas de UI/UX.
- O projeto é criado pelo usuário e conectado pelo MCP oficial com OAuth, restrito a esse projeto.

## Decisões técnicas (propostas pelo Claude)

### Banco

Migrations SQL versionadas em `supabase/migrations/`.

`categories`: `id` text PK, `slug` único, `label`, `image`, `position` int.

`products`: `id` text PK (padrão `gen_random_uuid()::text`), `slug` único, `name`, `brand`, `category_id` FK com `on delete restrict`, `price` numeric(10,2), `old_price` nullable, `images` text[], `badge` jsonb nullable, `description`, `options` jsonb, `sku` nullable, `featured`, `is_new`, `in_stock` (padrão `true`), `created_at`, `updated_at`.

Os `id` atuais são preservados na migração, para não invalidar sacolas e favoritos já salvos no navegador. Restrições no banco: preço não negativo; `old_price` maior que `price`.

### Autenticação e proteção

- `@supabase/ssr` e `@supabase/supabase-js`, com sessão em cookies. Login por e-mail e senha.
- Três camadas: bloqueio de rota em `/admin/*`, verificação de usuário em todo layout e Server Action, e RLS no banco. A RLS é a garantia real; as outras cuidam da experiência.
- RLS: leitura pública; `insert`, `update` e `delete` apenas para `authenticated`. Bucket `catalog` com leitura pública e escrita apenas para `authenticated`.
- **Cadastro público desligado no projeto.** Como qualquer conta autenticada pode escrever, isso faz parte da segurança. O checklist de configuração precisa confirmar esse ponto.
- O app usa só a chave pública.

### Funcionários

Contas criadas pelo painel do Supabase (Authentication > Users > Create new user), com senha definida na criação. Convite e "esqueci a senha" por e-mail ficam de fora: o SMTP padrão do Supabase só entrega para membros da organização, e um SMTP próprio é configuração extra. Troca de senha passa pelo painel, e o README documenta o processo. Tudo isso pode ser revisto na ida para produção.

### Leitura da loja

- Só `lib/catalog.ts` muda. Assinaturas atuais mantidas; o banco é convertido para `Product`/`Category`.
- Leitura em cache, invalidada sob demanda: cada escrita do admin revalida home, catálogo, categorias e produtos afetados.
- Produto criado depois do build precisa abrir normalmente (sem depender só de `generateStaticParams`).
- `data/catalog.json` deixa de ser lido pelo app e fica só como fonte do seed.

### Imagens

- Compressão no navegador antes do upload: WebP, lado maior até 1600 px. Isso protege o limite de 1 GB.
- Aceita JPEG, PNG e WebP, até 10 MB antes de comprimir. Erro claro para o restante.
- Upload direto ao bucket com a sessão do usuário, em caminho com UUID.
- Produto exige ao menos 1 imagem; a primeira é a capa. Reordenar por botões acessíveis, sem depender de arrastar.
- Trocar ou remover imagem, ou excluir produto, apaga os arquivos que deixaram de ser usados.
- As fotos de `/sample/` continuam referenciadas pelo seed só no ambiente local.

### Telas

| Rota | Conteúdo |
|---|---|
| `/admin/login` | E-mail, senha, erro genérico para credencial inválida |
| `/admin` | Lista de produtos: busca por nome/marca/SKU, filtro por categoria, miniatura, preço, ações |
| `/admin/produtos/novo` e `/admin/produtos/[id]` | Formulário do produto |
| `/admin/categorias` | Lista com contagem, criar, editar nome/imagem/ordem, excluir |

- Layout próprio, sem o header da loja: navegação lateral no desktop, barra no celular; "Ver loja" e "Sair". `noindex`.
- Formulário em seções: básico, preços, imagens, opções (ex.: Grip com valores), selo e destaque. Slug gerado do nome e editável. Campo de preço em formato brasileiro.
- Validação no servidor, com mensagem junto ao campo e valores preservados. Estado "Salvando..." e toast de sucesso, usando `Toast` existente. Aviso ao sair com alterações não salvas.
- Sessão expirada ao salvar: avisa e permite entrar de novo sem perder o formulário.
- Estados de lista vazia, sem resultado e erro de conexão.
- Reaproveitar `Button`, `Select`, `Checkbox` e demais componentes `cb-*`; CSS do admin em arquivo próprio.

### Fora de estoque

Decisão do usuário: produto sem estoque continua visível na loja, informando que está fora de estoque.

- O admin tem uma opção "Em estoque" no formulário e o estado aparece na lista. Não há contagem de unidades.
- Na loja, card e página do produto mostram "Fora de estoque".
- Decisão do usuário: o cliente ainda pode chamar no WhatsApp para saber quando o produto volta ou para encomendar. No lugar de "Comprar", o botão "Consultar disponibilidade" abre o WhatsApp com mensagem dizendo que o produto está fora de estoque e que o cliente quer saber quando volta ou encomendar.
- Proposta do Claude: "Adicionar à sacola" fica desabilitado nesse estado. Item já na sacola aparece marcado como fora de estoque e segue na mensagem do WhatsApp identificado assim, sem entrar no total estimado.

### Regras de exclusão e concorrência

- Excluir produto pede confirmação com o nome. Sacolas com produto removido já são tratadas pela loja.
- Categoria com produtos não pode ser excluída; a tela informa quantos produtos há nela.
- Salvar envia o `updated_at` lido. Se mudou, nada é gravado e a tela avisa que outro funcionário alterou o produto, com opção de recarregar.
- Slug duplicado vira erro no campo.

### Verificação

- Testes para validação, conversão banco/`Product`, slug, preço em formato brasileiro e conflito de edição.
- Teste real de RLS: com a chave pública e sem login, escrita é recusada no banco e no bucket; leitura funciona.
- `next build` passando e conferência visual das telas em desktop e mobile.

## Pré-requisitos do usuário

1. Criar o projeto e conectar o MCP com `storage` habilitado.
2. Colocar URL e chave pública no `.env.local`.
3. Criar as contas dos funcionários pelo painel, com senhas próprias.

## Deixado para quem implementar

Divisão entre server e client components, forma exata do cache no Next 16, organização do CSS do admin, e paginação da lista se necessária.
