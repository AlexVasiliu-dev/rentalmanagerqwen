# 📋 COMPLETE USER CREDENTIALS LIST
**System:** RentManager Property Management
**Database:** rental_property_db (PostgreSQL)
**Date:** February 2026

---

## 🔑 DEFAULT DEMO ACCOUNTS

### SUPERADMIN (System Administrator)
```
Email:    superadmin@rentalmanager.ro
Password: SuperAdmin123!
Role:     SUPERADMIN
Access:   Full system access - all businesses, all users, all data
URL:      http://localhost:3000/ro/superadmin/dashboard
```

### DEMO OWNER (Main Admin)
```
Email:    admin@rentmanager.com
Password: admin123
Role:     ADMIN
Access:   Own business dashboard
URL:      http://localhost:3000/ro/dashboard
```

### DEMO MANAGER
```
Email:    manager@rentmanager.com
Password: manager123
Role:     MANAGER
Access:   Assigned properties only
URL:      http://localhost:3000/ro/dashboard
```

### DEMO TENANT
```
Email:    renter@rentmanager.com
Password: renter123
Role:     RENTER
Access:   Own property, lease, bills only
URL:      http://localhost:3000/ro/dashboard
```

---

## 🏢 MOCK BUSINESS OWNERS (Created for Testing)

### Business 1: Popescu Imobiliare (FREE Plan)
```
Email:       free@business.ro
Password:    Owner123!
Role:        ADMIN
Company:     Popescu Imobiliare SRL
Slug:        popescu-imobiliare
URL:         http://localhost:3000/ro/popescu-imobiliare
Properties:  1
Subscription: FREE
```

### Business 2: Ionescu Properties (50 EUR/month)
```
Email:       monthly@business.ro
Password:    Owner123!
Role:        ADMIN
Company:     Ionescu Properties SRL
Slug:        ionescu-properties
URL:         http://localhost:3000/ro/ionescu-properties
Properties:  2
Tenants:     1 (Andrei Vasile)
Subscription: 50 EUR/month (expires Nov 2026)
```

### Business 3: Georgescu Real Estate (250 EUR/year)
```
Email:       yearly@business.ro
Password:    Owner123!
Role:        ADMIN
Company:     Georgescu Real Estate SRL
Slug:        georgescu-real-estate
URL:         http://localhost:3000/ro/georgescu-real-estate
Properties:  9
Subscription: 250 EUR/year (expires in 1 year)
```

---

## 📝 OTHER OWNER ACCOUNTS

### RentGalati
```
Email:    alex@me.com
Password: (set during registration)
Role:     ADMIN
Company:  rentgalati
Slug:     rentgalati
```

### Gestiune
```
Email:    alex.vasiliu@me.com
Password: (set during registration)
Role:     ADMIN
Slug:     gestiune
```

### AprtamenteGalati
```
Email:    alin.mihai@me.com
Password: (set during registration)
Role:     ADMIN
Company:  aprtamentegalati
Slug:     aprtamentegalati
```

### GalatiRent
```
Email:    caca@bebe.com
Password: (set during registration)
Role:     ADMIN
Company:  galatirent
Slug:     galatirent
```

### SvetlanaRent
```
Email:    svetlana@icloud.com
Password: (set during registration)
Role:     ADMIN
Company:  svetlanarent
Slug:     svetlanarent
```

---

## 👥 TENANT ACCOUNTS

### Test Tenant (Andrei Vasile)
```
Email:       chirias@exemplu.ro
Password:    Tenant123!
Role:        RENTER
ID Card:     Seria AB Nr. 123456
CNP:         1990101123456
Phone:       +40 730 000 003
Property:    Strada Victoriei 25, Cluj-Napoca
Lease:       Active (2024-01-01 to 2025-12-31)
Rent:        1800 RON/month
```

### Other Tenants
```
Email:    chirias@chirie.ro
Role:     RENTER
Status:   Active

Email:    chirias@emeplu.ro
Role:     RENTER
Status:   Active

Email:    cacat@pisat.ro
Role:     RENTER
Status:   Inactive (approved: false)
```

---

## 🔧 SYSTEM ACCESS

### Database Access (PostgreSQL via Docker)
```
Host:     localhost
Port:     5432
Database: rental_property_db
User:     postgres
Password: postgres

Docker:   docker exec -it postgres-property psql -U postgres -d rental_property_db
```

### API Endpoints
```
Base URL: http://localhost:3000

Public:
  GET  /api/properties
  GET  /api/leases
  GET  /api/bills

Authenticated:
  GET    /api/auth/me
  POST   /api/users
  GET    /api/properties
  POST   /api/properties
  GET    /api/leases
  POST   /api/leases
  GET    /api/bills
  POST   /api/bills
  GET    /api/owner-profile
  PUT    /api/owner-profile

Superadmin:
  GET  /api/superadmin/stats
  GET  /api/superadmin/metrics
  GET  /api/superadmin/companies
  GET  /api/superadmin/invoices
  GET  /api/superadmin/analytics
```

---

## 📱 PWA INSTALLATION

### Tenant Installation QR
```
URL Format: http://localhost:3000/ro/[business-slug]/auth/signin?pwa-install=true&role=tenant

Example: http://localhost:3000/ro/ionescu-properties/auth/signin?pwa-install=true&role=tenant
```

### Manager Installation QR
```
URL Format: http://localhost:3000/ro/[business-slug]/auth/signin?pwa-install=true&role=manager

Example: http://localhost:3000/ro/ionescu-properties/auth/signin?pwa-install=true&role=manager
```

---

## 🌐 LANGUAGE SETTINGS

### Available Languages
- **Romanian (ro)** - Default ✅
- **English (en)** - Available via language switcher

### Language Switcher Location
- Top navigation bar (dropdown menu)
- Changes all text across the application

---

## 📊 USER STATISTICS

```
Total Users:     16
SUPERADMIN:      1
ADMIN (Owners):  9
MANAGER:         1
RENTER:          5

Active Tenants:  4
Inactive:        1

Businesses:      9
Free Plan:       1
Monthly (50€):   1
Yearly (250€):   1
```

---

## 🔐 PASSWORD PATTERNS

### Default Passwords:
- Superadmin: `SuperAdmin123!`
- Demo accounts: `[role]123` (admin123, manager123, renter123)
- Mock businesses: `Owner123!`
- Test tenant: `Tenant123!`

### Password Requirements:
- Minimum 6 characters (API validation)
- Recommended: 8+ characters
- Mix of letters and numbers recommended

---

## 📋 QUICK LOGIN LINKS

### Superadmin Dashboard
http://localhost:3000/ro/superadmin/dashboard

### Main Dashboard
http://localhost:3000/ro/dashboard

### Business Dashboards
- http://localhost:3000/ro/popescu-imobiliare/dashboard
- http://localhost:3000/ro/ionescu-properties/dashboard
- http://localhost:3000/ro/georgescu-real-estate/dashboard

### Login Page
http://localhost:3000/ro/auth/signin

---

**⚠️ SECURITY NOTE:** These are test credentials. Change all passwords before production deployment!
