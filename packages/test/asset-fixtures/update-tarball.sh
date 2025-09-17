#!/bin/bash
set -euo pipefail

if [ $# -ne 1 ]; then
  echo "Usage: $0 /path/to/repository"
  exit 1
fi

REPO_PATH=$(realpath "$1")
REPO_NAME=$(basename "$REPO_PATH")
OUTPUT_DIR="./assets/git-repositories"
OUTPUT_FILE="${OUTPUT_DIR}/${REPO_NAME}.tar.gz"

mkdir -p "$OUTPUT_DIR"


git -C "$REPO_PATH" gc --aggressive --prune=now
tar -C "$REPO_PATH" -czf "$OUTPUT_FILE" .

echo "Created tarball: $OUTPUT_FILE"
