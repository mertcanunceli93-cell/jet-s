FROM node:20-alpine AS builder

WORKDIR /app

# Install turbo
RUN npm install -g turbo

# Copy all files
COPY . .

# Prune the workspace for web
RUN turbo prune --scope=@jetis/web --docker

# ---

FROM node:20-alpine AS installer
WORKDIR /app

# First install dependencies
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json ./package-lock.json
RUN npm install

# Copy full source
COPY --from=builder /app/out/full/ .

# Accept build-time env vars so Vite can bake them into the bundle
ARG VITE_API_URL=http://localhost:3000
ARG VITE_SOCKET_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL

# Build the project
RUN npx turbo run build --filter=@jetis/web...

# ---

# Production image using Nginx
FROM nginx:alpine AS runner

# Copy Nginx config
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files
COPY --from=installer /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
