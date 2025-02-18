#!/bin/sh

if [ -z "$JWT_SECRET" ]; then
  echo "Please set the JWT_SECRET environment variable"
  exit 1
fi

mkdir -p ./public/jwk
K_VALUE=$(echo -n "$JWT_SECRET" | base64)

cat > ./public/jwk/symmetric.json << EOF
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
