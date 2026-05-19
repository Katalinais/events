FROM node:20-alpine
WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" pnpm prisma generate && pnpm build

EXPOSE 3001
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node dist/src/main"]
