# Base image
FROM node:20-alpine3.20 AS base
RUN apk update && apk add --no-cache libc6-compat curl
RUN corepack enable && corepack prepare pnpm@8.14.1 --activate

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm i --frozen-lockfile

# Build the source code only when needed
FROM base AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules

# Run migrations and Build TypeScript code
RUN pnpm exec prisma migrate deploy
RUN pnpm exec prisma generate --sql
RUN pnpm exec prisma db seed
RUN pnpm exec tsc

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs

# Copy built application files
COPY --from=builder /app/src/prisma ./src/prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.env ./.env

# Set the correct permissions
RUN chown -R expressjs:nodejs /app

USER expressjs

EXPOSE 3100

ENV PORT 3100

# Start the Express server
CMD ["node", "dist/app.js"]