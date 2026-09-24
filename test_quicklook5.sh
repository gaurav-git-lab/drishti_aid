#!/bin/bash
# CDSE Sentinel Hub OData API actually uses the node endpoints for raw node fetching, 
# but CDSE uses a secondary OData token for direct file downloads.
# A simpler way to get the quicklook thumbnail without auth issues on CDSE is using the unauthenticated preview url if it is public, 
# but CDSE removed public previews.

# Let's try downloading via the ZIP api using standard auth but forcing no redirects.
CLIENT_ID="sh-5a21f0ac-7d90-4ece-b7d4-a70808b3593e"
CLIENT_SECRET="1dW4kNrKUA26hwgJlmTGwi8FFU53YDku"

# CDSE docs state you can pass the token using the `Authorization: Bearer <token>` header, but wait - the error was:
# {"trace-id":"3e6f141f1a552fe1dbb4ed8f53aea5a5","code":"DAT-ZIP-609","message":"Token audience not allowed"}

# This means the OAuth client credentials token from Sentinel Hub is ONLY valid for the Catalogue, not the Download API.
# The Download API requires a password grant token from keycloak.
# To render the image safely on the UI, we should just use a placeholder icon OR render the S3 presigned URL if possible.
