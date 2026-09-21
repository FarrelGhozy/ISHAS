# ISHAS web — multi-stage: development (bun run dev) dan production (nginx statis).
# Dipakai dari docker-compose.yml root dengan `target: development|production`.

ARG BUN_IMAGE_TAG=1
ARG NODE_IMAGE_TAG=22-slim
ARG NGINX_IMAGE_TAG=alpine

FROM oven/bun:${BUN_IMAGE_TAG} AS development
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
EXPOSE 3003
CMD ["bun", "run", "dev"]

# Build memakai Node: `react-router build` memerlukan kondisi ekspor Node
# (`renderToPipeableStream` pada react-dom/server), bukan varian Bun.
# Bun dipasang dari npm agar `bun.lock` tetap menjadi sumber kebenaran dependensi.
FROM node:${NODE_IMAGE_TAG} AS builder
ARG BUN_IMAGE_TAG=1
RUN npm install -g bun@${BUN_IMAGE_TAG}
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN npm run build

FROM nginx:${NGINX_IMAGE_TAG} AS production
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build/client /usr/share/nginx/html
EXPOSE 80
