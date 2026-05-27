FROM node:24-alpine

RUN apk add --no-cache openssl sed

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG DATABASE_ENGINE=mysql
RUN sed -i "s/provider = \"mysql\"/provider = \"${DATABASE_ENGINE}\"/" prisma/schema.prisma && \
    if [ "${DATABASE_ENGINE}" = "postgresql" ]; then \
      sed -i 's/@db\.LongText/__KEEP_DB_TEXT__/g' prisma/schema.prisma && \
      sed -E -i 's/ @db\.[A-Za-z]+(\([^)]*\))?//g' prisma/schema.prisma && \
      sed -i 's/__KEEP_DB_TEXT__/@db.Text/g' prisma/schema.prisma; \
    fi

RUN npx prisma generate

ARG NODE_ENV=production
RUN if [ "$NODE_ENV" = "development" ]; then npm run db:setup:developer; fi

EXPOSE 3000

CMD ["npm", "run", "dev"]
