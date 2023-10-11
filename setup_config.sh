#!/bin/bash

environment_name=$(grep "REACT_APP_ENVIRONMENT" packages/oid4vci-demo-frontend/.env | cut -d '=' -f2)

src="packages/agent/conf/docker"
dest="packages/agent/conf/dev/${environment_name}"
cp -r "$src" "$dest"

ip_address=$(ifconfig | grep -Eo 'inet 192\.168\.[0-9]{1,3}\.[0-9]{1,3}' | grep -Eo '192\.168\.[0-9]{1,3}\.[0-9]{1,3}')

find "$dest" -type f -exec sed -i -E "s|http(s)?://192\.168\.[0-9]{1,3}\.[0-9]{1,3}(:[0-9]+)?/[^/]+\$|http\1://${ip_address}|g" {} \;
find "$dest" -type f -exec sed -i -E "s|http(s)?://192\.168\.[0-9]{1,3}\.[0-9]{1,3}(:[0-9]+)?/[^/]+/|http\1://${ip_address}/|g" {} \;

find "$dest" -type f | while read file; do
    dir=$(dirname "$file")
    mv "$file" "$dir/${environment_name}.json"
done

sed -i "s|^CONF_PATH=.*|CONF_PATH=\"./conf/dev/${environment_name}\"|" packages/agent/.env

echo "Configuration setup complete for environment: ${environment_name}"
