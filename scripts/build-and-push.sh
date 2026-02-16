#!/bin/bash

# Build and push Docker images
# Usage: ./scripts/build-and-push.sh [VERSION]

set -e

# Resolve project root (parent of script directory)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

cd "$PROJECT_ROOT"

VERSION=${1:-latest}

echo "🚀 Building and pushing Docker images version: $VERSION"
echo ""

# Build images
"$SCRIPT_DIR/build-images.sh" "$VERSION"

echo ""
echo "---"
echo ""

# Push images
"$SCRIPT_DIR/push-images.sh" "$VERSION"
