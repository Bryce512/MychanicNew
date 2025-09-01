#!/bin/sh

# ci_post_clone.sh
# This script is executed after Xcode Cloud clones your repository

set -e  # Exit on any error

echo "🚀 Starting post-clone script for Xcode Cloud"

# Navigate to the repository root (two levels up from ci_scripts)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "📁 Script directory: $SCRIPT_DIR"
echo "📁 Repository root: $REPO_ROOT"
echo "📁 Current working directory: $(pwd)"

cd "$REPO_ROOT"

echo "📁 Changed to repository root: $(pwd)"
echo "📋 Contents of repository root:"
ls -la

# Verify we're in the right place
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found in repository root"
    echo "📋 Current directory contents:"
    ls -la
    exit 1
fi

echo "✅ Found package.json in repository root"

# Install Node.js if not available (Xcode Cloud might not have it pre-installed)
if ! command -v node >/dev/null 2>&1; then
    echo "📦 Installing Node.js via Homebrew..."
    
    # Check if Homebrew is available
    if ! command -v brew >/dev/null 2>&1; then
        echo "📦 Installing Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
    
    # Install Node.js
    brew install node
    
    # Update PATH
    export PATH="/opt/homebrew/bin:$PATH"
fi

# Verify Node.js installation
if command -v node >/dev/null 2>&1; then
    echo "✅ Node.js version: $(node --version)"
    echo "✅ npm version: $(npm --version)"
else
    echo "❌ Failed to install Node.js"
    exit 1
fi

# Check for CocoaPods and install if needed
if command -v pod >/dev/null 2>&1; then
    echo "✅ CocoaPods already available: $(pod --version)"
else
    echo "📦 Installing CocoaPods..."
    export GEM_HOME="$HOME/.gem"
    export PATH="$GEM_HOME/bin:$PATH"
    gem install cocoapods --no-document --user-install
    
    if command -v pod >/dev/null 2>&1; then
        echo "✅ CocoaPods installed: $(pod --version)"
    else
        echo "❌ Failed to install CocoaPods"
        exit 1
    fi
fi

echo "✅ Post-clone script completed successfully"
