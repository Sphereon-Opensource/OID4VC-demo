# Builder stage
FROM node:lts-bookworm AS oid4vc-demo-builder
ARG PACKAGE_PATH
ARG NODE_SCRIPT
SHELL ["/bin/bash", "-c"]
RUN npm -g install pnpm && SHELL=bash pnpm setup && source /root/.bashrc && pnpm add -g pnpm
RUN pnpm add typescript tslib
WORKDIR /opt/oid4vc-demo

COPY /. .
RUN rm -rf /root/.local/share/pnpm/store
RUN pnpm install -r
ENV NODE_SCRIPT=${NODE_SCRIPT}
WORKDIR /opt/oid4vc-demo/${PACKAGE_PATH}
ENTRYPOINT pnpm ${NODE_SCRIPT}
