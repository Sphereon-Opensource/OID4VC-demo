#!/bin/bash
docker build -f ./docker/Dockerfile.ssi-agent -t oid4vc-demo-agent:latest .
docker tag oid4vc-demo-agent:latest vdxcontainerregistry2022051200.azurecr.io/sphereon/oid4vc-demo-agent:latest
docker push vdxcontainerregistry2022051200.azurecr.io/sphereon/oid4vc-demo-agent:latest
