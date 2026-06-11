#!/bin/sh
set -e

if [ "$NODE_ENV" = "development" ]; then
  npm run db:setup:development:${DATABASE_ENGINE}
else
  npm run db:setup:production:${DATABASE_ENGINE}
fi

exec npm run dev
