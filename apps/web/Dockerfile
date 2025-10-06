FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./ || true
COPY pnpm-lock.yaml* ./ || true
RUN npm ci || true || echo "skip npm ci"
RUN npm install -g pnpm && pnpm i || true
COPY . .
RUN npm run build || pnpm build
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
EXPOSE 4321
CMD ["node", "./dist/server/entry.mjs"]
