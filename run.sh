#!/bin/bash

# Output colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Banner
echo "${GREEN}"
echo "╔════════════════════════════════════════════╗"
echo "║         DEVELOPED BY PLATHANUS             ║"
echo "║         CENTERLIGHT DEPLOYMENT             ║"
echo "╚════════════════════════════════════════════╝"
echo "${NC}"

# Load environment variables from .env
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "${RED}Error: .env file not found${NC}"
    exit 1
fi

# Current settings
ENVIRONMENT=${ENVIRONMENT:-"development"}
API_HOST=${API_HOST:-"api-dev.centerlight.com"}
COMPOSE_FILE="compose-${ENVIRONMENT}.yml"
CONTAINER_NAME="${API_HOST}"

echo "${YELLOW}Current Settings:${NC}"
echo "• Environment: ${BLUE}$ENVIRONMENT${NC}"
echo "• Host: ${BLUE}$API_HOST${NC}"
echo "• Docker Compose File: ${BLUE}$COMPOSE_FILE${NC}"
echo "• Container Name: ${BLUE}$CONTAINER_NAME${NC}"
echo

echo "\n${BLUE}Starting deployment process...${NC}"

echo "\n${YELLOW}[1/4]${NC} Generating JWK keys..."
chmod +x ./scripts/generate-jwk.sh
if ! ./scripts/generate-jwk.sh; then
    echo "${RED}Error generating JWK keys${NC}"
    exit 1
fi
echo "${GREEN}✓ JWK keys generated successfully${NC}"

echo "\n${YELLOW}[2/4]${NC} Building Docker image..."
if ! docker compose -f $COMPOSE_FILE --env-file .env build; then
    echo "${RED}Error building Docker image${NC}"
    exit 1
fi
echo "${GREEN}✓ Docker image built successfully${NC}"

echo "\n${YELLOW}[3/4]${NC} Removing previous container (if exists)..."
if [ "$(docker ps -aq -f name=^/${CONTAINER_NAME}$)" ]; then
    docker stop $CONTAINER_NAME
    docker rm $CONTAINER_NAME
fi
echo "${GREEN}✓ Previous container removed${NC}"

echo "\n${YELLOW}[4/4]${NC} Starting new container..."
if ! docker compose -f $COMPOSE_FILE --env-file .env up -d --force-recreate; then
    echo "${RED}Error starting container${NC}"
    exit 1
fi

echo "\n${GREEN}Deployment completed successfully!${NC}"
