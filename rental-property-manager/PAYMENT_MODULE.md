# 💳 Payment Module Documentation

## Overview

The payment module adds a complete subscription-based pricing system to your rental property management application with a **Buy One Get One Free (BOGO)** deal.

## 🎯 Key Features

### 1. Permanent Owner Links
- Every owner gets a unique permanent link: `Property_mngmt.com/owner/{slug}`
- Example: `Property_mngmt.com/owner/john-doe`
- Public page showing owner's managed properties
- Professional branding for property owners

### 2. Pricing Model
- **Base Price**: 50 EUR per year per property
- **BOGO Deal**: Buy 1 property, get 2 properties covered
- **Effective Price**: 25 EUR per property per year (with BOGO)

### 3. Subscription Tiers
| Properties Paid | Properties Covered | Total Price/Year |
|----------------|-------------------|------------------|
| 1              | 2                 | 50 EUR           |
| 2              | 4                 | 100 EUR          |
| 3              | 6                 | 150 EUR          |
| 4              | 8                 | 200 EUR          |
| 5              | 10                | 250 EUR          |

### 4. Free Trial
- New users get 1 property FREE (trial)
- No credit card required for trial
- Upgrade prompt when adding second property

## 📁 New Files Added

```
src/
├── app/
│   ├── api/
│   │   ├── subscription/
│   │   │   └── route.ts          # Subscription management API
│   │   ├── webhooks/
│   │   │   └── stripe/
│   │   │       └── route.ts      # Stripe webhook handler
│   │   └── owner-slug/
│   │       └── route.ts          # Owner link creation API
│   ├── dashboard/
│   │   └── subscription/
│   │       └── page.tsx          # Subscription management page
│   └── owner/
│       └── [slug]/
│           └── page.tsx          # Public owner page
├── components/
│   └── PricingPrompt.tsx         # Upgrade prompt component
└── lib/
    └── stripe.ts                 # Stripe utilities and BOGO logic

prisma/
└── schema.prisma                 # Updated with Subscription & Payment models
```

## 🔧 Configuration

### 1. Set Up Stripe

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the Stripe Dashboard
3. Update `.env` file:

```env
# Stripe Payment Configuration
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# For production webhooks, configure in Stripe Dashboard:
# Settings > Developers > Webhooks > Add endpoint
# URL: https://yourdomain.com/api/webhooks/stripe
# Events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted

# App URL for owner links
APP_URL="https://Property_mngmt.com"
```

### 2. Update Database

```bash
# Push updated schema to database
npm run db:push

# (Optional) Seed with test data
npm run db:seed
```

## 🚀 User Flow

### For New Owners

1. **Registration**
   - User registers at `Property_mngmt.com/auth/register`
   - Account created with INACTIVE subscription status
   - Gets 1 property FREE (trial)

2. **Create Owner Link**
   - Go to Dashboard > Subscription
   - Choose unique slug (e.g., "john-doe")
   - Permanent link created: `Property_mngmt.com/owner/john-doe`

3. **Add First Property**
   - Free, no payment required
   - Property shows on owner page

4. **Upgrade Prompt**
   - When adding 2nd property, pricing prompt appears
   - Shows BOGO deal benefits
   - Calculator shows total cost

5. **Subscribe**
   - Click "Subscribe Now"
   - Redirected to Stripe Checkout
   - Enter payment details
   - Subscription activated

6. **Manage Subscription**
   - View status in Dashboard > Subscription
   - Manage billing via Stripe Customer Portal
   - Cancel anytime

### For Existing Owners

1. **View Owner Page**
   - Share permanent link with potential renters
   - Shows all managed properties
   - Displays subscription status

2. **Add More Properties**
   - System checks subscription limit
   - If at limit, shows upgrade prompt
   - BOGO deal automatically applied

## 💰 Pricing Logic

### BOGO Calculation

```typescript
// From src/lib/stripe.ts
export function calculateSubscription(propertiesCount: number) {
  // With BOGO: paidProperties = ceil(propertiesCount / 2)
  const paidProperties = Math.ceil(propertiesCount / 2)
  const coveredProperties = paidProperties * 2
  
  const amountInCents = paidProperties * 5000 // 50 EUR in cents
  const totalAmount = amountInCents / 100
  
  return {
    paidProperties,
    coveredProperties,
    totalAmount,
  }
}
```

### Examples

| Want to Manage | Pay For | Get Free | Total Covered | Price/Year |
|---------------|---------|----------|---------------|------------|
| 1 property    | 1       | 1        | 2             | 50 EUR     |
| 2 properties  | 1       | 1        | 2             | 50 EUR     |
| 3 properties  | 2       | 2        | 4             | 100 EUR    |
| 4 properties  | 2       | 2        | 4             | 100 EUR    |
| 5 properties  | 3       | 3        | 6             | 150 EUR    |
| 10 properties | 5       | 5        | 10            | 250 EUR    |

## 🎨 UI Components

### Subscription Page (`/dashboard/subscription`)

Features:
- Owner link creation form
- Subscription status display
- Pricing calculator
- BOGO deal explanation
- Checkout button
- Billing management

### Pricing Prompt Component

Shows when:
- User is at subscription limit
- User tries to add property over limit

Features:
- Current vs max properties
- BOGO deal highlights
- Upgrade button
- Pricing details

### Public Owner Page (`/owner/[slug]`)

Features:
- Owner profile
- Subscription status badge
- List of managed properties
- Property details (address, rent, status)
- CTA for new owners

