#!/bin/sh

# if [ -z "$JWT_REFRESH_SECRET" ]; then
#   echo "Please set the JWT_REFRESH_SECRET environment variable"
#   exit 1
# fi

mkdir -p ./public/jwk
K_VALUE=$(echo -n "EyGqyoW9imynr5d4çaK3f9" | base64)

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
