#!/bin/sh
set -e
cd /app

# extract DB params from DATABASE_URL
DB_HOST=$(echo "$DATABASE_URL" | sed -E 's/.*@([^:/]+).*/\1/')
DB_NAME=$(echo "$DATABASE_URL" | sed -E 's|.*/([^?]+).*|\1|')
DB_USER=$(echo "$DATABASE_URL" | sed -E 's|.*://([^:]+):.*|\1|')

echo "Waiting for database to be ready..."
until pg_isready -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME"; do
  echo "... still waiting for $DB_HOST/$DB_NAME ..."
  sleep 1
done

echo "Database is ready! Running migrations..."
pnpm exec prisma migrate deploy

echo "Seeding database..."
pnpm exec prisma db seed || echo "Seeding failed or already seeded, continuing..."

echo "Starting server..."
exec node dist/app.js
