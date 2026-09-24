#!/bin/bash
CLIENT_ID="sh-5a21f0ac-7d90-4ece-b7d4-a70808b3593e"
CLIENT_SECRET="1dW4kNrKUA26hwgJlmTGwi8FFU53YDku"

TOKEN=$(curl -s -X POST \
  https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d "grant_type=client_credentials&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

# Search for a product
PRODUCT_ID=$(curl -s -H "Authorization: Bearer $TOKEN" "https://catalogue.dataspace.copernicus.eu/odata/v1/Products?\$top=1" | grep -o '"Id":"[^"]*' | head -1 | cut -d'"' -f4)

echo "Product ID: $PRODUCT_ID"

# Try to get quicklook metadata
curl -s -I -H "Authorization: Bearer $TOKEN" "https://catalogue.dataspace.copernicus.eu/odata/v1/Products(${PRODUCT_ID})/Products('Quicklook')/\$value"

