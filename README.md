# NBA Statics API

REST API para análise de dados da NBA: histórico H2H entre times, jogadores, agenda de jogos e box score por partida.

Construída com **Node.js + TypeScript** seguindo Clean Architecture, com cache em MySQL via Prisma.

---

## Pré-requisitos

| Ferramenta | Versão mínima |
|---|---|
| [Docker](https://www.docker.com/get-started) + Docker Compose | Docker 24+ |
| **ou** [Node.js](https://nodejs.org) + [MySQL 8](https://dev.mysql.com/downloads/) | Node 18+ |

> A forma mais fácil é via Docker — sobe a API e o banco com um único comando.

---

## Opção 1 — Docker (recomendado)

### 1. Clone o repositório

```bash
git clone https://github.com/PedroADiniz/nba-statics-api.git
cd nba-statics-api
```

### 2. Suba os containers

```bash
docker compose up -d
```

Isso irá:
- Subir um container MySQL 8 na porta `9000`
- Buildar e subir a API na porta `3000`
- Rodar as migrations do banco automaticamente

### 3. Verifique que está rodando

```bash
curl http://localhost:3000/api/v1/health
```

Resposta esperada:
```json
{ "status": "ok" }
```

### Parar os containers

```bash
docker compose down
```

Para remover os dados do banco também:

```bash
docker compose down -v
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

Copie o arquivo de exemplo e edite:

```bash
cp .env.example .env
```

Abra o `.env` e preencha:

```env
# URL de conexão com o MySQL (ajuste usuário, senha e host conforme seu banco)
DATABASE_URL="mysql://nba_user:nba_pass123@localhost:3306/nba_h2h"

# Porta onde a API vai rodar
PORT=3000
NODE_ENV=development

# Chave usada no header "x-api-key" para autenticar as requisições
API_KEY=troque-por-um-valor-secreto

# Rate limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=30

# NBA Stats API
NBA_STATS_BASE_URL=https://stats.nba.com/stats
NBA_REQUEST_DELAY_MS=700

# Origens permitidas no CORS (separe por vírgula)
CORS_ORIGINS=http://localhost:3001
```

### 3. Configure o banco de dados

Certifique-se de que o MySQL está rodando e o banco `nba_h2h` foi criado. Em seguida, rode as migrations:

```bash
npm run db:generate
npm run db:migrate
```

Popule os times da NBA no banco:

```bash
npm run db:seed
```

### 4. Inicie a API em modo desenvolvimento

```bash
npm run dev
```

A API estará disponível em `http://localhost:3000`.

---

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `DATABASE_URL` | ✅ | Connection string do MySQL |
| `PORT` | ✅ | Porta da API (padrão: `3000`) |
| `API_KEY` | ✅ | Chave enviada no header `x-api-key` |
| `NODE_ENV` | — | `development` ou `production` |
| `RATE_LIMIT_WINDOW_MS` | — | Janela do rate limiter em ms (padrão: `60000`) |
| `RATE_LIMIT_MAX_REQUESTS` | — | Máx. requisições por janela (padrão: `30`) |
| `NBA_STATS_BASE_URL` | — | Base URL da NBA Stats API |
| `NBA_REQUEST_DELAY_MS` | — | Delay entre chamadas à NBA (padrão: `700`) |
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

```bash
npm run dev          # Inicia em modo desenvolvimento com hot-reload
npm run build        # Compila TypeScript para dist/
npm run start        # Inicia a versão compilada
npm run db:generate  # Gera o Prisma Client
npm run db:migrate   # Roda as migrations
npm run db:seed      # Popula os times da NBA
npm run db:studio    # Abre o Prisma Studio (GUI do banco)
npm run typecheck    # Verifica erros de TypeScript
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
