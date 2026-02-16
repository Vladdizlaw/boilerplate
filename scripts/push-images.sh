#!/bin/bash

# Push Docker images to registry
# Usage: ./scripts/push-images.sh [VERSION]
# If VERSION is not set, 'latest' is used
#
# Registry login required:
# docker login [REGISTRY_URL]
# or
# echo $DOCKER_PASSWORD | docker login [REGISTRY_URL] -u $DOCKER_USERNAME --password-stdin

set -e

# Resolve project root (parent of script directory)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

# Change to project root
cd "$PROJECT_ROOT"

VERSION=${1:-latest}
REGISTRY=${DOCKER_REGISTRY:-"docker.io/vladdizzlaw/"}  # e.g. docker.io/username/ or ghcr.io/username/

if [ -z "$REGISTRY" ]; then
    echo "⚠️  Warning: DOCKER_REGISTRY is not set. Images will be pushed locally."
    echo "   To push to a registry, set the environment variable:"
    echo "   export DOCKER_REGISTRY='docker.io/username/'"
    echo "   or"
    echo "   export DOCKER_REGISTRY='ghcr.io/username/'"
    echo ""
    read -p "Continue without pushing to registry? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "📤 Pushing Docker images version: $VERSION"

# Push image helper
push_image() {
    local service=$1
    local image_name="${REGISTRY%/}/undocapital-${service}:${VERSION}"
    local image_latest="${REGISTRY%/}/undocapital-${service}:latest"
    
    if [ -z "$REGISTRY" ]; then
        echo "⏭️  Skipping push for $service (no registry)"
        return
    fi
    
    echo "📤 Pushing image: $image_name"
    docker push "$image_name"
    
    if [ "$VERSION" != "latest" ]; then
        echo "📤 Pushing tag latest: $image_latest"
        docker push "$image_latest"
    fi
    
    echo "✅ Image $image_name pushed successfully"
}

# Push API
push_image "api"

# Push Mailer
# push_image "mailer"

# Push Nginx
push_image "nginx"

echo ""
echo "🎉 All images pushed successfully!"
echo ""
echo "To use in production, update docker-compose.yml:"
echo "  image: ${REGISTRY%/}/undocapital-api:${VERSION}"
# echo "  image: ${REGISTRY%/}/undocapital-mailer:${VERSION}"
echo "  image: ${REGISTRY%/}/undocapital-nginx:${VERSION}"
