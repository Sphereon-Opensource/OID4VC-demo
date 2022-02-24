FROM node:16-alpine3.11

COPY . .
RUN yarn global add concurrently
RUN yarn global add ts-node
RUN cd onto-demo-shared-types;yarn install;yarn build;npm pack;cd ..
RUN yarn install-all
RUN yarn build-types

ENTRYPOINT ["yarn", "start"]
