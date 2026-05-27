FROM node:24-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate

ARG NODE_ENV=production
RUN if [ "$NODE_ENV" = "development" ]; then npm run db:setup:developer; fi

EXPOSE 3000

CMD ["npm", "run", "dev"]
