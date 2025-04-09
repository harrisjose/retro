FROM node:22-alpine AS base
# Install necessary Alpine packages and build dependencies
RUN apk add --no-cache libc6-compat gcompat python3 make g++ bash && \
    ln -sf /bin/bash /usr/bin/bash && \
    wget -q -t3 'https://packages.doppler.com/public/cli/rsa.8004D9FF50437357.key' -O /etc/apk/keys/cli@doppler-8004D9FF50437357.rsa.pub && \
    echo 'https://packages.doppler.com/public/cli/alpine/any-version/main' | tee -a /etc/apk/repositories && \
    apk add doppler

# Setup pnpm and pm2
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g corepack pm2
RUN corepack enable && corepack prepare pnpm --activate

FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app

# Install all dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install

# Build in the correct order: shared packages first, then apps
RUN pnpm run -r --filter="./packages/**" build
# RUN pnpm run -r --filter="./apps/server" build

# Create production deployment with only runtime dependencies
WORKDIR /usr/src/app
RUN pnpm deploy --filter="./apps/server" --prod /prod/server

FROM base AS server
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 hono

# Copy the production dependencies and compiled code
COPY --from=build /prod/server /app
# COPY --from=build /usr/src/app/apps/server/dist /app/dist

# Fix permissions for the hono user
RUN chown -R hono:nodejs /app

USER hono

CMD ["pm2-runtime", "ecosystem.prod.config.cjs"]