#!/bin/bash

ecosystem_name=$1
agent_host_address=$2
if [ -z "$ecosystem_name" ] || [ -z "$agent_host_address" ]; then
    echo "Usage: ./install-configs.sh <ecosystem> <agent host address>"
    exit 1
fi

# Check if agent_host_address contains 'http://' or 'https://'
if [[ ! $agent_host_address =~ ^http ]]; then
    echo "agent host address should be an http/https URL"
    exit 1
fi

# copy & patch .env files from templates
mkdir -p ./agent
cp ../../../packages/agent/.env.example ./agent/.env.local
sed -i "s|^CONF_PATH=.*|CONF_PATH=\"/opt/oid4vc-demo/packages/agent/conf/${ecosystem_name}\"|" ./agent/.env.local
sed -i "s|^OID4VP_WEBAPP_BASE_URI=.*|OID4VP_WEBAPP_BASE_URI=${agent_host_address}|" ./agent/.env.local
sed -i "s|^OID4VP_AGENT_BASE_URI=.*|OID4VP_AGENT_BASE_URI=${agent_host_address}|" ./agent/.env.local

mkdir -p ./oid4vci-demo-frontend/conf
cp ../../../packages/oid4vci-demo-frontend/.env.example ./oid4vci-demo-frontend/.env.local
sed -i "s|^REACT_APP_DEFAULT_ECOSYSTEM=.*|REACT_APP_DEFAULT_ECOSYSTEM=$ecosystem_name|" ./oid4vci-demo-frontend/.env.local

mkdir -p ./oid4vp-demo-frontend
cp ../../../packages/oid4vp-demo-frontend/.env.example ./oid4vp-demo-frontend/.env.local
sed -i "s|^REACT_APP_BACKEND_BASE_URI=.*|REACT_APP_BACKEND_BASE_URI=${agent_host_address}|" ./oid4vp-demo-frontend/.env.local

# change the urls in vci frontend configs
cp "../../../packages/oid4vci-demo-frontend/src/configs/${ecosystem_name}.json" ./oid4vci-demo-frontend/conf
config_file="./oid4vci-demo-frontend/conf/${ecosystem_name}.json"
if [ -f "$config_file" ]; then
    new_oid4vp_agent_base_url="${agent_host_address}"
    new_oid4vci_agent_base_url="${agent_host_address}"

    jq --arg oid4vp "$new_oid4vp_agent_base_url" --arg oid4vci "$new_oid4vci_agent_base_url" \
       '.general.oid4vpAgentBaseUrl = $oid4vp | .general.oid4vciAgentBaseUrl = $oid4vci' \
       "$config_file" > temp.json && mv temp.json "$config_file"
else
    echo "Config file not found: ${config_file}"
fi

src_dir="../../../packages/agent/conf/demos/${ecosystem_name}"
dest_dir="./agent/conf" # Using epoch time for uniqueness
mkdir -p $dest_dir/${ecosystem_name}

# Check if the source directory exists (because we might have different names for our config here)
if [ ! -d "$src_dir" ]; then
    # If the exact match doesn't exist, find the first directory containing the environment name
    src_dir=$(find ../../../../packages/agent/conf/demos -type d -name "*${ecosystem_name}*" | head -n 1)
fi
# Copy the found dir to destination
cp -r "$src_dir" "$dest_dir"

# modify the values in the destination folder
find "$dest_dir" -type f -name '*.json' | while read json_file; do
    jq --arg newUrl "$new_oid4vci_agent_base_url" \
       '(
         if .metadata then .metadata.credential_issuer = $newUrl else . end
       ) |
       (
         if .metadata then .metadata.credential_endpoint = ($newUrl + "/credentials") else . end
       )' \
       "$json_file" > temp.json && mv temp.json "$json_file"
done

oid4vci_metadata_folder="${dest_dir}/oid4vci_metadata"
if [ -d "$oid4vci_metadata_folder" ]; then
    find "$oid4vci_metadata_folder" -type f -name '*.json' | while read json_file; do
        jq --arg newUrl "$new_oid4vci_agent_base_url" \
           'if .metadata then .metadata |= (.credential_issuer = $newUrl, .credential_endpoint = ($newUrl + "/credentials")) else . end' \
           "$json_file" > temp.json && mv temp.json "$json_file"
    done
fi

simplified_dest_dir=$dest_dir

# Loop to remove each occurrence of '../' from the beginning of simplified_dest_dir
while [[ $simplified_dest_dir == ../* ]]; do
    simplified_dest_dir=${simplified_dest_dir#../}
done
echo "Configuration modification complete for environment: ${ecosystem_name}. and saved to ${simplified_dest_dir}"
