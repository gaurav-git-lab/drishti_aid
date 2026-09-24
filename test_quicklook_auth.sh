#!/bin/bash
CLIENT_ID="sh-5a21f0ac-7d90-4ece-b7d4-a70808b3593e"
CLIENT_SECRET="1dW4kNrKUA26hwgJlmTGwi8FFU53YDku"

# We must get a token meant for the 'download' audience.
TOKEN=$(curl -s -X POST \
  https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d "grant_type=client_credentials&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

PRODUCT_ID="91822f33-b15c-5b60-aa39-6d9f6f5c773b"

# CDSE documentation states that downloading ANY data (including quicklooks) via API requires the token 
# to be negotiated differently, or passed differently if using the new Dataspace platform.
# Actually, the public thumbnail API on browser is often completely open if you have the ID.
# Let's try to just hit the browser API if it exists, or the WMS endpoint.
echo "Trying WMS..."
curl -s -I "https://sh.dataspace.copernicus.eu/ogc/wms/038eb9f3-a19b-466d-8b43-4e4c926dc27a?REQUEST=GetMap&BBOX=72.7,18.9,73.0,19.2&CRS=EPSG:4326&WIDTH=512&HEIGHT=512&LAYERS=TRUE-COLOR-S2L2A&FORMAT=image/jpeg"

