FROM node:26-slim AS build
RUN npm install -g pnpm

WORKDIR /app

COPY . .

ENV CI=true

RUN pnpm install --frozen-lockfile --filter=@wae/api...
RUN pnpm --filter=@wae/api... build
RUN pnpm --filter @wae/api deploy --prod /out

FROM node:26-slim AS runtime

ENV NODE_ENV=production

WORKDIR /app

COPY --from=build /out .

CMD ["npm", "start"]

EXPOSE 8082
