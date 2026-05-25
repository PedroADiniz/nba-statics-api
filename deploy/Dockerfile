FROM node:22-alpine AS builder

RUN apk add --no-cache openssl sed

WORKDIR /app

COPY package.json ./
RUN npm install

COPY prisma ./prisma

ARG DATABASE_ENGINE=mysql
RUN sed -i "s/provider = \"mysql\"/provider = \"${DATABASE_ENGINE}\"/" prisma/schema.prisma && \
    if [ "${DATABASE_ENGINE}" != "mysql" ]; then \
      sed -E -i 's/ @db\.[A-Za-z]+(\([^)]*\))?//g' prisma/schema.prisma; \
    fi
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:22-alpine AS production

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
