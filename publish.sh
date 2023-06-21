#!/bin/bash
docker build -t siopv2-openid4vp-example:latest .
docker tag siopv2-openid4vp-example:latest vdxcontainerregistry2022051200.azurecr.io/sphereon/siopv2-openid4vp-example:latest
docker push vdxcontainerregistry2022051200.azurecr.io/sphereon/siopv2-openid4vp-example:latest
