FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./ || true
COPY pnpm-lock.yaml* ./ || true
RUN npm ci || true || echo "skip npm ci"
RUN npm install -g pnpm && pnpm i || true
COPY . .
RUN npx prisma generate || true
RUN npm run build || pnpm build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["npx","next","start","-p","3000"]
