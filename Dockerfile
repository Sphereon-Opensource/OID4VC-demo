FROM node:16-alpine
RUN apk add --no-cache bash
SHELL ["/bin/bash", "-c"]
RUN npm -g install pnpm && SHELL=bash pnpm setup && source /root/.bashrc && pnpm add -g pnpm
RUN npm -g install sqlite3 --save
RUN pnpm add typescript tslib
WORKDIR /usr/src/app

COPY . .
RUN pnpm install
RUN pnpm workspace agent add sqlite3
RUN rm -rf node_modules/.pnpm/did-jwt@7.2.2
RUN rm -rf packages/agent/node_modules/.pnpm/did-jwt@7.2.2
RUN pnpm build
WORKDIR /usr/src/app/packages/agent
ENTRYPOINT ["pnpm", "start:prod"]
