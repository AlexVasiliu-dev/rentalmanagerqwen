# 📱 Property Manager - Mobile App (React Native)

Aplicație mobilă pentru iOS și Android pentru gestionarea proprietăților de închiriat.

## 🚀 Pornire Rapidă

### Cerințe
- Node.js 18+
- Expo CLI
- iOS Simulator (macOS) sau Android Emulator

### Instalare

```bash
cd mobile

# Instalează dependențele
npm install

# Pornește Expo
npm start

# Rulează pe iOS (necesită macOS)
npm run ios

# Rulează pe Android
npm run android

# Rulează pe Web
npm run web
```

## 📱 Funcționalități

### Autentificare
- Login cu email/parolă
- Înregistrare utilizatori noi
- Persistare sesiune

### Dashboard
- Statistici proprietăți
- Rezumat contracte
- Facturi neplatite

### Citiri Contoare (OCR)
- Fotografiază contorul
- Citire automată cu AI
- Submitere citiri (Initial/Lunar/Final)

### Proprietăți
- Listă proprietăți
- Detalii proprietate
- Imagini

### Facturi
- Istoric facturi
- Status plată
- Detalii consum

## 🎨 Structură Proiect

```
mobile/
├── src/
│   ├── screens/
│   │   ├── SignInScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── PropertiesScreen.tsx
│   │   ├── MeterReadingsScreen.tsx
│   │   └── BillsScreen.tsx
│   ├── components/
│   │   ├── PropertyCard.tsx
│   │   ├── MeterReadingForm.tsx
│   │   └── BillItem.tsx
│   ├── services/
│   │   ├── api.ts
│   │   └── authService.ts
│   ├── contexts/
│   │   └── AuthContext.tsx
│   └── i18n/
│       └── ro.ts (translations)
├── App.tsx
└── package.json
```

## 🔧 Configurare

### Variabile de Mediu

Creează `.env` în rădăcina mobile:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

### Conectare la Backend

1. Pornește backend-ul Next.js: `npm run dev` în `/web`
2. Actualizează `EXPO_PUBLIC_API_URL` în `.env`
3. Actualizează serviciile API în `src/services/api.ts`

## 📲 Build pentru Production

### iOS

```bash
# Build cu Expo
eas build --platform ios

# Sau build local
npm run ios --configuration Release
```

### Android

```bash
# Build cu Expo
eas build --platform android

# Sau APK local
npm run android --variant=release
```

## 🎯 Features Specifice Mobile

### Camera OCR
```typescript
import { Camera } from 'expo-camera';
import { ImagePicker } from 'expo-image-picker';

// Fotografie contor
const pickImage = async () => {
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    cameraType: 'back',
  });
  
  if (!result.canceled) {
    // Procesează imaginea cu OCR
    await processMeterImage(result.assets[0].uri);
  }
};
```

### Secure Storage
```typescript
import * as SecureStore from 'expo-secure-store';

// Salvare token
await SecureStore.setItemAsync('token', token);

// Citire token
const token = await SecureStore.getItemAsync('token');
```

## 🇷🇴 Traduceri

Toate textele sunt în română în `src/i18n/ro.ts`.

Pentru a adăuga limbi noi:
1. Creează `src/i18n/en.ts`
2. Adaugă key-urile necesare
3. Implementează selector de limbă

## 📱 Screenshots

### Ecrane Principale
1. **Autentificare**: Login/Register
2. **Dashboard**: Statistici și navigare
3. **Proprietăți**: Listă și detalii
4. **Citiri Contoare**: Camera OCR
5. **Facturi**: Istoric și plată

## 🔗 Link-uri Utile

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Camera](https://docs.expo.dev/versions/latest/sdk/camera/)
- [Expo Image Picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/)

## 🐛 Debugging

```bash
# Expo DevTools
npx expo start --dev-tools

# Remote Debugging
Activați "Debug Remote JS" din meniul Expo
```

## 📞 Suport

Pentru probleme:
1. Verifică conexiunea la backend
2. Asigură-te că emulatorul are acces la network
3. Verifică log-urile Expo

---

**Construit cu Expo & React Native** ❤️
