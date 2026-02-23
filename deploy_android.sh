#!/bin/bash

# ============================================================================
# Deploy Android - Property Manager Mobile App
# ============================================================================
# This script builds and deploys the React Native Android APK for testing
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
APK_OUTPUT_DIR="$PROJECT_ROOT/apk_output"

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Property Manager - Android Deployment Script         ║${NC}"
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
    
    # Check Java (for Android builds)
    if ! command -v java &> /dev/null; then
        print_error "Java is not installed. Please install JDK 11 or higher."
        exit 1
    fi
    print_success "Java installed: $(java -version 2>&1 | head -1)"
    
    # Check Android SDK (optional, for local builds)
    if command -v adb &> /dev/null; then
        print_success "Android SDK available"
        
        # Check for connected devices
        if adb devices | grep -q "device$"; then
            DEVICE_COUNT=$(adb devices | grep "device$" | wc -l)
            print_success "$DEVICE_COUNT Android device(s) connected"
        else
            print_status "No Android devices connected. Will build APK for manual install."
        fi
    else
        print_status "Android SDK not found. Will use Expo for building."
    fi
    
    # Check if Expo CLI is installed
    if ! command -v expo &> /dev/null; then
        print_status "Installing Expo CLI..."
        npm install -g expo-cli
    fi
    print_success "Expo CLI installed"
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
    if [[ "$OSTYPE" == "darwin"* ]]; then
        LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || echo "localhost")
    else
        LOCAL_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "localhost")
    fi
    
    if [ ! -f ".env" ]; then
        cat > .env << EOF
EXPO_PUBLIC_API_URL=http://${LOCAL_IP}:3000/api
EXPO_PUBLIC_APP_NAME=Property Manager
EXPO_PUBLIC_VERSION=1.0.0
EOF
        print_success "Created .env file with IP: $LOCAL_IP"
    else
        # Update API_URL with current IP
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|EXPO_PUBLIC_API_URL=.*|EXPO_PUBLIC_API_URL=http://${LOCAL_IP}:3000/api|g" .env
        else
            sed -i "s|EXPO_PUBLIC_API_URL=.*|EXPO_PUBLIC_API_URL=http://${LOCAL_IP}:3000/api|g" .env
        fi
        print_success "Updated .env with IP: $LOCAL_IP"
    fi
}

# Create output directory
setup_output_dir() {
    print_status "Setting up APK output directory..."
    
    mkdir -p "$APK_OUTPUT_DIR"
    print_success "APK output directory: $APK_OUTPUT_DIR"
}

