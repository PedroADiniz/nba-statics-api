FROM node:24-alpine AS builder

RUN apk add --no-cache openssl sed

WORKDIR /app

COPY package.json ./
RUN npm install

COPY prisma ./prisma

ARG DATABASE_ENGINE=mysql
RUN npx prisma generate --schema prisma/schema.${DATABASE_ENGINE}.prisma

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:24-alpine AS production

RUN apk add --no-cache openssl

WORKDIR /app
RUN chown node:node /app

USER node

COPY --chown=node:node package.json ./
RUN npm install --omit=dev

COPY --chown=node:node prisma ./prisma

COPY --chown=node:node --from=builder /app/node_modules/.prisma ./node_modules/.prisma

COPY --chown=node:node --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/server.js"]
