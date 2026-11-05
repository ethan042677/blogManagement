FROM node:24-bookworm-slim AS build

WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN npm install --global pnpm@11.1.1

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
ARG VITE_API_BASE_URL=/
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN pnpm build

FROM nginx:1.28-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