# Build Android APK
build_apk() {
    print_status "Building Android APK..."
    
    cd "$MOBILE_DIR"
    
    echo ""
    echo "Select build type:"
    echo "1) APK via Expo (Recommended, cloud build)"
    echo "2) APK via Android Studio (Local build, requires Android SDK)"
    echo "3) Development APK (Debug, smaller size)"
    echo "4) Deploy over network (Expo Go, fastest for testing)"
    echo ""
    read -p "Choose option (1-4): " build_option
    
    case $build_option in
        1)
            print_status "Building APK with Expo (cloud build)..."
            print_status "This will take 10-15 minutes..."
            
            # Check if EAS CLI is installed
            if ! command -v eas &> /dev/null; then
                print_status "Installing EAS CLI..."
                npm install -g eas-cli
            fi
            
            # Initialize EAS if not already done
            if [ ! -f "eas.json" ]; then
                eas init
            fi
            
            # Build APK
            eas build:android --profile preview --output "$APK_OUTPUT_DIR/property-manager.apk"
            
            print_success "APK built successfully!"
            print_success "APK location: $APK_OUTPUT_DIR/property-manager.apk"
            
            # Show file info
            if [ -f "$APK_OUTPUT_DIR/property-manager.apk" ]; then
                echo ""
                echo "APK Details:"
                ls -lh "$APK_OUTPUT_DIR/property-manager.apk"
                echo ""
            fi
            ;;
            
        2)
            print_status "Building APK locally with Android Studio..."
            
            # Check for Android SDK
            if ! command -v adb &> /dev/null; then
                print_error "Android SDK not found. Please install Android Studio."
                exit 1
            fi
            
            # Generate native project
            npx expo prebuild --platform android --clean
            
            # Build with Gradle
            cd android
            ./gradlew assembleRelease
            
            # Copy APK to output directory
            cd ..
            find android/app/build/outputs/apk -name "*.apk" -type f -exec cp {} "$APK_OUTPUT_DIR/" \;
            
            print_success "APK built successfully!"
            print_success "APK location: $APK_OUTPUT_DIR/"
            ;;
            
        3)
            print_status "Building debug APK..."
            
            # Generate native project
            npx expo prebuild --platform android --clean
            
            # Build debug APK
            cd android
            ./gradlew assembleDebug
            
            # Copy APK to output directory
            cd ..
            find android/app/build/outputs/apk -name "*debug*.apk" -type f -exec cp {} "$APK_OUTPUT_DIR/property-manager-debug.apk" \;
            
            print_success "Debug APK built!"
            print_success "APK location: $APK_OUTPUT_DIR/property-manager-debug.apk"
            
            # Install on connected device if available
            if adb devices | grep -q "device$"; then
                print_status "Installing on connected device..."
                adb install -r "$APK_OUTPUT_DIR/property-manager-debug.apk"
                print_success "Installed on device!"
            fi
            ;;
            
        4)
            print_status "Starting Expo development server for network testing..."
            deploy_network
            return
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
    if [[ "$OSTYPE" == "darwin"* ]]; then
        LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || echo "localhost")
    else
        LOCAL_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "localhost")
    fi
    PORT="8081"
    
    # Create QR code for easy scanning
    QR_DATA="exp://${LOCAL_IP}:${PORT}"
    
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║     Android App Available Over Network                 ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Network Information:"
    echo "  Local IP:  $LOCAL_IP"
    echo "  Port:      $PORT"
    echo ""
    echo "Access URLs:"
    echo "  - Metro Bundler: http://$LOCAL_IP:$PORT"
    echo "  - Direct APK:    exp://${LOCAL_IP}:${PORT}"
    echo ""
    echo "To test on Android device:"
    echo ""
    echo "  Method 1: Expo Go (Recommended)"
    echo "    1. Install 'Expo Go' from Google Play Store"
    echo "    2. Connect to same WiFi network"
    echo "    3. Scan QR code or enter: $QR_DATA"
    echo ""
    echo "  Method 2: Direct APK Install"
    echo "    1. Build APK with option 1 or 2"
    echo "    2. Transfer APK to device"
    echo "    3. Install APK (enable 'Install from Unknown Sources')"
    echo ""
    echo "  Method 3: ADB Install (USB)"
    echo "    1. Connect device via USB"
    echo "    2. Enable USB debugging"
    echo "    3. Run: adb install path/to/apk"
    echo ""
    echo "Starting Metro bundler..."
    echo "Press Ctrl+C to stop"
    echo ""
    
    # Start Metro bundler
    npx expo start --lan
}

# Show APK info
show_apk_info() {
    if [ -d "$APK_OUTPUT_DIR" ] && [ "$(ls -A $APK_OUTPUT_DIR 2>/dev/null)" ]; then
        echo ""
        echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║            Available APK Files                         ║${NC}"
        echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
        echo ""
        ls -lh "$APK_OUTPUT_DIR"/*.apk 2>/dev/null || echo "No APK files found"
        echo ""
        
        # Show how to install
        echo "To install on Android device:"
        echo ""
        echo "  Option 1: USB Transfer"
        echo "    1. Copy APK to device"
        echo "    2. Open file manager and tap APK"
        echo "    3. Allow 'Install from Unknown Sources'"
        echo "    4. Tap Install"
        echo ""
        echo "  Option 2: ADB (USB Debugging)"
        echo "    adb install $APK_OUTPUT_DIR/property-manager.apk"
        echo ""
        echo "  Option 3: Network Share"
        echo "    1. Share APK over local network"
        echo "    2. Download on device"
        echo "    3. Install"
        echo ""
    fi
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
    setup_output_dir
    echo ""
    
    build_apk
    echo ""
    show_apk_info
    
    echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║           Deployment Complete!                         ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Next Steps:"
    echo "  1. Transfer APK to Android device"
    echo "  2. Install and test the app"
    echo "  3. Report any issues"
    echo ""
    echo "Output Directory: $APK_OUTPUT_DIR"
    echo ""
}

# Run main function
main
