# Infrastructure as Code — Pulumi

Este diretório contém o código de infraestrutura do projeto **NBA Statics API** usando [Pulumi](https://www.pulumi.com/). Atualmente o único provedor suportado é o **Railway**.

## Pré-requisitos

- [Node.js](https://nodejs.org/) >= 18
- [Pulumi CLI](https://www.pulumi.com/docs/install/) instalado e autenticado
- Acesso ao [Railway](https://railway.app/) com um token válido

## Instalação

```bash
cd iac
npm install
```

## Stacks disponíveis

| Stack       | Arquivo de config           | Uso                        |
|-------------|-----------------------------|----------------------------|
| `developer` | `Pulumi.developer.yaml`     | Ambiente local/dev         |
| `production`| `Pulumi.production.yaml`    | Ambiente de produção       |

Para selecionar uma stack:

```bash
pulumi stack select developer
# ou
pulumi stack select production
```

## Configuração

Todas as variáveis são lidas pelo Pulumi via `pulumi config`. O stack precisa ser configurado antes do primeiro `pulumi up`.

### Configuração completa (Railway + PostgreSQL)

Execute os comandos abaixo substituindo os valores pelos seus:

```bash
# Token de autenticação do Railway (armazenado como secret)
pulumi config set --secret nba-statics-api:RAILWAY_TOKEN "<seu-token>"

# Informações do workspace e projeto no Railway
pulumi config set nba-statics-api:RAILWAY_WORKSPACE_NAME "<nome-do-workspace>"
pulumi config set nba-statics-api:RAILWAY_PROJECT_NAME "<nome-do-projeto>"
pulumi config set nba-statics-api:RAILWAY_DROPLET_NAME "<nome-do-servico>"
pulumi config set nba-statics-api:RAILWAY_ENVIRONMENT_NAME "production"

# Imagem Docker a ser deployada
pulumi config set nba-statics-api:RAILWAY_DOCKER_IMAGE_NAME "<usuario-docker>/<nome-da-imagem>"

# Variáveis de ambiente do serviço (armazenadas como secret, em JSON)
pulumi config set --secret nba-statics-api:RAILWAY_VARIABLE \
  '{"DATABASE_ENGINE":"postgresql","DATABASE_URL":"<url-do-banco>","API_KEY":"<chave>","CORS_ORIGINS":"https://seu-dominio.com","PORT":"3000","NODE_ENV":"production","RATE_LIMIT_WINDOW_MS":"60000","RATE_LIMIT_MAX_REQUESTS":"30","NBA_STATS_BASE_URL":"https://stats.nba.com/stats","NBA_REQUEST_DELAY_MS":"700"}'
```

### Exemplo com valores reais (ambiente de produção)

```bash
pulumi config set --secret nba-statics-api:RAILWAY_TOKEN "06d50b4e-c504-4f26-bae2-d745560452d5" \
  && pulumi config set nba-statics-api:RAILWAY_WORKSPACE_NAME "tghpereira" \
  && pulumi config set nba-statics-api:RAILWAY_PROJECT_NAME "NBA Statics Project" \
  && pulumi config set nba-statics-api:RAILWAY_DROPLET_NAME "NBA Statics Api" \
  && pulumi config set nba-statics-api:RAILWAY_ENVIRONMENT_NAME "production" \
  && pulumi config set nba-statics-api:RAILWAY_DOCKER_IMAGE_NAME "tghbr/nba-statics-api-postgresql"

pulumi config set --secret nba-statics-api:RAILWAY_VARIABLE \
  '{"DATABASE_ENGINE":"postgresql","DATABASE_URL":"postgresql://nba_user:<senha>@<host>/nba_h2h","API_KEY":"<chave>","CORS_ORIGINS":"https://seu-dominio.com","PORT":"3000","NODE_ENV":"production","RATE_LIMIT_WINDOW_MS":"60000","RATE_LIMIT_MAX_REQUESTS":"30","NBA_STATS_BASE_URL":"https://stats.nba.com/stats","NBA_REQUEST_DELAY_MS":"700"}'
```

> **Atenção:** nunca commite tokens ou senhas reais no repositório. Os valores acima são apenas exemplos de formato.

## Variáveis de configuração

| Variável                     | Secret | Descrição                                                   |
|------------------------------|--------|-------------------------------------------------------------|
| `Provider`                   | Não    | Provedor de infraestrutura. Atualmente só `railway`.        |
| `RAILWAY_TOKEN`              | **Sim**| Token de autenticação da API do Railway.                    |
| `RAILWAY_WORKSPACE_NAME`     | Não    | Nome do workspace no Railway.                               |
| `RAILWAY_PROJECT_NAME`       | Não    | Nome do projeto no Railway.                                 |
| `RAILWAY_DROPLET_NAME`       | Não    | Nome do serviço/droplet dentro do projeto.                  |
| `RAILWAY_ENVIRONMENT_NAME`   | Não    | Nome do ambiente no Railway (ex: `production`).             |
| `RAILWAY_DOCKER_IMAGE_NAME`  | Não    | Imagem Docker no formato `usuario/nome-da-imagem`.          |
| `RAILWAY_VARIABLE`           | **Sim**| JSON com as variáveis de ambiente injetadas no serviço.     |

### Campos de `RAILWAY_VARIABLE`

| Campo                   | Descrição                                              |
|-------------------------|--------------------------------------------------------|
| `DATABASE_ENGINE`       | Engine do banco: `postgresql` ou `mysql`.              |
| `DATABASE_URL`          | URL de conexão completa do banco de dados.             |
| `API_KEY`               | Chave de autenticação da API.                          |
| `CORS_ORIGINS`          | Origens permitidas pelo CORS.                          |
| `PORT`                  | Porta em que a API escuta (padrão: `3000`).            |
| `NODE_ENV`              | Ambiente Node.js (`production`, `development`).        |
| `RATE_LIMIT_WINDOW_MS`  | Janela do rate limit em milissegundos.                 |
| `RATE_LIMIT_MAX_REQUESTS` | Número máximo de requisições por janela.             |
| `NBA_STATS_BASE_URL`    | URL base da API de estatísticas da NBA.                |
| `NBA_REQUEST_DELAY_MS`  | Delay entre requisições à API da NBA em milissegundos. |

## Deploy

```bash
# Visualizar o plano de mudanças sem aplicar
pulumi preview

# Aplicar a infraestrutura
pulumi up

# Destruir toda a infraestrutura provisionada
pulumi destroy
```

## Estrutura do código

```
iac/
├── index.ts          # Entry point — lê a config e instancia o provedor
├── railway/
│   └── index.ts      # Provedor dinâmico do Railway (Pulumi dynamic resource)
├── Pulumi.yaml       # Metadados do projeto Pulumi
├── Pulumi.developer.yaml  # Config do stack developer (gerado por pulumi config set)
└── package.json
```
