# NBA Statics API

REST API para análise de dados da NBA: histórico H2H entre times, jogadores, agenda de jogos e box score por partida.

Construída com **Node.js + TypeScript** seguindo Clean Architecture, com suporte a **MySQL** e **PostgreSQL** via Prisma.

---

## Pré-requisitos

| Ferramenta | Versão mínima |
|---|---|
| [Docker](https://www.docker.com/get-started) + Docker Compose | Docker 24+ |
| **ou** [Node.js](https://nodejs.org) + [MySQL](https://dev.mysql.com/downloads/) | Node 18+ / MySQL 8+ |
| **ou** [Node.js](https://nodejs.org) + [PostgreSQL](https://www.postgresql.org/download/) | Node 18+ / PostgreSQL 17+ |

> A forma mais fácil é via Docker — sobe a API e o banco com um único comando.

---

## Opção 1 — Docker (recomendado)

### 1. Clone o repositório

```bash
git clone https://github.com/PedroADiniz/nba-statics-api.git
cd nba-statics-api
```

### 2. Suba os containers

Escolha o banco de dados e o ambiente desejados:

**Desenvolvimento — MySQL** (porta do banco: `9000`, API: `3000`)
```bash
npm run docker-up:api-mysql:developer
```

**Desenvolvimento — PostgreSQL** (porta do banco: `9001`, API: `3000`)
```bash
npm run docker-up:api-postgresql:developer
```

Os composes de desenvolvimento:
- Constroem a imagem localmente a partir do `Dockerfile` da raiz
- Leem todas as variáveis do arquivo `.env` (obrigatório antes de subir)
- Sobem o banco e a API com as credenciais definidas no `.env`
- Rodam as migrations do banco automaticamente

> **Sobre os scripts de produção**
> - `docker-up:api-mysql:production`
> - `docker-up:api-postgresql:production`
>
> Existem para reproduzir localmente o mesmo ambiente da cloud de produção:
> - Usam a imagem pré-publicada no Docker Hub (não constroem localmente)
> - Isolam o banco em uma rede interna (`db_net`), expondo apenas a API (`public_net`)
> - Leem todas as credenciais do arquivo `.env.production`
>
> São úteis para validar configurações antes de um deploy.
>
> **Não substituem o workflow de CI/CD** — o workflow é responsável por construir e publicar a imagem no Docker Hub. Use os scripts de produção para testar o ambiente; use o workflow para entregar uma nova versão.

### 3. Verifique que está rodando

```bash
curl http://localhost:3000/api/v1/health
```

Resposta esperada:
```json
{ "status": "ok" }
```
---

## Opção 2 — Rodando localmente (sem Docker)

### 1. Clone e instale as dependências

```bash
git clone https://github.com/PedroADiniz/nba-statics-api.git
cd nba-statics-api
npm install
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` definindo o banco que deseja usar:

**MySQL**
```env
DATABASE_ENGINE=mysql
DATABASE_URL="mysql://usuario:senha@localhost:3306/nba_h2h"
```

**PostgreSQL**
```env
DATABASE_ENGINE=postgresql
DATABASE_URL="postgresql://usuario:senha@localhost:5432/nba_h2h"
```

Veja a descrição completa de cada variável na seção [Variáveis de ambiente](#variáveis-de-ambiente).

### 3. Configure o banco de dados

Certifique-se de que o MySQL ou PostgreSQL está rodando e o banco `nba_h2h` foi criado. Em seguida, gere o client e rode as migrations + seed de uma vez:

```bash
npm run db:generate
npm run db:setup:developer
```

Ou, se preferir rodar cada etapa separadamente:

```bash
npm run db:migrate:developer   # aplica as migrations
npm run db:seed:developer      # popula os times da NBA
```

### 4. Inicie a API em modo desenvolvimento

```bash
npm run dev
```

A API estará disponível em `http://localhost:3000`.

---

## Variáveis de ambiente

Copie o arquivo de exemplo correspondente ao seu ambiente e ajuste os valores:

```bash
# Desenvolvimento
cp .env.example .env

# Produção
cp .env.production.example .env.production
```

> Ao usar os composes de desenvolvimento, o `.env` é lido automaticamente pelo compose. Certifique-se de que ele existe antes de executar `docker compose`.

---

### Desenvolvimento (`.env`)

**Obrigatórias**

| Variável | Descrição |
|---|---|
| `DATABASE_ENGINE` | Engine do banco: `mysql` ou `postgresql` |
| `DATABASE_URL` | Connection string para execução local (sem Docker) — sobreposta pelo compose ao usar Docker |
| `PORT` | Porta da API |
| `API_KEY` | Chave enviada no header `x-api-key` |
| `DB_NAME` | Nome do banco — interpolação da `DATABASE_URL` no compose dev |
| `DB_USER` | Usuário do banco — interpolação da `DATABASE_URL` no compose dev |
| `DB_PASSWORD` | Senha do banco — interpolação da `DATABASE_URL` no compose dev |
| `MYSQL_DATABASE` | Nome do banco MySQL (Docker Compose dev — `DATABASE_ENGINE=mysql`) |
| `MYSQL_USER` | Usuário MySQL (Docker Compose dev — `DATABASE_ENGINE=mysql`) |
| `MYSQL_PASSWORD` | Senha MySQL (Docker Compose dev — `DATABASE_ENGINE=mysql`) |
| `MYSQL_ROOT_PASSWORD` | Senha root MySQL (Docker Compose dev — `DATABASE_ENGINE=mysql`) |
| `POSTGRES_DB` | Nome do banco PostgreSQL (Docker Compose dev — `DATABASE_ENGINE=postgresql`) |
| `POSTGRES_USER` | Usuário PostgreSQL (Docker Compose dev — `DATABASE_ENGINE=postgresql`) |
| `POSTGRES_PASSWORD` | Senha PostgreSQL (Docker Compose dev — `DATABASE_ENGINE=postgresql`) |

**Opcionais**

| Variável | Padrão | Descrição |
|---|---|---|
| `NODE_ENV` | `development` | Modo de execução |
| `RATE_LIMIT_WINDOW_MS` | `60000` | Janela do rate limiter em ms |
| `RATE_LIMIT_MAX_REQUESTS` | `30` | Máx. requisições por janela |
| `NBA_STATS_BASE_URL` | `https://stats.nba.com/stats` | Base URL da NBA Stats API |
| `NBA_REQUEST_DELAY_MS` | `700` | Delay entre chamadas à NBA (ms) |
| `CORS_ORIGINS` | `http://localhost:3000,http://localhost:5173` | Origens permitidas, separadas por vírgula |
| `MYSQL_CHARACTER_SET_SERVER` | `utf8mb4` | Charset do servidor MySQL (Docker Compose dev) |
| `MYSQL_COLLATION_SERVER` | `utf8mb4_unicode_ci` | Collation do servidor MySQL (Docker Compose dev) |

---

### Produção (`.env.production`)

> `DATABASE_ENGINE` e `DATABASE_URL` devem usar o mesmo engine — ajuste os dois ao trocar de banco.

**Obrigatórias**

| Variável | Descrição |
|---|---|
| `DATABASE_ENGINE` | Engine do banco: `mysql` ou `postgresql` — deve corresponder ao compose usado |
| `DATABASE_URL` | Connection string completa do banco (ex: `postgresql://user:pass@db:5432/dbname`) |
| `PORT` | Porta da API |
| `API_KEY` | Chave enviada no header `x-api-key` |
| `MYSQL_DATABASE` | Nome do banco MySQL (Docker Compose prod — `DATABASE_ENGINE=mysql`) |
| `MYSQL_USER` | Usuário MySQL (Docker Compose prod — `DATABASE_ENGINE=mysql`) |
| `MYSQL_PASSWORD` | Senha MySQL (Docker Compose prod — `DATABASE_ENGINE=mysql`) |
| `MYSQL_ROOT_PASSWORD` | Senha root MySQL (Docker Compose prod — `DATABASE_ENGINE=mysql`) |
| `POSTGRES_DB` | Nome do banco PostgreSQL (Docker Compose prod — `DATABASE_ENGINE=postgresql`) |
| `POSTGRES_USER` | Usuário PostgreSQL (Docker Compose prod — `DATABASE_ENGINE=postgresql`) |
| `POSTGRES_PASSWORD` | Senha PostgreSQL (Docker Compose prod — `DATABASE_ENGINE=postgresql`) |

**Opcionais**

| Variável | Padrão | Descrição |
|---|---|---|
| `NODE_ENV` | `production` | Modo de execução |
| `RATE_LIMIT_WINDOW_MS` | `60000` | Janela do rate limiter em ms |
| `RATE_LIMIT_MAX_REQUESTS` | `30` | Máx. requisições por janela |
| `NBA_STATS_BASE_URL` | `https://stats.nba.com/stats` | Base URL da NBA Stats API |
| `NBA_REQUEST_DELAY_MS` | `700` | Delay entre chamadas à NBA (ms) |
| `CORS_ORIGINS` | — | Origens permitidas, separadas por vírgula |

---

## Autenticação

Todos os endpoints (exceto `/health`) exigem o header:

```
x-api-key: <valor-do-API_KEY>
```

---

## Endpoints

### Health

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/v1/health` | Status da API |

### Times

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/v1/teams` | Lista todos os times |
| `GET` | `/api/v1/teams/:id` | Dados de um time |

### H2H

| Método | Rota | Parâmetros obrigatórios | Descrição |
|---|---|---|---|
| `GET` | `/api/v1/h2h` | `team1Id`, `team2Id`, `startDate`, `endDate` | Análise H2H completa |

Parâmetros opcionais: `includeQuarters=true` para incluir médias por quarto.

Exemplo:
```
GET /api/v1/h2h?team1Id=1610612738&team2Id=1610612747&startDate=2020-01-01&endDate=2025-06-01
```

### Jogadores

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/v1/players` | Elenco de um time (`?teamId=&season=`) |
| `GET` | `/api/v1/players/stats` | Estatísticas de temporada de um time (`?teamId=&season=`) |
| `GET` | `/api/v1/players/:id` | Perfil de um jogador |
| `GET` | `/api/v1/players/:id/career` | Estatísticas de carreira |
| `GET` | `/api/v1/players/:id/gamelog` | Últimas partidas (`?season=`) |

### Agenda

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/v1/schedule` | Jogos de uma data (`?date=YYYY-MM-DD`) |
| `GET` | `/api/v1/schedule/dates` | Todas as datas com jogos na temporada |
| `GET` | `/api/v1/schedule/game/:gameId` | Box score detalhado de uma partida |

---

## Scripts disponíveis

### Aplicação

```bash
npm run dev    # Inicia em modo desenvolvimento com hot-reload
npm run build  # Compila TypeScript para dist/
npm run start  # Inicia a versão compilada (requer build antes)
```

### Banco de dados

```bash
npm run db:generate             # Gera o Prisma Client
npm run db:studio               # Abre o Prisma Studio (GUI do banco)

# Ambiente de desenvolvimento
npm run db:migrate:developer    # Aplica migrations (prisma migrate dev)
npm run db:seed:developer       # Popula os times da NBA
npm run db:setup:developer      # migrate + seed (atalho completo)

# Ambiente de produção
npm run db:migrate:production   # Aplica migrations (prisma migrate deploy)
npm run db:seed:production      # Popula os times da NBA
npm run db:setup:production     # migrate + seed (atalho completo)
```

### Docker (desenvolvimento)

> Constroem a imagem localmente a partir do `Dockerfile` da raiz. Leem credenciais do `.env` — use apenas em ambiente local.

```bash
# MySQL (banco na porta 9000, API na porta 3000)
npm run docker-up:api-mysql:developer          # Sobe os containers com MySQL
npm run docker-down:api-mysql:developer        # Derruba os containers com MySQL

# PostgreSQL (banco na porta 9001, API na porta 3000)
npm run docker-up:api-postgresql:developer     # Sobe os containers com PostgreSQL
npm run docker-down:api-postgresql:developer   # Derruba os containers com PostgreSQL
```

### Docker (produção)

```bash
# PostgreSQL
npm run docker-up:api-postgresql:production    # Sobe os containers com PostgreSQL
npm run docker-down:api-postgresql:production  # Derruba os containers com PostgreSQL

# MySQL
npm run docker-up:api-mysql:production         # Sobe os containers com MySQL
npm run docker-down:api-mysql:production       # Derruba os containers com MySQL
```

> **Importante:** os composes de produção (`docker-compose.api.*.production.yml`) **não constroem a imagem localmente**. Eles usam imagens pré-publicadas no Docker Hub:
> - PostgreSQL: `pedroadiniz/nba-statics-api-postgresql:latest`
> - MySQL: `pedroadiniz/nba-statics-api-mysql:latest`
>
> Antes de subir, certifique-se de ter o arquivo `.env.production` configurado (veja a seção [Variáveis de ambiente](#variáveis-de-ambiente)).

### Docker (deploy customizado — `deploy/`)

O diretório `deploy/` contém arquivos para quem quiser publicar a própria imagem no Docker Hub e implantá-la em qualquer servidor:

| Arquivo | Descrição |
|---|---|
| `deploy/Dockerfile` | Build multi-stage com `node:24-alpine`, otimizado para produção |
| `deploy/docker-compose.yml` | Compose genérico que consome a imagem via `DOCKER_IMAGE` |

**Build da imagem com `deploy/Dockerfile`:**

```bash
# O argumento DATABASE_ENGINE define o provider do Prisma na hora do build
# Valores aceitos: mysql (padrão) ou postgresql
docker build -f deploy/Dockerfile --build-arg DATABASE_ENGINE=postgresql -t minha-imagem:latest .
```

**Subindo com `deploy/docker-compose.yml`:**

```bash
# Defina DOCKER_IMAGE antes de subir (ou edite o arquivo)
DOCKER_IMAGE=minha-imagem:latest docker compose -f deploy/docker-compose.yml up -d
```

As variáveis de ambiente lidas por esse compose são as mesmas da seção [Produção](#produção-envproduction), acrescidas de `DOCKER_IMAGE`.

### Qualidade de código

```bash
npm run lint        # Verifica erros de lint no src/
npm run lint:fix    # Corrige erros de lint automaticamente
npm run typecheck   # Verifica erros de TypeScript sem compilar
```

---

## Estrutura do projeto

```
src/
├── domain/          # Entidades e interfaces (regras de negócio puras)
├── application/     # Use cases e DTOs
├── infrastructure/  # Repositórios, HTTP clients, serviços externos
├── presentation/    # Controllers, rotas, middlewares, validators
└── shared/          # Config, erros, logger
```

---

## Fonte de dados

Os dados são obtidos em tempo real da **NBA Stats API** (`stats.nba.com`) e do **CDN da NBA** para a agenda. Não é necessária nenhuma chave de API externa — a API imita as chamadas feitas pelo navegador no site da NBA.

> O delay de `700ms` entre chamadas existe para respeitar o rate limit do servidor da NBA.
