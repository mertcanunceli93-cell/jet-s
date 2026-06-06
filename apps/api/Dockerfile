FROM node:20-alpine AS builder

WORKDIR /app

# Install turbo
RUN npm install -g turbo

# Copy all files
COPY . .

# Prune the workspace for api
RUN turbo prune --scope=@jetis/api --docker

# ---

FROM node:20-alpine AS installer
WORKDIR /app

# First install dependencies (all, including dev — needed for build)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json ./package-lock.json
RUN npm install

# Copy full source and build
COPY --from=builder /app/out/full/ .

# Generate Prisma client
RUN cd apps/api && npx prisma generate

# Build the API
RUN npx turbo run build --filter=@jetis/api...

# Re-install only production dependencies (no devDeps)
RUN npm install --omit=dev

# ---

# Production image — lean runner
FROM node:20-alpine AS runner
WORKDIR /app

# Only copy what's needed to run
COPY --from=installer /app/node_modules ./node_modules
COPY --from=installer /app/apps/api/dist ./apps/api/dist
COPY --from=installer /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=installer /app/apps/api/package.json ./apps/api/package.json

# Copy Prisma schema & generated client
COPY --from=installer /app/apps/api/prisma ./apps/api/prisma

# Copy shared packages if any
COPY --from=installer /app/packages ./packages

WORKDIR /app/apps/api

EXPOSE 3000

CMD ["node", "dist/index.js"]
