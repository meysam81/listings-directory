FROM oven/bun:1 AS builder

WORKDIR /app
COPY . .

RUN bun install && \
    bun run build

FROM ghcr.io/static-web-server/static-web-server:2 AS runner

ENV SERVER_PORT=8080 \
    SERVER_ERROR_PAGE_404=public/404.html \
    SERVER_FALLBACK_PAGE=index.html \
    SERVER_COMPRESSION_LEVEL=fastest \
    SERVER_LOG_REMOTE_ADDRESS=true
    SERVER_HEALTH=true

COPY --from=builder /app/dist /public
