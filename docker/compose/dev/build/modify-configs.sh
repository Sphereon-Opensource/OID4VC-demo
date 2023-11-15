#!/bin/bash

docker_compose_file="../docker-compose.yml"

# Extract DEMO_HOST_ADDRESS and otherwise default to localhost
demo_host_address=$(awk '/ssi-agent:/{flag=1; next} /environment:/{flag=2; next} flag==2 && /DEMO_HOST_ADDRESS/{split($2,a,"="); print a[2]; flag=0}' "$docker_compose_file" | tr -d '"' | tr -d ' ')
if [ -z "$demo_host_address" ]; then
    demo_host_address="localhost"
fi

# Check if demo_host_address contains 'http://' or 'https://' if not, prepend it
if [[ ! $demo_host_address =~ ^http ]]; then
    # If not, prepend 'http://'
    demo_host_address="http://${demo_host_address}"
fi

# Extract ENVIRONMENT name and default to sphereon if not found
environment_name=$(grep "REACT_APP_DEFAULT_ECOSYSTEM" ./.env.oid4vci-demo-frontend | cut -d '=' -f2)

if [ -z "$environment_name" ]; then
    environment_name="sphereon"
fi

# change the urls in vci frontend configs
config_file="../../../../packages/oid4vci-demo-frontend/src/configs/${environment_name}.json"
if [ -f "$config_file" ]; then
    new_oid4vp_agent_base_url="${demo_host_address}:5000"
    new_oid4vci_agent_base_url="${demo_host_address}:5000"

    jq --arg oid4vp "$new_oid4vp_agent_base_url" --arg oid4vci "$new_oid4vci_agent_base_url" \
       '.general.oid4vpAgentBaseUrl = $oid4vp | .general.oid4vciAgentBaseUrl = $oid4vci' \
       "$config_file" > temp.json && mv temp.json "$config_file"
else
    echo "Config file not found: ${config_file}"
fi

src_dir="../../../../packages/agent/conf/demos/${environment_name}"
current_folder="docker-$(date +%s)"
dest_dir="../../../../packages/agent/conf/dev/${current_folder}" # Using epoch time for uniqueness

# Check if the source directory exists (because we might have different names for our config here)
if [ ! -d "$src_dir" ]; then
    # If the exact match doesn't exist, find the first directory containing the environment name
    src_dir=$(find ../../../../packages/agent/conf/demos -type d -name "*${environment_name}*" | head -n 1)
fi
# Copy the found dir to destination
cp -r "$src_dir" "$dest_dir"

# modify the values in the destination folder
find "$dest_dir" -type f -name '*.json' | while read json_file; do
    jq --arg newUrl "$new_oid4vci_agent_base_url" \
       '(
         if (has("correlationId") and .correlationId) then .correlationId = $newUrl else . end
       ) |
       (
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

# change the value of CONF_PATH to our newly created directory
sed -i "s|^CONF_PATH=.*|CONF_PATH=\"/opt/ssi-agent/packages/agent/conf/${current_folder}\"|" ./.env.ssi-agent

echo "Configuration modification complete for environment: ${environment_name}"
