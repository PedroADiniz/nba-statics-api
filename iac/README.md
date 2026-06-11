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
  && pulumi config set nba-statics-api:RAILWAY_WORKSPACE_NAME "pedroadiniz" \
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

#### Servidor

| Campo                     | Descrição                                              | Exemplo (`production`)    | Exemplo (`development`)              |
|---------------------------|--------------------------------------------------------|---------------------------|--------------------------------------|
| `PORT`                    | Porta em que a API escuta.                             | `3000`                    | `3000`                               |
| `NODE_ENV`                | Ambiente Node.js.                                      | `production`              | `development`                        |
| `API_KEY`                 | Bearer token para autenticar requisições.              | `01KSNBSKDDY34C67F89CT7TJNZ` | `01KSNBSKDDY34C67F89CT7TJNZ`      |
| `CORS_ORIGINS`            | Origens CORS permitidas, separadas por vírgula.        | _(vazio)_                 | `http://localhost:3000,http://localhost:5173` |

#### Rate Limiting

| Campo                       | Descrição                                         | Exemplo               |
|-----------------------------|---------------------------------------------------|-----------------------|
| `RATE_LIMIT_WINDOW_MS`      | Janela do rate limit em milissegundos.            | `60000`               |
| `RATE_LIMIT_MAX_REQUESTS`   | Número máximo de requisições por janela.          | `30`                  |

#### NBA Stats API

| Campo                  | Descrição                                                | Exemplo                          |
|------------------------|----------------------------------------------------------|----------------------------------|
| `NBA_STATS_BASE_URL`   | URL base da API de estatísticas da NBA.                  | `https://stats.nba.com/stats`    |
| `NBA_REQUEST_DELAY_MS` | Delay entre requisições à API da NBA em milissegundos.   | `700`                            |

#### Banco de Dados (geral)

| Campo              | Descrição                                  | Exemplo (`postgresql`)                                                               | Exemplo (`mysql`)                                                            |
|--------------------|--------------------------------------------|--------------------------------------------------------------------------------------|------------------------------------------------------------------------------|
| `DATABASE_ENGINE`  | Engine ativa: `postgresql` ou `mysql`.     | `postgresql`                                                                         | `mysql`                                                                      |
| `DATABASE_URL`     | URL de conexão principal.                  | `postgresql://nba_user:nba_pass123@nba_h2h_postgresql_production:5432/nba_h2h`      | `mysql://nba_user:nba_pass123@nba_h2h_mysql_production:3306/nba_h2h`        |
| `MIGRATION_DATABASE_URL` | Shadow DB para `prisma migrate dev` (somente development). | —                                                                  | `mysql://root:root123@nba_h2h_mysql_development:3306/nba_h2h`               |

#### Banco MySQL

| Campo                        | Descrição                                      | Exemplo (`production`)            | Exemplo (`development`)              |
|------------------------------|------------------------------------------------|-----------------------------------|--------------------------------------|
| `MYSQL_DATABASE`             | Nome do banco de dados.                        | `nba_h2h`                         | `nba_h2h`                            |
| `MYSQL_HOST`                 | Hostname do container MySQL.                   | `nba_h2h_mysql_production`        | `nba_h2h_mysql_development`          |
| `MYSQL_PORT`                 | Porta exposta do MySQL.                        | `9000`                            | `9000`                               |
| `MYSQL_USER`                 | Usuário do banco.                              | `nba_user`                        | `nba_user`                           |
| `MYSQL_PASSWORD`             | Senha do usuário.                              | `nba_pass123`                     | `nba_pass123`                        |
| `MYSQL_ROOT_PASSWORD`        | Senha do root.                                 | `root123`                         | `root123`                            |
| `MYSQL_CHARACTER_SET_SERVER` | Charset do servidor.                           | `utf8mb4`                         | `utf8mb4`                            |
| `MYSQL_COLLATION_SERVER`     | Collation do servidor.                         | `utf8mb4_unicode_ci`              | `utf8mb4_unicode_ci`                 |

#### Banco PostgreSQL

| Campo                    | Descrição                                      | Exemplo (`production`)                  | Exemplo (`development`)                    |
|--------------------------|------------------------------------------------|-----------------------------------------|--------------------------------------------|
| `POSTGRES_DATABASE`      | Nome do banco de dados.                        | `nba_h2h`                               | `nba_h2h`                                  |
| `POSTGRES_HOST`          | Hostname do container PostgreSQL.              | `nba_h2h_postgresql_production`         | `nba_h2h_postgresql_development`           |
| `POSTGRES_PORT`          | Porta exposta do PostgreSQL.                   | `9000`                                  | `9000`                                     |
| `POSTGRES_USER`          | Usuário do banco.                              | `nba_user`                              | `nba_user`                                 |
| `POSTGRES_PASSWORD`      | Senha do usuário.                              | `nba_pass123`                           | `nba_pass123`                              |
| `POSTGRES_ROOT_PASSWORD` | Senha do root.                                 | `root123`                               | `root123`                                  |

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
