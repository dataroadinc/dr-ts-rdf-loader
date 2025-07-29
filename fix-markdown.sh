#!/usr/bin/env bash

# Fix markdown files
echo "Fixing markdown files..."

# Run markdownlint with --fix
pnpm lint:md:fix

# Run prettier on markdown files
pnpm format

echo "Markdown files fixed!"
