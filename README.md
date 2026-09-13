# Playcinix

Catálogo de filmes e séries com identidade visual própria. Conteúdo próprio, licenciado ou de domínio público. Construído com Next.js, TypeScript, Prisma (SQLite) e NextAuth.

> Etapa 1: base visual, header responsivo, home com slider de destaque e schema completo do banco. Próximas etapas: CRUDs, integração TMDB, autenticação, comentários, etc.

## Stack

- **Next.js 16** (App Router) + **React 19**
- **TypeScript** estrito
- **Prisma ORM** + **SQLite** (banco em `prisma/dev.db`)
- **NextAuth** (autenticação — etapa 4)
- **Font Awesome** (ícones)
- **Swiper.js** (slider de destaque)

## Estrutura do projeto

```
src/
├── app/
│   ├── (public)/            # Rotas públicas (com Header/Footer)
│   │   ├── page.tsx         # Home
│   │   ├── filmes/page.tsx
│   │   ├── series/page.tsx
│   │   ├── categorias/[slug]/page.tsx
│   │   ├── busca/page.tsx
│   │   └── como-baixar/page.tsx
│   ├── admin/               # Painel administrativo (etapa 4: protegido)
│   │   ├── page.tsx         # Dashboard
│   │   ├── filmes/, series/, categorias/, comentarios/, downloads/, configuracoes/
│   ├── layout.tsx           # Layout raiz (tema + globals.css)
│   ├── sitemap.ts           # /sitemap.xml
│   └── robots.ts            # /robots.txt
├── components/
│   ├── layout/              # Header, Footer
│   ├── sections/            # HeroSlider, MediaGridSection
│   ├── media/               # MediaCard, Rating, WatchlistButton
│   └── icons/
├── generated/prisma/        # Cliente Prisma gerado
├── lib/
│   ├── prisma.ts            # Singleton do Prisma
│   └── utils.ts             # slugify, formatRuntime, buildShareUrl
├── services/
│   └── catalog.ts           # Consultas ao banco para a área pública
└── types/
    └── content.ts           # Tipos compartilhados
prisma/
├── schema.prisma            # Schema relacional completo
├── migrations/              # Migrações geradas
└── seed.ts                  # Seed com gêneros, filmes e séries de exemplo
```

## Comandos úteis

```bash
# Instalar dependências
npm install

# Sincronizar Prisma e popular o banco (idempotente)
npm run db:migrate        # criar/rodar migrations
npm run db:seed           # popular com seed

# Desenvolvimento
npm run dev               # http://localhost:3000

# Verificações
npm run typecheck         # tsc --noEmit
npm run build             # next build
```

## Identidade visual

Definida em `src/app/globals.css` via variáveis CSS:

```css
:root {
  --bg-color-1: #020916;
  --bg-color-2: #05132e;
  --main-color: #79c142;
  --text-color-1: #ffffff;
  --text-color-2: #dee2e6;
  --light-text: #cbcbcd;
  --border-color: #131831;
}
```

Fonte principal: `"Segoe UI", Tahoma, Geneva, Verdana, sans-serif`.

## Próximas etapas

1. CRUD de filmes, gêneros, importação TMDB (etapa 2)
2. CRUD de séries, temporadas e episódios (etapa 3)
3. NextAuth + proteção das rotas `/admin` (etapa 4)
4. Arquivos de download, busca, relacionados, comentários, compartilhamento (etapa 5)
5. SEO avançado, melhorias de performance e polish visual (etapa 6)
