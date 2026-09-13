# Deploy no Coolify — Playcinix (https://playcinix.com)

Configurações prontas para subir a aplicação no Coolify usando **Dockerfile** (recomendado) ou **Docker Compose**.

## Visão geral

- **App**: Next.js 16 (App Router) + Prisma + SQLite + NextAuth
- **Domínio**: https://playcinix.com
- **Banco**: SQLite com volume persistente (1 contêiner, sem réplicas)
- **Autenticação**: NextAuth v5 com `AUTH_SECRET` + `NEXTAUTH_URL`

## Opção A — Application + Dockerfile (recomendado)

No painel do Coolify:

1. **Projects → New Resource → Application**
2. **Source**: repositório Git (GitHub/GitLab/Gitea) com este projeto
3. **Build Pack**: `Dockerfile`
4. **Dockerfile Location**: `./Dockerfile`
5. **Port**: `3000`
6. **Domains**: `playcinix.com` (e `www.playcinix.com` se quiser)
7. Marque **Force HTTPS** após o primeiro deploy

### Variáveis de ambiente (Settings → Environment Variables)

```
DATABASE_URL=file:/data/playcinix.db
AUTH_SECRET=<cole aqui um secret forte>
AUTH_TRUST_HOST=true
NEXTAUTH_URL=https://playcinix.com
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
```

**Gere o `AUTH_SECRET` antes do primeiro deploy:**

```bash
openssl rand -base64 32
```

Cole o output no campo `AUTH_SECRET` do Coolify.

### Volume persistente (obrigatório para SQLite)

Em **Storage → Persistent Volumes**:

| Container Path | Size |
|---|---|
| `/data` | 1 GB (sobra bastante para o SQLite) |

Sem esse volume o banco é recriado a cada rebuild.

### Health Check

Setado automaticamente pelo `Dockerfile`. Endpoint: `GET /`.

### Comando de start do container

Já definido no `Dockerfile`:
```
npx prisma migrate deploy && npm start
```
Isso garante que as migrations rodem a cada deploy antes de subir o app.

## Opção B — Docker Compose

1. **New Resource → Docker Compose**
2. **Source**: mesmo repositório
3. **Docker Compose Location**: `./docker-compose.yml`
4. Crie um arquivo `.env` no servidor do Coolify (ou use o painel de Environment) com:

```
AUTH_SECRET=<openssl rand -base64 32>
NEXTAUTH_URL=https://playcinix.com
```

O `docker-compose.yml` já define `DATABASE_URL`, bind-mount do volume `sqlite-data` em `/data` e healthcheck.

## Próximos passos após o primeiro deploy

1. **Criar usuário admin** — o seed cria gêneros/exemplos, mas **não cria usuário admin**. Rode uma vez no terminal do Coolify:
   ```
   node -e "const{PrismaClient}=require('@prisma/client');const bcrypt=require('bcryptjs');const p=new PrismaClient();p.user.create({data:{email:'admin@playcinix.com',name:'Admin',role:'ADMIN',passwordHash:bcrypt.hashSync('TROQUE-ESTA-SENHA',10)}}).then(()=>console.log('ok')).finally(()=>p.\$disconnect())"
   ```
   Troque o e-mail e a senha. Logue em `/login`.

2. **Rodar seed** (opcional, idempotente — popula gêneros e itens de exemplo):
   ```
   npx prisma db seed
   ```

3. **Domínio e DNS** — aponte `playcinix.com` (registro A ou CNAME) para o IP do servidor Coolify. Ative HTTPS no painel do Coolify (Let's Encrypt automático).

4. **Backup do SQLite** — agende um snapshot do volume `/data`. Exemplo simples via cron no host:
   ```
   0 3 * * * cp /var/lib/docker/volumes/<projeto>_sqlite-data/_data/playcinix.db /backups/playcinix-$(date +\%F).db
   ```

## Avisos operacionais

- **Não escale horizontalmente (múltiplos contêineres)** sem antes trocar o provider do Prisma de `sqlite` para `postgresql` — SQLite não suporta lock concorrente entre réplicas. O Coolify já oferece Postgres nativo, é só trocar `DATABASE_URL` no deploy.
- **`output: 'standalone'`** — opcional; reduziria a imagem drasticamente. Para ativar, edite `next.config.ts` adicionando `output: 'standalone'`, ajuste o `Dockerfile` (copiar `.next/standalone` + `.next/static`) e rebuilde.
- **`AUTH_TRUST_HOST=true`** é necessário porque o Coolify faz proxy reverso; sem isso o NextAuth rejeita callbacks em domínios "estranhos".
