# RentManager Mobile App

React Native mobile application for RentManager - available for both iOS and Android.

## Features

- **Bilingual Support**: Romanian (RO) and English (EN)
- **Authentication**: Login and Register
- **Property Management**: View properties and details
- **Bills**: View and manage bills
- **Meter Readings**: Submit meter readings with photos
- **Profile Management**: User profile and settings

## Project Structure

```
mobile/
├── App.tsx                 # Main app entry point
├── app.json               # Expo configuration
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
├── babel.config.js        # Babel config
├── assets/                # Images and icons
└── src/
    ├── contexts/          # React contexts (Auth, Language)
    ├── screens/           # App screens
    ├── components/        # Reusable components
    ├── services/          # API services
    └── types/             # TypeScript types
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- For iOS: Xcode (macOS only)
- For Android: Android Studio

### Installation

```bash
cd mobile
npm install
```

### Running the App

```bash
# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

### Building for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Build for iOS
npm run build:ios

# Build for Android
npm run build:android
```

## Configuration

Update the API URL in `src/contexts/AuthContext.tsx`:

```typescript
const API_URL = 'YOUR_PRODUCTION_API_URL';
```

## Language Support

The app supports two languages:
- Romanian (default)
- English

Language can be changed from the Profile/Language settings screen.

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation
- **State Management**: React Context
- **Storage**: Expo SecureStore
- **HTTP Client**: Axios
- **Language**: TypeScript
