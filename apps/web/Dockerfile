FROM node:26-slim AS build
RUN npm install -g pnpm

WORKDIR /app

COPY . .

ENV CI=true

RUN pnpm install --frozen-lockfile --filter=@wae/web...
RUN pnpm --filter @wae/web... build

FROM node:26-slim AS runtime
RUN npm install -g pnpm

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/public ./apps/web/public
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static

CMD ["node", "apps/web/server.js"]

EXPOSE 3000
