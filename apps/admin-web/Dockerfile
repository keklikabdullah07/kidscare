# Stage 1: Build React/Vite admin panel
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

# Copy monorepo workspace configuration, tsconfig and packages
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY packages/ ./packages/
COPY apps/admin-web/ ./apps/admin-web/

# Build argument for backend API URL
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Install dependencies and build
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @kidscare/admin-web build

# Stage 2: Serve with lightweight Nginx
FROM nginx:alpine AS runner

COPY --from=builder /app/apps/admin-web/dist /usr/share/nginx/html
COPY apps/admin-web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
