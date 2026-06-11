FROM node:24-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG DATABASE_ENGINE=mysql
RUN npx prisma generate --schema prisma/schema.${DATABASE_ENGINE}.prisma

RUN chmod +x entrypoint.sh

EXPOSE ${PORT}

ENTRYPOINT ["./entrypoint.sh"]
