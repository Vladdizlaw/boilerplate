#!/bin/bash

# Build Docker images for production
# Usage: ./scripts/build-images.sh [VERSION]
# If VERSION is not set, 'latest' is used

set -e

# Resolve project root (parent of script directory)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

# Change to project root
cd "$PROJECT_ROOT"

VERSION=${1:-latest}
REGISTRY=${DOCKER_REGISTRY:-"docker.io/vladdizzlaw/"}  # e.g. docker.io/username/ or ghcr.io/username/

echo "🔨 Building Docker images version: $VERSION"
echo "📁 Working directory: $PROJECT_ROOT"

# Build image helper
build_image() {
    local service=$1
    local context=$2
    local target=$3
    local image_name="${REGISTRY%/}/undocapital-${service}:${VERSION}"
    
    echo "📦 Building image: $image_name"
    
    # If target is empty, do not use --target
    if [ -n "$target" ]; then
        docker build \
            --target "$target" \
            --tag "$image_name" \
            --tag "${REGISTRY%/}/undocapital-${service}:latest" \
            "$context"
    else
        docker build \
            --tag "$image_name" \
            --tag "${REGISTRY%/}/undocapital-${service}:latest" \
            "$context"
    fi
    
    echo "✅ Image $image_name built successfully"
}

# Build API
build_image "api" "./api" "deployment"

# Build Mailer
# build_image "mailer" "./mailer" "deployment"

# Build Nginx
build_image "nginx" "./nginx" ""

echo ""
echo "🎉 All images built successfully!"
echo ""
echo "Built images:"
docker images | grep "undocapital-" | grep -E "($VERSION|latest)" || true
echo ""
echo "To push images use: ./scripts/push-images.sh $VERSION"
