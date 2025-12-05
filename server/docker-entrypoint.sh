#!/bin/sh
set -e

cd /app

echo "Waiting for database to be ready..."
until pg_isready -h db -U postgres -d walletize; do
  echo "Database is unavailable - sleeping"
  sleep 1
done

echo "Database is ready! Running migrations..."
pnpm exec prisma migrate deploy

echo "Seeding database..."
pnpm exec prisma db seed || echo "Seeding failed or already seeded, continuing..."

echo "Starting server..."
exec node dist/app.js

