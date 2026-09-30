# ISHAS web — multi-stage: development (bun run dev) dan production (nginx statis).
# Dipakai dari docker-compose.yml root dengan `target: development|production`.
# Semua ARG diteruskan dari `.env` via `build.args` di docker-compose.yml.

ARG BUN_IMAGE_TAG=1
ARG NODE_IMAGE_TAG=22-slim
ARG NGINX_IMAGE_TAG=alpine
ARG WEB_DEV_CONTAINER_PORT=3003
ARG WEB_PROD_CONTAINER_PORT=80

FROM oven/bun:${BUN_IMAGE_TAG} AS development
ARG WEB_DEV_CONTAINER_PORT=3003
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
EXPOSE ${WEB_DEV_CONTAINER_PORT}
CMD ["bun", "run", "dev"]

# Build memakai Node: `react-router build` memerlukan kondisi ekspor Node
# (`renderToPipeableStream` pada react-dom/server), bukan varian Bun.
# Bun dipasang dari npm agar `bun.lock` tetap menjadi sumber kebenaran dependensi.
FROM node:${NODE_IMAGE_TAG} AS builder
ARG BUN_IMAGE_TAG=1
# `.env` root tidak ikut build context `apps/web`, jadi variabel Vite harus
# diteruskan sebagai build arg (docker-compose.yml) agar tertanam saat build.
ARG VITE_USE_BACKEND=false
ARG VITE_API_BASE=/api/v1
ENV VITE_USE_BACKEND=${VITE_USE_BACKEND}
ENV VITE_API_BASE=${VITE_API_BASE}
RUN npm install -g bun@${BUN_IMAGE_TAG}
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN npm run build

FROM nginx:${NGINX_IMAGE_TAG} AS production
ARG WEB_PROD_CONTAINER_PORT=80
# Substitusi port nginx dari ARG. Image nginx resmi menjalankan envsubst pada
# `/etc/nginx/templates/*.template` menuju `/etc/nginx/conf.d/` saat start,
# sehingga placeholder `${WEB_PROD_CONTAINER_PORT}` diganti nilai dari `.env`.
ENV WEB_PROD_CONTAINER_PORT=${WEB_PROD_CONTAINER_PORT}
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=builder /app/build/client /usr/share/nginx/html
EXPOSE ${WEB_PROD_CONTAINER_PORT}
