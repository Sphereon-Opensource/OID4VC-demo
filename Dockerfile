FROM node:16-alpine3.11

COPY . .
RUN yarn global add concurrently
RUN yarn global add ts-node
RUN yarn install-all
RUN yarn build-types

ENTRYPOINT ["yarn", "start"]
