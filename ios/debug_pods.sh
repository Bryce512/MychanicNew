#!/bin/sh

# debug_pods.sh
# Debug script to help troubleshoot CocoaPods issues

echo "🔍 CocoaPods Debug Information"
echo "================================"

echo "📋 Environment:"
echo "  - Current directory: $(pwd)"
echo "  - CocoaPods version: $(pod --version)"
echo "  - Ruby version: $(ruby --version)"
echo "  - Gem version: $(gem --version)"

echo ""
echo "📁 Project structure:"
if [ -f "Podfile" ]; then
    echo "  ✅ Podfile found"
else
    echo "  ❌ Podfile not found"
fi

if [ -f "Podfile.lock" ]; then
    echo "  ✅ Podfile.lock found"
    echo "  📋 Podfile.lock last modified: $(stat -f "%Sm" Podfile.lock)"
else
    echo "  ⚠️ Podfile.lock not found"
fi

if [ -d "Pods" ]; then
    echo "  ✅ Pods directory found"
    echo "  📋 Pods directory contents:"
    ls -la Pods/ | head -10
    
    if [ -d "Pods/Target Support Files" ]; then
        echo "  ✅ Target Support Files found"
        echo "  📋 Target Support Files contents:"
        ls -la "Pods/Target Support Files/"
        
        if [ -d "Pods/Target Support Files/Pods-Mychanic" ]; then
            echo "  ✅ Pods-Mychanic directory found"
            echo "  📋 Pods-Mychanic contents:"
            ls -la "Pods/Target Support Files/Pods-Mychanic/"
        else
            echo "  ❌ Pods-Mychanic directory not found"
        fi
    else
        echo "  ❌ Target Support Files not found"
    fi
else
    echo "  ❌ Pods directory not found"
fi

echo ""
echo "🛠️ Recommended actions:"
echo "1. Run 'pod install --repo-update' in the ios directory"
echo "2. If that fails, try 'pod deintegrate && pod install'"
echo "3. Make sure all dependencies in Podfile are available"
