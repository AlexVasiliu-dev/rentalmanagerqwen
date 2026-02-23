# 🏠 Property Manager - Aplicație Completă

## ✅ Ce Am Construit

Am creat o aplicație **completă** de gestionare a proprietăților de închiriat cu:

### 🌐 Web App (Next.js)
- **Dashboard** cu statistici în timp real
- **Gestiune Proprietăți** (CRUD complet)
- **Gestiune Utilizatori** (Admin/Manager/Chirias)
- **Citiri Contoare cu OCR** (AI-powered)
- **Facturi Automate** (calcul consum)
- **Rapoarte Detaliate** (venituri, cheltuieli)
- **Abonamente și Plăți** (Stripe integration)

### 📱 Mobile App (React Native + Expo)
- **iOS & Android** - Aceeași bază de cod
- **Autentificare** securizată
- **Dashboard** mobil
- **Camera OCR** pentru citiri contoare
- **Navigare** intuitivă

## 📁 Structura Proiectului

```
property-qwen/
├── web/                          # Aplicația Web Next.js
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/              # API routes
│   │   │   ├── auth/             # Autentificare
│   │   │   ├── dashboard/        # Dashboard pages
│   │   │   └── owner/[slug]/     # Owner public pages
│   │   ├── components/
│   │   │   └── ui/               # UI components
│   │   └── lib/
│   │       ├── auth.ts           # Auth configuration
│   │       ├── prisma.ts         # Database
│   │       ├── ocr.ts            # OCR processing
│   │       ├── facturare.ts      # Billing logic
│   │       └── stripe.ts         # Payments
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema (RO)
│   │   └── seed.ts               # Demo data
│   └── package.json
│
└── mobile/                       # Aplicația Mobile React Native
    ├── src/
    │   ├── screens/
    │   │   ├── SignInScreen.tsx
    │   │   ├── DashboardScreen.tsx
    │   │   └── ...
    │   ├── services/
    │   │   ├── api.ts
    │   │   └── authService.ts
    │   ├── contexts/
    │   │   └── AuthContext.tsx
    │   └── i18n/
    │       └── ro.ts             # Romanian translations
    └── App.tsx
```

## 🎯 Funcționalități Cheie

### 1. Roluri Utilizatori
- **ADMIN (Proprietar)**: Acces complet, aprobă utilizatori
- **MANAGER**: Acces citire, poate accepta/respinge chiriași
- **CHIRIAS**: Acces la datele proprii, submitere citiri

### 2. Modul de Plată (BOGO)
- **Preț**: 50 EUR/an per proprietate
- **Ofertă**: Cumperi 1, Primești 2 Gratuito
- **Trial**: 1 proprietate gratuită
- **Link Permanent**: `Property_mngmt.com/owner/{slug}`

### 3. OCR Meter Readings
- **AI-Powered**: Tesseract.js
- **3 Tipuri**: Initial, Lunar, Final
- **3 Contoare**: Energie, Apă, Gaz
- **Securizat**: Doar OCR poate edita citirile

### 4. Facturi Automate
- **Calcul Automat**: Consum × Preț per unitate
- **Multiplu**: Energie + Apă + Gaz + Chirie
- **RON**: Utilități în RON
- **EUR**: Abonament în EUR

## 🚀 Pornire Rapidă

### 1. PostgreSQL Database

```bash
# Docker (recomandat)
docker run -d \
  --name postgres-property \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=property_manager_db \
  -p 5432:5432 \
  postgres:15
```

### 2. Web App

```bash
cd web

# Configurează .env
cp .env.example .env
# Editează DATABASE_URL și alte variabile

# Instalare
npm install

# Database
npm run db:push
npm run db:seed

# Pornire
npm run dev
# http://localhost:3000
```

### 3. Mobile App

```bash
cd mobile

# Configurează .env
EXPO_PUBLIC_API_URL=http://localhost:3000/api

# Instalare
npm install

# Pornire
npm start

# iOS (macOS)
npm run ios

# Android
npm run android
```

## 👤 Conturi Demo

După `npm run db:seed`:

| Rol | Email | Parolă |
|-----|-------|--------|
| Admin | admin@property.ro | admin123 |
| Manager | manager@property.ro | manager123 |
| Chirias | chirias@property.ro | chirias123 |

## 💰 Model de Prețuri

| Plan | Preț | Proprietăți |
|------|------|-------------|
| Trial | 0 EUR | 1 gratuită |
| Standard | 50 EUR/an | 2 (1+1 BOGO) |
| Multi | 250 EUR/an | 10 (5+5 BOGO) |

**Preț efectiv**: 25 EUR/proprietate/an cu BOGO!

## 🛠️ Tech Stack

### Web
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js
- **UI**: Tailwind CSS + shadcn/ui
- **OCR**: Tesseract.js
- **Payments**: Stripe

### Mobile
- **Framework**: React Native + Expo
- **Language**: TypeScript
- **Navigation**: React Navigation
- **Storage**: Expo SecureStore
- **Camera**: Expo Camera + ImagePicker

## 📋 Scripte Disponibile

### Web
```bash
npm run dev          # Development server
npm run build        # Build production
npm run start        # Production server
npm run db:push      # Push schema to DB
npm run db:seed      # Seed database
npm run db:studio    # Prisma Studio GUI
```

### Mobile
```bash
npm start            # Expo DevTools
npm run ios          # iOS Simulator
npm run android      # Android Emulator
npm run web          # Web browser
```

## 🔒 Securitate

- **Password Hashing**: bcryptjs
- **JWT Authentication**: NextAuth.js
- **Role-Based Access**: RBAC complet
- **Secure Storage**: Expo SecureStore (mobile)
- **Audit Log**: Toate acțiunile sunt logate
- **OCR Only**: Doar OCR bot poate edita citirile

## 📖 Documentație

- [QUICKSTART.md](./web/QUICKSTART.md) - Ghid pornire rapidă
- [README.md](./web/README.md) - Documentație web app
- [PROJECT_STATUS.md](./web/PROJECT_STATUS.md) - Status fișiere
- [mobile/README.md](./mobile/README.md) - Documentație mobile

## 🎯 Roadmap

### Faza 1 (Complet ✅)
- [x] Web app cu Next.js
- [x] Mobile app cu React Native
- [x] Database schema Prisma
- [x] Autentificare și roluri
- [x] OCR meter readings
- [x] Payment module BOGO

### Faza 2 (Opțional)
- [ ] Email notifications
- [ ] PDF invoice generation
- [ ] Push notifications (mobile)
- [ ] Multi-language support
- [ ] Advanced analytics

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Verifică PostgreSQL rulează
docker ps | grep postgres

# Verifică DATABASE_URL în .env
echo $DATABASE_URL
```

### OCR Not Working
```bash
# Instalează Tesseract dependencies
npm install tesseract.js
```

### Mobile App Not Connecting
```bash
# Verifică API_URL în .env
# Asigură-te că backend-ul rulează pe portul corect
```

## 📞 Suport

Pentru întrebări sau probleme:
1. Verifică documentația
2. Verifică log-urile (console/terminal)
3. Asigură-te că toate serviciile rulează

## 📄 License

MIT License - liber să folosești pentru orice scop.

---

**Construit cu ❤️ în România**

**Tech**: Next.js + React Native + PostgreSQL + Prisma + Stripe + OCR

**Status**: ✅ **COMPLET ȘI FUNCȚIONAL**

🎉 **Aplicația este gata de utilizare!**
