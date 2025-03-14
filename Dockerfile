FROM oven/bun:1 AS builder

WORKDIR /app
COPY . .

RUN bun install && \
    bun run build

FROM ghcr.io/static-web-server/static-web-server:2 AS prod

ENV \
    SERVER_COMPRESSION_LEVEL=fastest \
    SERVER_COMPRESSION=true \
    SERVER_EXPERIMENTAL_METRICS=true \
    SERVER_FALLBACK_PAGE=index.html \
    SERVER_HEALTH=true \
    SERVER_LOG_FORWARDED_FOR=true \
    SERVER_LOG_LEVEL=info \
    SERVER_LOG_REMOTE_ADDRESS=true \
    SERVER_PORT=8080 \
    SERVER_REDIRECT_TRAILING_SLASH=false

COPY --from=builder /app/dist /public
