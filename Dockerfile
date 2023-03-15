FROM node:16-alpine3.11

COPY . .
RUN npm -g install pnpm
RUN pnpm install
RUN pnpm build

ENTRYPOINT ["pnpm", "start"]
