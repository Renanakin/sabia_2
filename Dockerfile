# Sabia Contable — Dockerfile multi-stage
# =========================================
# Stage 1: deps — solo dependencias
# Stage 2: dev — para `docker compose up` con HMR
# Stage 3: prod — para deploy real

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat curl
WORKDIR /app

# ============================================
# Stage deps — cache de dependencias
# ============================================
FROM base AS deps
COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else npm install --no-audit --no-fund; \
  fi

# ============================================
# Stage dev — para docker compose
# ============================================
FROM base AS dev
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev:equipo"]

# ============================================
# Stage prod — para deploy
# ============================================
FROM base AS prod
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
