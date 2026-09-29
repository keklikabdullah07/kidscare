FROM node:20-alpine AS base

# Install openssl and libc6-compat for Prisma engine on Alpine
RUN apk add --no-cache openssl libc6-compat

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

# Copy monorepo workspace configuration, tsconfig and packages
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Generate Prisma Client
RUN pnpm --filter @kidscare/database prisma generate

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

# Ensure DB roles, run migrations, optional initial seed, and start the NestJS API
CMD ["sh", "-c", "pnpm --filter @kidscare/database db:ensure-roles && pnpm --filter @kidscare/database prisma migrate deploy && (pnpm --filter @kidscare/database prisma db seed || true) && pnpm --filter @kidscare/api start"]
