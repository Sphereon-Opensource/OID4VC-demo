FROM node:16-alpine
RUN apk add --no-cache bash
SHELL ["/bin/bash", "-c"]
RUN npm -g install pnpm && SHELL=bash pnpm setup && source /root/.bashrc && pnpm add -g pnpm@latest
RUN pnpm add typescript tslib

COPY . .
RUN pnpm install
RUN pnpm build

ENTRYPOINT ["pnpm", "start"]
