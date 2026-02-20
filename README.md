# 🏠 RentManager - Rental Property Management System

A comprehensive web application for managing rental properties with AI-powered meter reading capabilities.

## ✨ Features

### User Roles & Permissions
- **Admin (Owner)**: Full access to all features, property management, user approval
- **Manager**: Read access, can accept/dismiss renters, view reports
- **Renter**: Access to their consumption data, submit meter readings, view bills

### Property Management
- Add/edit properties with detailed information (address, type, SQM, prices)
- Upload 5-10 property images
- Track property availability and occupancy
- Assign managers to properties

### User Management
- User registration with email/password
- Admin approval workflow for all user types
- Activate/deactivate renter accounts (auto-disabled on move-out)
- Role-based access control

### Meter Reading System
- **Three reading types**:
  - Initial Reading (move-in)
  - Monthly Reading (ongoing tenancy)
  - Final Reading (move-out)
- **AI-Powered OCR**: Automatic meter reading from photos using Tesseract.js
- Support for Electricity, Water, and Gas meters
- Consumption tracking and calculation
- Photo evidence for each reading
- **Nobody can edit meter readings except the OCR bot** (ensures data integrity)

### Billing & Costs
- Detailed cost breakdown for renters
- Automatic bill generation based on meter consumption
- Custom formulas for utility cost calculation
- Track paid/unpaid bills
- Rent and utility billing

### Reports & Analytics (Admin/Manager only)
- Income and expense tracking
- Visual charts (bar, pie) for financial data
- Active leases overview
- Outstanding balance reports
- Property performance metrics

### 💳 Subscription & Payments
- **Permanent Owner Links**: `Property_mngmt.com/owner/{slug}`
- **Pricing**: 50 EUR/year per property
- **BOGO Deal**: Buy 1 Get 1 FREE (effective 25 EUR/property/year)
- **Free Trial**: First property free for all new users
- **Stripe Integration**: Secure payment processing
- **Subscription Management**: Upgrade, cancel, manage billing
- **Public Owner Pages**: Showcase managed properties

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with role-based access
- **UI Components**: Custom components with Tailwind CSS
- **Charts**: Recharts
- **OCR**: Tesseract.js
- **Forms**: React Hook Form + Zod validation
- **Image Upload**: UploadThing (ready for integration)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
```bash
cd rental-property-manager
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
# Copy .env.example to .env
cp .env.example .env

# Update with your database credentials
DATABASE_URL="postgresql://user:password@localhost:5432/rental_property_db?schema=public"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

4. **Set up the database**
```bash
# Push Prisma schema to database
npm run db:push

# Seed the database with demo data
npm run db:seed

# (Optional) Open Prisma Studio to view data
npm run db:studio
```

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 👤 Demo Credentials

After seeding the database, you can log in with:

| Role    | Email                      | Password    |
|---------|----------------------------|-------------|
| Admin   | admin@rentmanager.com      | admin123    |
| Manager | manager@rentmanager.com    | manager123  |
| Renter  | renter@rentmanager.com     | renter123   |

## 📁 Project Structure

```
src/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── properties/   # Property CRUD
│   │   ├── users/        # User management
│   │   ├── leases/       # Lease management
│   │   ├── meter-readings/ # Meter readings with OCR
│   │   ├── bills/        # Billing system
│   │   └── reports/      # Analytics & reports
│   ├── auth/             # Auth pages (signin, register)
│   ├── dashboard/        # Dashboard pages by role
│   └── page.tsx          # Landing page
├── components/
│   └── ui/               # Reusable UI components
├── lib/
│   ├── auth.ts           # Auth utilities
│   ├── billing.ts        # Billing calculations
│   ├── ocr.ts            # OCR processing
│   ├── prisma.ts         # Prisma client
│   └── utils.ts          # Helper functions
└── types/
    └── next-auth.d.ts    # Auth type extensions

prisma/
├── schema.prisma         # Database schema
└── seed.ts               # Database seeder
```

## 📊 Database Schema

### Core Models:
- **User**: Authentication and user data
- **Property**: Rental property details
- **PropertyImage**: Property photos
- **Lease**: Rental agreements
- **Meter**: Utility meters per property
- **MeterReading**: Meter readings with OCR data
- **Bill**: Invoices and bills
- **Expense**: Owner expenses
- **UtilityPrice**: Utility pricing configuration
- **AuditLog**: Activity tracking

## 🔐 Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Role-based access control (RBAC)
- Protected API routes
- Input validation with Zod
- Audit logging for sensitive actions

## 🤖 OCR Meter Reading

The application uses Tesseract.js to automatically extract meter readings from photos:

1. Renter takes a photo of the meter
2. Image is processed with OCR
3. Reading value is extracted automatically
4. Consumption is calculated
5. Bill is generated based on usage

This ensures accurate readings and prevents manual entry errors or tampering.

## 📈 Future Enhancements

- [ ] Email notifications for bills and approvals
- [ ] PDF invoice generation
- [ ] Mobile app (React Native)
- [ ] Payment gateway integration
- [ ] Maintenance request tracking
- [ ] Document storage (leases, contracts)
- [ ] Multi-language support
- [ ] SMS notifications

## 📝 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For questions or issues, please open an issue on GitHub.

---

Built with ❤️ using Next.js and TypeScript
