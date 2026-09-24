#!/bin/bash
CLIENT_ID="sh-5a21f0ac-7d90-4ece-b7d4-a70808b3593e"
CLIENT_SECRET="1dW4kNrKUA26hwgJlmTGwi8FFU53YDku"

TOKEN=$(curl -s -X POST \
  https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d "grant_type=client_credentials&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

PRODUCT_ID="91822f33-b15c-5b60-aa39-6d9f6f5c773b"

# OData uses a very specific redirect structure.
# Sometimes passing the header twice on curl -L drops it or CDSE download API strips it. Let's explicitly hit the download API.
echo "Testing download API directly..."
curl -s -v -H "Authorization: Bearer $TOKEN" "https://download.dataspace.copernicus.eu/odata/v1/Products(${PRODUCT_ID})/Products('Quicklook')/\$value" -o image2.jpg
ls -la image2.jpg
file image2.jpg
cat image2.jpg

