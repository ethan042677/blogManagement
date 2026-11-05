FROM node:24-bookworm-slim

WORKDIR /app
ENV NODE_ENV=production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN npm install --global pnpm@11.1.1

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --prod --frozen-lockfile

COPY . .
RUN mkdir -p /app/public/files && chown -R node:node /app

USER node
EXPOSE 3000

CMD ["node", "app.js"]
