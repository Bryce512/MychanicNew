#!/bin/sh

# ci_pre_xcodebuild.sh
# This script is executed before Xcode Cloud runs xcodebuild

set -e  # Exit on any error

echo "🚀 Starting pre-build script for Xcode Cloud"

# Get the current directory and navigate to project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

echo "📁 Script directory: $SCRIPT_DIR"
echo "📁 Project root: $PROJECT_ROOT"

cd "$PROJECT_ROOT"

# Verify we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Current directory: $(pwd)"
    exit 1
fi

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm ci

# Navigate to iOS directory
cd ios

# Verify Podfile exists
if [ ! -f "Podfile" ]; then
    echo "❌ Error: Podfile not found in ios directory"
    exit 1
fi

# Clean any existing pod installation
echo "🧹 Cleaning existing CocoaPods installation..."
rm -rf Pods
rm -f Podfile.lock

# Install CocoaPods dependencies
echo "🍎 Installing CocoaPods dependencies..."
pod install --repo-update

# Verify that the required xcconfig files were generated
if [ ! -f "Pods/Target Support Files/Pods-Mychanic/Pods-Mychanic.release.xcconfig" ]; then
    echo "❌ Error: CocoaPods xcconfig files not generated properly"
    echo "📋 Listing Pods directory contents:"
    ls -la Pods/Target\ Support\ Files/ || echo "Target Support Files directory not found"
    exit 1
fi

echo "✅ Pre-build script completed successfully"
echo "📋 Generated files:"
ls -la "Pods/Target Support Files/Pods-Mychanic/" || echo "Pods-Mychanic directory not found"
