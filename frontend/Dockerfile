FROM node:20-bookworm-slim

WORKDIR /app
RUN corepack enable

# Install system dependencies for Tailwind CSS
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
      build-essential python3 && \
    rm -rf /var/lib/apt/lists/*

COPY package.json pnpm-lock.yaml ./
RUN corepack use pnpm@latest && \
    pnpm install --frozen-lockfile

COPY . .

CMD ["pnpm", "dev", "--port", "3000", "--hostname", "0.0.0.0"]
