#!/bin/bash
docker build --no-cache -f ./docker/Dockerfile.oid4vci-demo-frontend -t oid4vci-demo-frontend:latest .
docker tag oid4vci-demo-frontend:latest vdxcontainerregistry2022051200.azurecr.io/sphereon/oid4vci-demo-frontend:latest
docker push vdxcontainerregistry2022051200.azurecr.io/sphereon/oid4vci-demo-frontend:latest
