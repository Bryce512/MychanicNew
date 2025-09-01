#!/bin/sh

# ci_pre_xcodebuild.sh
# This script is executed before Xcode Cloud runs xcodebuild

set -e  # Exit on any error

echo "🚀 Starting pre-build script for Xcode Cloud"

# Get the current directory and navigate to project root
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "📁 Script directory: $SCRIPT_DIR"
echo "📁 Project root: $PROJECT_ROOT"
echo "📁 Current working directory: $(pwd)"

# Navigate to project root (repository root)
cd "$PROJECT_ROOT"

echo "📁 Changed to project root: $(pwd)"

# Verify we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Current directory: $(pwd)"
    echo "📋 Directory contents:"
    ls -la
    exit 1
fi

# Ensure Node.js and npm are available (should be installed by post-clone script)
if ! command -v node >/dev/null 2>&1; then
    echo "❌ Error: Node.js not found. Post-clone script should have installed it."
    exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
    echo "❌ Error: npm not found. Post-clone script should have installed it."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm ci --prefer-offline --no-audit

# Install Expo CLI locally if not available globally
echo "📦 Ensuring Expo CLI is available..."
if ! command -v expo >/dev/null 2>&1; then
    echo "Installing Expo CLI locally..."
    npm install @expo/cli@latest
fi

# Use npx to run expo (works with both global and local installations)
echo "✅ Expo CLI version: $(npx expo --version)"

# Run Expo prebuild to ensure iOS project is up to date
echo "🔧 Running Expo prebuild..."
npx expo prebuild --platform ios --clear

# Navigate to iOS directory
cd ios

echo "📁 Changed to iOS directory: $(pwd)"

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
