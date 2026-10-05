ARG NODE_VERSION=24.19.0-slim

FROM node:${NODE_VERSION} AS deps

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/package.json
COPY apps/api/package.json apps/api/package.json
COPY packages/api-types/package.json packages/api-types/package.json
COPY packages/error/package.json packages/error/package.json
COPY packages/offer/package.json packages/offer/package.json
COPY packages/receipt/package.json packages/receipt/package.json
COPY packages/types/package.json packages/types/package.json
COPY packages/core/package.json packages/core/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/integrations/wapro/package.json packages/integrations/wapro/package.json

RUN  --mount=type=cache,target=/root/.local/share/pnpm/store \
    corepack enable pnpm && corepack use pnpm@12.9.1 && pnpm install --frozen-lockfile


FROM node:${NODE_VERSION} AS builder

WORKDIR /app

COPY --from=deps /app ./

COPY . .

ENV NODE_ENV=production

RUN corepack enable pnpm && corepack use pnpm@12.9.1 && pnpm --filter @wae/web... build

FROM node:${NODE_VERSION} AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder --chown=node:node /app/apps/web/.next/standalone ./
COPY --from=builder --chown=node:node /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=node:node /app/apps/web/.next/static ./apps/web/.next/static

USER node

EXPOSE 3000

CMD ["node", "apps/web/server.js"]
