FROM node:20-alpine AS base
# Install necessary Alpine packages and build dependencies
RUN apk add --no-cache libc6-compat gcompat python3 make g++ && \
    wget -q -t3 'https://packages.doppler.com/public/cli/rsa.8004D9FF50437357.key' -O /etc/apk/keys/cli@doppler-8004D9FF50437357.rsa.pub && \
    echo 'https://packages.doppler.com/public/cli/alpine/any-version/main' | tee -a /etc/apk/repositories && \
    apk add doppler

# Setup pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app

# Install all dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install

# Build in the correct order: shared packages first, then apps
RUN pnpm run -r --filter="./packages/**" build

# Create production deployments for apps
RUN pnpm deploy --filter="./apps/server" --prod /prod/server

FROM base AS server
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 hono

COPY --from=build --chown=hono:nodejs /prod/server /app
USER hono

CMD ["pnpm", "run", "start"]