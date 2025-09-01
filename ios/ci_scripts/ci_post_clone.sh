#!/bin/sh

# ci_post_clone.sh
# This script is executed after Xcode Cloud clones your repository

set -e  # Exit on any error

echo "🚀 Starting post-clone script for Xcode Cloud"

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "⚠️ Node.js not found. Xcode Cloud should have Node.js pre-installed."
    echo "📋 Available tools:"
    which npm || echo "npm not found"
    which yarn || echo "yarn not found"
fi

echo "📋 Node.js version: $(node --version)"
echo "📋 npm version: $(npm --version)"

# Check if CocoaPods is available
if ! command -v pod &> /dev/null; then
    echo "⚠️ CocoaPods not found. Installing CocoaPods..."
    sudo gem install cocoapods --no-document
fi

echo "📋 CocoaPods version: $(pod --version)"

# Verify we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Current directory: $(pwd)"
    exit 1
fi

echo "✅ Post-clone script completed successfully"
