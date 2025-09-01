#!/bin/sh

# ci_post_clone_simple.sh
# Simplified version that uses pre-compiled Node.js if Homebrew is not available

set -e  # Exit on any error

echo "🚀 Starting simplified post-clone script for Xcode Cloud"

# Navigate to the repository root
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "📁 Repository root: $REPO_ROOT"
cd "$REPO_ROOT"

# Verify we're in the right place
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found in repository root"
    exit 1
fi

echo "✅ Found package.json in repository root"

# Try to install Node.js using pre-compiled binary if not available
if ! command -v node >/dev/null 2>&1; then
    echo "📦 Installing Node.js using pre-compiled binary..."
    
    # Create local node installation directory
    mkdir -p "$HOME/node"
    cd "$HOME/node"
    
    # Download and extract Node.js (adjust version as needed)
    curl -L https://nodejs.org/dist/v20.18.0/node-v20.18.0-darwin-x64.tar.gz | tar -xz --strip-components=1
    
    # Add to PATH
    export PATH="$HOME/node/bin:$PATH"
    
    # Update shell profile for future commands
    echo 'export PATH="$HOME/node/bin:$PATH"' >> ~/.bash_profile
    echo 'export PATH="$HOME/node/bin:$PATH"' >> ~/.zshrc
    
    cd "$REPO_ROOT"
fi

# Verify Node.js installation
if command -v node >/dev/null 2>&1; then
    echo "✅ Node.js version: $(node --version)"
    echo "✅ npm version: $(npm --version)"
else
    echo "❌ Failed to install Node.js"
    exit 1
fi

# Check for CocoaPods (should be pre-installed in Xcode Cloud)
if command -v pod >/dev/null 2>&1; then
    echo "✅ CocoaPods available: $(pod --version)"
else
    echo "📦 Installing CocoaPods..."
    export GEM_HOME="$HOME/.gem"
    export PATH="$GEM_HOME/bin:$PATH"
    gem install cocoapods --no-document --user-install
fi

echo "✅ Post-clone script completed successfully"
