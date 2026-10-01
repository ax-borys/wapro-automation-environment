FROM node:26-slim AS build
RUN npm install -g pnpm
RUN pnpm self-update

WORKDIR /app

COPY . .

ENV CI=true

RUN pnpm install --frozen-lockfile --filter=@wae/api...
RUN pnpm --filter=@wae/api... build

FROM node:26-slim AS runtime
RUN npm install -g pnpm

ENV NODE_ENV=production

WORKDIR /app

COPY --from=build /app .

CMD ["pnpm", "--filter", "@wae/api", "start"]

EXPOSE 8082
