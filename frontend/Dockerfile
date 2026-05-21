FROM node:20-alpine
WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

ENV INTERNAL_API_URL=http://backend:3001
RUN pnpm build

EXPOSE 3000
CMD ["pnpm", "start"]
