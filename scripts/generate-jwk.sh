#!/bin/sh

mkdir -p /usr/src/app/public/jwk

K_VALUE=$(echo -n "$JWT_REFRESH_SECRET" | base64)

cat > /usr/src/app/public/jwk/symmetric.json << EOF
{
  "keys": [
    {
      "kty": "oct",
      "k": "$K_VALUE",
      "kid": "sim2",
      "alg": "HS256"
    }
  ]
}
EOF
