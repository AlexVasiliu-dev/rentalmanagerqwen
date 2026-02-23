#!/bin/bash

# ============================================================================
# Deploy iOS - Property Manager Mobile App
# ============================================================================
# This script builds and deploys the React Native iOS app for testing
# over local network IP address
# ============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MOBILE_DIR="$PROJECT_ROOT/mobile"

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    Property Manager - iOS Deployment Script            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Print status
print_status() {
    echo -e "${YELLOW}►${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if running on macOS
    if [[ "$OSTYPE" != "darwin"* ]]; then
        print_error "iOS deployment requires macOS. Consider using Expo Go for other platforms."
        echo ""
        echo "Alternative: Run Expo development server for testing with Expo Go app"
        echo "Command: cd mobile && npm start"
        exit 1
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    print_success "Node.js installed: $(node -v)"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    # Check if Expo CLI is installed
    if ! command -v expo &> /dev/null; then
        print_status "Installing Expo CLI..."
        npm install -g expo-cli
    fi
    print_success "Expo CLI installed"
    
    # Check Xcode (for iOS builds)
    if ! command -v xcodebuild &> /dev/null; then
        print_error "Xcode is not installed. Please install from App Store."
        exit 1
    fi
    print_success "Xcode installed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing mobile dependencies..."
    
    cd "$MOBILE_DIR"
    
    npm install
    print_success "Dependencies installed"
}

# Setup environment
setup_environment() {
    print_status "Setting up environment..."
    
    cd "$MOBILE_DIR"
    
    # Get local IP address
    LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || echo "localhost")
    
    if [ ! -f ".env" ]; then
        cat > .env << EOF
EXPO_PUBLIC_API_URL=http://${LOCAL_IP}:3000/api
EXPO_PUBLIC_APP_NAME=Property Manager
EXPO_PUBLIC_VERSION=1.0.0
EOF
        print_success "Created .env file with IP: $LOCAL_IP"
    else
        # Update API_URL with current IP
        sed -i '' "s|EXPO_PUBLIC_API_URL=.*|EXPO_PUBLIC_API_URL=http://${LOCAL_IP}:3000/api|g" .env
        print_success "Updated .env with IP: $LOCAL_IP"
    fi
}

# Configure Expo
configure_expo() {
    print_status "Configuring Expo for network deployment..."
    
    cd "$MOBILE_DIR"
    
    # Check if app.json exists
    if [ ! -f "app.json" ]; then
        print_error "app.json not found. Creating default configuration..."
        cat > app.json << EOF
{
  "expo": {
    "name": "Property Manager",
    "slug": "property-manager",
    "version": "1.0.0",
    "orientation": "portrait",
    "scheme": "propertymanager",
    "platforms": ["ios", "android", "web"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.propertymanager.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/icon.png",
        "backgroundColor": "#2563eb"
      },
      "package": "com.propertymanager.app"
    },
    "web": {
      "bundler": "metro"
    }
  }
}
EOF
    fi
    
    print_success "Expo configured"
}

# Build iOS app
build_ios() {
    print_status "Building iOS app..."
    
    cd "$MOBILE_DIR"
    
    # Option 1: Build for simulator (faster, for testing)
    echo ""
    echo "Select build type:"
    echo "1) iOS Simulator (Fast, for testing)"
    echo "2) iOS Archive (Slow, for distribution)"
    echo "3) Expo Go (Fastest, requires Expo app on device)"
    echo ""
    read -p "Choose option (1-3): " build_option
    
    case $build_option in
        1)
            print_status "Building for iOS Simulator..."
            
            # Get available simulators
            print_status "Getting available simulators..."
            xcrun simctl list devices available | grep -E "iPhone|iPad" | head -10
            
            read -p "Enter simulator name (e.g., 'iPhone 15'): " simulator_name
            
            # Build and run
            npx expo run:ios --device "$simulator_name"
            print_success "iOS app built and running on simulator"
            ;;
            
        2)
            print_status "Building iOS archive for distribution..."
            print_status "This will take several minutes..."
            
            # Build with EAS (Expo Application Services)
            if ! command -v eas &> /dev/null; then
                print_status "Installing EAS CLI..."
                npm install -g eas-cli
            fi
            
            eas build:ios --profile preview
            print_success "iOS build complete. Check email for download link."
            ;;
            
        3)
            print_status "Starting Expo development server..."
            print_status "Scan QR code with Expo Go app on your iPhone"
            echo ""
            
            # Start Expo in tunnel mode for external access
            npx expo start --tunnel
            ;;
            
        *)
            print_error "Invalid option"
            exit 1
            ;;
    esac
}

# Deploy over network
deploy_network() {
    print_status "Setting up network deployment..."
    
    cd "$MOBILE_DIR"
    
    # Get local IP
    LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || hostname -I | awk '{print $1}')
    PORT="8081"
    
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║        iOS App Available Over Network                  ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Local IP:  $LOCAL_IP"
    echo "Port:      $PORT"
    echo ""
    echo "Access URLs:"
    echo "  - Metro Bundler: http://$LOCAL_IP:$PORT"
    echo "  - Expo DevTools: http://$LOCAL_IP:8082"
    echo ""
    echo "To test on iPhone:"
    echo "1. Install 'Expo Go' from App Store"
    echo "2. Connect to same WiFi network"
    echo "3. Scan QR code or enter: exp://${LOCAL_IP}:${PORT}"
    echo ""
    echo "Press Ctrl+C to stop"
    echo ""
    
    # Start Metro bundler
    npx expo start --lan
}

# Main execution
main() {
    echo ""
    check_prerequisites
    echo ""
    install_dependencies
    echo ""
    setup_environment
    echo ""
    configure_expo
    echo ""
    
    echo "Select deployment mode:"
    echo "1) Build and run on Simulator"
    echo "2) Deploy over network (test on physical device)"
    echo "3) Build for App Store distribution"
    echo ""
    read -p "Choose option (1-3): " deploy_mode
    
    case $deploy_mode in
        1)
            build_ios
            ;;
        2)
            deploy_network
            ;;
        3)
            print_status "Building for distribution..."
            build_ios
            ;;
        *)
            print_error "Invalid option"
            exit 1
            ;;
    esac
}

# Run main function
main