## 🔌 API Endpoints

### `POST /api/subscription`
Create subscription checkout session

**Request:**
```json
{
  "propertiesCount": 3
}
```

**Response:**
```json
{
  "checkoutUrl": "https://checkout.stripe.com/...",
  "pricing": {
    "paidProperties": 2,
    "coveredProperties": 4,
    "totalAmount": 100,
    "currency": "EUR",
    "billingPeriod": "yearly",
    "bogoDeal": true
  }
}
```

### `GET /api/subscription`
Get current subscription status

**Response:**
```json
{
  "hasSubscription": true,
  "status": "ACTIVE",
  "paidProperties": 2,
  "coveredProperties": 4,
  "propertiesCount": 3,
  "remainingSlots": 1,
  "currentPeriodEnd": "2027-01-01T00:00:00Z",
  "pricePerProperty": 50
}
```

### `POST /api/owner-slug`
Create permanent owner link

**Request:**
```json
{
  "slug": "john-doe"
}
```

**Response:**
```json
{
  "message": "Owner link created successfully",
  "ownerUrl": "https://Property_mngmt.com/owner/john-doe",
  "user": {
    "id": "...",
    "email": "john@example.com",
    "name": "John Doe",
    "ownerSlug": "john-doe"
  }
}
```

### `GET /owner/[slug]` (Public)
Get owner public profile

**Response:**
```json
{
  "owner": {
    "name": "John Doe",
    "subscriptionStatus": "ACTIVE",
    "propertiesManaged": 3,
    "maxProperties": 4
  }
}
```

## 🪝 Stripe Webhooks

Configure webhooks in Stripe Dashboard to handle:

### Events Handled

1. **checkout.session.completed**
   - Activates subscription
   - Creates payment record
   - Updates property subscription status

2. **customer.subscription.updated**
   - Updates subscription period dates
   - Syncs status with Stripe

3. **customer.subscription.deleted**
   - Marks subscription as CANCELLED
   - Properties lose active status

### Webhook Security

Webhooks are signed with Stripe signature. Verify in production:
```typescript
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET!
)
```

## 🧪 Testing

### Test Cards (Stripe)

Use these test cards in development:

| Card Number | Description |
|-------------|-------------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 9995 | Declined |
| 4000 0025 0000 3155 | Requires authentication |

### Test Flow

1. Register new account
2. Create owner slug
3. Add 1 property (free)
4. Try to add 2nd property
5. See pricing prompt
6. Click "Subscribe Now"
7. Use test card 4242 4242 4242 4242
8. Complete checkout
9. Verify subscription activated
10. Add more properties (up to limit)

## 📊 Database Schema

### Subscription Model
```prisma
model Subscription {
  id                String             @id @default(cuid())
  userId            String             @unique
  status            SubscriptionStatus @default(INACTIVE)
  stripeSubscriptionId String?         @unique
  
  // Pricing
  pricePerProperty  Int                @default(5000) // 50 EUR in cents
  currency          String             @default("EUR")
  billingPeriod     String             @default("yearly")
  
  // BOGO
  paidProperties    Int                @default(0)
  coveredProperties Int                @default(0)
  
  // Period
  currentPeriodStart DateTime?
  currentPeriodEnd   DateTime?
}
```

### Payment Model
```prisma
model Payment {
  id                String   @id @default(cuid())
  userId            String
  stripePaymentId   String?
  amount            Int      // In cents
  currency          String   @default("EUR")
  status            String   @default("succeeded")
  
  // What was paid for
  propertiesCount   Int
  promotionalCredits Int     // Free properties from BOGO
  
  // Period covered
  periodStart       DateTime
  periodEnd         DateTime
}
```

## 🎯 Marketing Benefits

### BOGO Deal Advantages

1. **Psychological Appeal**: "Get 1 FREE!" is more attractive than "50% off"
2. **Higher Perceived Value**: Customers feel they're getting a bargain
3. **Encourages Growth**: Owners motivated to add second property
4. **Competitive Pricing**: Effective 25 EUR/property is market-leading

### Owner Link Benefits

1. **Professional Branding**: Owners have their own page
2. **SEO Value**: Each owner page indexed by search engines
3. **Easy Sharing**: Simple URL for marketing materials
4. **Trust Building**: Public subscription status shows legitimacy

## 🔒 Security

- Stripe handles all payment data (PCI DSS compliant)
- No credit card info stored on your servers
- Webhook signatures verified
- User authentication required for subscription changes
- Owner slugs are unique and validated

## 📱 Mobile Responsive

All payment pages are fully responsive:
- Subscription management page
- Pricing prompts
- Owner public pages
- Stripe Checkout (handled by Stripe)

## 🆘 Troubleshooting

### Common Issues

**"No userId in session metadata"**
- Check that user is logged in
- Verify session is being passed correctly

**Webhook not working**
- Verify webhook secret in `.env`
- Check Stripe Dashboard for webhook delivery logs
- Use Stripe CLI for local testing

**Subscription not activating**
- Check Stripe checkout was completed
- Verify webhook was received and processed
- Check database for subscription record

**Owner slug not creating**
- Slug must be unique
- Only lowercase letters, numbers, and hyphens allowed
- Minimum 3 characters

## 📞 Support

For payment-related issues:
1. Check Stripe Dashboard for payment status
2. Verify webhook logs
3. Review subscription records in database
4. Contact Stripe support for payment processing issues

---

**Built with Stripe** 💳 | **BOGO Deal** 🎁 | **50 EUR/year** 💰
