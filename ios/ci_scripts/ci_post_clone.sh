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
    echo "📦 Installing Node.js..."
    
    # Try using Node Version Manager first (more reliable in CI)
    if ! command -v nvm >/dev/null 2>&1; then
        echo "Installing NVM..."
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    fi
    
    # Install latest LTS Node.js
    nvm install --lts
    nvm use --lts
    
    # If NVM fails, try direct download
    if ! command -v node >/dev/null 2>&1; then
        echo "NVM failed, trying direct Node.js installation..."
        mkdir -p "$HOME/node"
        cd "$HOME/node"
        curl -L https://nodejs.org/dist/v20.18.0/node-v20.18.0-darwin-x64.tar.gz | tar -xz --strip-components=1
        export PATH="$HOME/node/bin:$PATH"
        echo 'export PATH="$HOME/node/bin:$PATH"' >> ~/.bash_profile
        echo 'export PATH="$HOME/node/bin:$PATH"' >> ~/.zshrc
        cd "$REPO_ROOT"
    fi
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
