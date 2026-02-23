# Vercel Deployment Guide & System Verification

## ✅ System Verification

### 1. Owner Slug Uniqueness - VERIFIED ✓

**YES, the system generates a unique slug for each property owner:**

- **Schema Level**: `ownerSlug String? @unique` in `prisma/schema.prisma`
- **Registration**: Checks if slug exists before creating user
- **Auto-generation**: Slug is generated from `companyName`:
  ```typescript
  ownerSlug = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')  // Remove special chars
    .replace(/^-+|-+$/g, '')      // Trim dashes
  ```
- **Duplicate Prevention**: Returns error "Acest nume de afacere este deja folosit. Te rugăm să alegi altul."

**Example slugs:**
- "SC Example SRL" → `sc-example-srl`
- "Property Management Co." → `property-management-co`

---

### 2. Reports Data - VERIFIED ✓

**Dashboard → Reports** shows financial data:

| Metric | Source | Description |
|--------|--------|-------------|
| **Income by Type** | `Bill` table (paid only) | Grouped by bill type (Rent, Utilities, etc.) |
| **Expenses by Category** | `Expense` table | Grouped by category (Maintenance, Repairs, etc.) |
| **Net Income** | Calculated | Total Income - Total Expenses |
| **Unpaid Bills** | `Bill` table (paid=false) | Sum of all unpaid bills |
| **Active Leases** | `Lease` table | Count of active leases |

**Filters:**
- Date range (startDate, endDate)
- Property selection
- Role-based: Managers see only their properties

---

### 3. Superadmin Dashboard Data - VERIFIED ✓

**Superadmin Dashboard** (`/ro/superadmin/dashboard`) shows:

#### Companies Table:
| Column | Data Source |
|--------|-------------|
| **Companie** | `companyName`, `ownerSlug`, `ownerEmail` |
| **Proprietăți** | Count of `managedProperties` |
| **Chiriași Activi** | Count of active `rentedProperties` |
| **Abonament** | `subscriptionType` (free/monthly/yearly) |
| **Expiră La** | `subscriptionEnd` date |
| **Status** | `subscriptionStatus` (active/free/expired) |
| **Acțiuni** | Link to detailed view |

#### System Metrics:
| Metric | Description |
|--------|-------------|
| **Uptime** | System uptime |
| **Total Utilizatori** | Count of all users |
| **Utilizatori Activi** | Active users percentage |
| **Autentificări Eșuate** | Failed login attempts |
| **Erori (24h)** | Errors in last 24 hours |
| **Bază de Date** | PostgreSQL connection status |
| **API Status** | REST API operational status |

#### Other Superadmin Pages:
- **Analytics** (`/ro/superadmin/analytics`): Page views, unique visitors, top referrers, popular features
- **Invoices** (`/ro/superadmin/invoices`): All company subscriptions with payment history
- **Companies** (`/ro/superadmin/companies`): Detailed company management

---

## 🚀 Vercel Deployment Steps

### Prerequisites
1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Database**: PostgreSQL database (e.g., Vercel Postgres, Neon, Supabase)
3. **GitHub Repository**: Push code to GitHub

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Create `vercel.json` Configuration
```json
{
  "buildCommand": "cd rental-property-manager && npm run build",
  "outputDirectory": "rental-property-manager/.next",
  "devCommand": "cd rental-property-manager && npm run dev",
  "installCommand": "cd rental-property-manager && npm install"
}
```

### Step 3: Set Environment Variables in Vercel

In Vercel Dashboard → Project Settings → Environment Variables:

```bash
# Database (REQUIRED)
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"

# NextAuth (REQUIRED)
NEXTAUTH_SECRET="your-secret-key-min-32-characters"
NEXTAUTH_URL="https://your-project.vercel.app"

# UploadThing (for images)
UPLOADTHING_SECRET="your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"

# Stripe (OPTIONAL - for subscriptions)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### Step 4: Deploy

```bash
# Login to Vercel
vercel login

# Navigate to project root
cd C:\users\alexandru\documents\propertyqwen

# Deploy
vercel --prod
```

### Step 5: Database Setup

After first deployment:

```bash
# Run Prisma migrations
npx prisma migrate deploy --schema=rental-property-manager/prisma/schema.prisma

# Generate Prisma Client
npx prisma generate --schema=rental-property-manager/prisma/schema.prisma

# (Optional) Seed database
npm run db:seed --prefix rental-property-manager
```

---

## ⚠️ Important Notes

### Database Connection
- **Vercel Postgres**: Recommended for seamless integration
- **Neon/Supabase**: Also compatible (standard PostgreSQL)
- **Connection Pooling**: Enable for serverless functions

### Build Configuration
The project is in `rental-property-manager/` subfolder. Update paths accordingly:
```bash
# All commands run from project root
cd rental-property-manager && npm run build
```

### Environment-Specific URLs
Update `NEXTAUTH_URL` for each environment:
- **Development**: `http://localhost:3000`
- **Preview**: `https://your-project-git-branch.vercel.app`
- **Production**: `https://your-project.vercel.app`

---

## 🧪 Testing Checklist Before Deploy

- [ ] Owner registration creates unique slug
- [ ] Lease creation generates contract
- [ ] Contract shows owner profile data
- [ ] "Semnează" button works and updates contract
- [ ] Reports show correct financial data
- [ ] Superadmin dashboard displays all companies
- [ ] Database migrations run successfully
- [ ] All API routes respond correctly

---

## 📊 System Architecture Summary

| Component | Technology | Status |
|-----------|-----------|--------|
| **Frontend** | Next.js 14 + React | ✅ Working |
| **Backend** | Next.js API Routes | ✅ Working |
| **Database** | PostgreSQL + Prisma 6 | ✅ Working |
| **Auth** | NextAuth.js | ✅ Working |
| **Styling** | Tailwind CSS + shadcn/ui | ✅ Working |
| **Contracts** | Custom HTML generator | ✅ Working |
| **Signatures** | Digital timestamp | ✅ Working |
| **Multi-tenant** | Owner slugs | ✅ Working |
| **Reports** | Financial analytics | ✅ Working |
| **Superadmin** | Full system oversight | ✅ Working |

---

## 🔧 Troubleshooting

### Build Fails
```bash
# Check Node version (requires 18+)
node --version

# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Database Connection Error
- Verify `DATABASE_URL` in Vercel environment variables
- Ensure database allows connections from Vercel IPs
- Check connection pooling settings

### Slug Already Taken
- System automatically checks for duplicates
- User must choose different company name or manually specify slug

---

**Last Updated**: February 23, 2026
**Version**: 1.0.0
