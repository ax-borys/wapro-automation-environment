FROM node:26-slim AS build
RUN npm install -g pnpm

WORKDIR /app

COPY . .

ENV CI=true

RUN pnpm install --frozen-lockfile --filter=@wae/api...
RUN pnpm --filter @wae/api... build
RUN pnpm --filter @wae/api --frozen-lockfile --prod deploy ./out

FROM node:26-slim AS runtime
RUN npm install -g pnpm

ENV NODE_ENV=production

WORKDIR /app

COPY --from=build /app/out .

CMD ["node", "dist/index.mjs"]

EXPOSE 8082
