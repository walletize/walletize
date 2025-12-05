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

# Generate Prisma Client and Build TypeScript code
RUN pnpm exec prisma generate
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

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Install postgresql-client for pg_isready
RUN apk add --no-cache postgresql-client

# Set the correct permissions
RUN chown -R expressjs:nodejs /app

USER expressjs

EXPOSE 3100

ENV PORT 3100

# Use entrypoint script to run migrations before starting server
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]