# Cebola Tennis Shop

Product catalog built with Next.js. There is no checkout: the "Comprar" button opens WhatsApp with the product or bag already described for the sales attendant.

## Running

```bash
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_WHATSAPP_NUMBER
npm run dev
```

| Command | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm test` | Unit tests |
| `npm run build` | Production build |

## Configuration

- `NEXT_PUBLIC_WHATSAPP_NUMBER`: digits only, with country code (`5511999999999`). Without it, "Comprar" stays disabled. The value is embedded at build time, so rebuild after changing it.
- `NEXT_PUBLIC_SITE_URL`: public site address, used in link previews.

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Supabase project address and public key. The app never uses a `service_role`/`secret` key; do not add one.

## Catalog data

Products and categories live in Supabase. `lib/catalog.ts` is the only module the store reads them through, and each write in the admin expires that cache, so changes appear without a rebuild.

Schema changes are versioned in `supabase/migrations/`. `data/catalog.json` is only the source of the sample data: `node scripts/generate-seed.mjs` writes `supabase/seed.sql`.

Run `npm run check:rls` after any change to the database or project settings. It confirms that the public key can read but cannot write, and that public sign-up is off.

## Admin

The admin is at `/admin`. Every account has the same permissions: create, edit and delete.

Public sign-up must stay **disabled** (Authentication > Sign In / Providers > Allow new users to sign up), because any signed-in account can change the catalog.

- **Add an employee:** Authentication > Users > Add user > Create new user, with auto-confirm on.
- **Change a password or remove access:** same screen, on the user's menu. There is no self-service password reset.

On the free plan, Supabase may pause a project after a period of inactivity. Restore it from the dashboard. The paid plan does not pause.

## Sample images

`public/sample/` holds placeholder photos and is git-ignored, so it does not reach the repository or a deploy made from it. Missing files render as a neutral plate. The folder is built from the design system zip (`assets/img/`) plus `scripts/fetch-sample-images.sh`.

Do not publish these images: they are low-resolution stand-ins, and some show third-party brands or carry attribution-only licenses.

## Replace before publishing

These come from the design kit or were invented, and are not facts about the store:

- Products, prices, brands and descriptions in the database (sample data from `data/catalog.json`)
- All product and lifestyle photos
- Testimonials and the claims in `data/home.ts`
- The consultant "Marina Alves" in `components/home/HomeSections.tsx`
- Address, phone and e-mail in `components/cb/navigation.tsx` and `components/cart/CartView.tsx`
- Installment and Pix rules in `lib/format.ts`
