# BASE
FROM node:lts-alpine AS base

WORKDIR /app

COPY package*.json ./

# DEPENDENCIES
FROM base AS dependencies

RUN apk add --no-cache libc6-compat

RUN npm ci --omit=dev

# BUILDER
FROM base AS builder

RUN npm ci

COPY . .

RUN npm run build

# RELEASE
FROM base AS release

RUN apk add --no-cache bash tini

# COPY --from=dependencies /app/node_modules     ./node_modules
COPY --from=builder      /app/public           ./public
COPY --from=builder      /app/.next/standalone ./
COPY --from=builder      /app/.next/static     ./.next/static

EXPOSE 3000

ENV NODE_ENV=production

ENTRYPOINT [ "/sbin/tini", "--", "node", "server.js" ]
