/**
 * Seed Mock Businesses Script
 * Creates 3 test businesses with different subscription tiers
 * Run with: npx tsx seed-mock-businesses.ts
 */

import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Creating mock businesses with subscriptions...")

  const hashedPassword = await bcrypt.hash("Owner123!", 12)

  // Business 1: Free subscription - 1 property
  console.log("\n📦 Creating Business 1: Free Plan (1 property)")
  const business1 = await prisma.user.upsert({
    where: { email: "free@business.ro" },
    update: {
      role: "ADMIN",
      subscriptionType: "free",
      subscriptionStatus: "free",
      coveredProperties: 1,
    },
    create: {
      email: "free@business.ro",
      name: "Ion Popescu",
      password: hashedPassword,
      role: "ADMIN",
      approved: true,
      active: true,
      ownerSlug: "popescu-imobiliare",
      companyName: "Popescu Imobiliare SRL",
      companyRegNumber: "J12/100/2024",
      companyFiscalCode: "RO100000",
      workingEmail: "contact@popescu-imobiliare.ro",
      phone: "+40 710 000 001",
      subscriptionType: "free",
      subscriptionStatus: "free",
      subscriptionStart: new Date("2024-01-15"),
      coveredProperties: 1,
      paidProperties: 0,
    },
  })

  // Create 1 property for business 1
  const property1 = await prisma.property.upsert({
    where: { id: "property-free-1" },
    update: { managerId: business1.id },
    create: {
      id: "property-free-1",
      address: "Strada Libertății 1",
      city: "București",
      country: "Romania",
      type: "Apartament",
      sqm: 50,
      rooms: 2,
      monthlyRent: 2000,
      deposit: 4000,
      available: true,
      managerId: business1.id,
    },
  })
  console.log(`   ✓ Created property: ${property1.address}`)

  // Business 2: Monthly subscription (50 EUR) - 2 properties
  console.log("\n📦 Creating Business 2: Monthly Plan 50 EUR (2 properties)")
  const business2 = await prisma.user.upsert({
    where: { email: "monthly@business.ro" },
    update: {
      role: "ADMIN",
      subscriptionType: "monthly",
      subscriptionStatus: "active",
      coveredProperties: 2,
    },
    create: {
      email: "monthly@business.ro",
      name: "Maria Ionescu",
      password: hashedPassword,
      role: "ADMIN",
      approved: true,
      active: true,
      ownerSlug: "ionescu-properties",
      companyName: "Ionescu Properties SRL",
      companyRegNumber: "J12/200/2023",
      companyFiscalCode: "RO200000",
      workingEmail: "contact@ionescu-properties.ro",
      phone: "+40 720 000 002",
      subscriptionType: "monthly",
      subscriptionStatus: "active",
      subscriptionStart: new Date("2023-11-01"),
      subscriptionEnd: new Date("2026-11-01"), // 3 years from start
      coveredProperties: 2,
      paidProperties: 1,
    },
  })

  // Create 2 properties for business 2
  const property2a = await prisma.property.upsert({
    where: { id: "property-monthly-1" },
    update: { managerId: business2.id },
    create: {
      id: "property-monthly-1",
      address: "Bulevardul Unirii 10",
      city: "București",
      country: "Romania",
      type: "Apartament",
      sqm: 65,
      rooms: 2,
      monthlyRent: 2500,
      deposit: 5000,
      available: true,
      managerId: business2.id,
    },
  })
  console.log(`   ✓ Created property: ${property2a.address}`)

  const property2b = await prisma.property.upsert({
    where: { id: "property-monthly-2" },
    update: { managerId: business2.id },
    create: {
      id: "property-monthly-2",
      address: "Strada Victoriei 25",
      city: "Cluj-Napoca",
      country: "Romania",
      type: "Garsonieră",
      sqm: 35,
      rooms: 1,
      monthlyRent: 1800,
      deposit: 3600,
      available: false,
      managerId: business2.id,
    },
  })
  console.log(`   ✓ Created property: ${property2b.address}`)

  // Create a tenant for property 2b
  const tenantPassword = await bcrypt.hash("Tenant123!", 12)
  const tenant = await prisma.user.upsert({
    where: { email: "chirias@exemplu.ro" },
    update: {},
    create: {
      email: "chirias@exemplu.ro",
      name: "Andrei Vasile",
      password: tenantPassword,
      role: "RENTER",
      approved: true,
      active: true,
      phone: "+40 730 000 003",
      idCardSeries: "AB",
      idCardNumber: "123456",
      cnp: "1990101123456",
    },
  })

  // Create lease for property 2b
  const lease = await prisma.lease.upsert({
    where: { 
      propertyId_renterId_startDate: { 
        propertyId: property2b.id, 
        renterId: tenant.id, 
        startDate: new Date("2024-01-01") 
      } 
    },
    update: {},
    create: {
      propertyId: property2b.id,
      renterId: tenant.id,
      startDate: new Date("2024-01-01"),
      endDate: new Date("2025-12-31"),
      isActive: true,
      monthlyRent: 1800,
      deposit: 3600,
      approvedBy: business2.id,
      approvedAt: new Date(),
      ownerSigned: true,
      ownerSignedAt: new Date(),
      tenantSigned: true,
      tenantSignedAt: new Date(),
    },
  })
  console.log(`   ✓ Created lease for tenant: ${tenant.name}`)

  // Business 3: Yearly subscription (250 EUR) - 9 properties
  console.log("\n📦 Creating Business 3: Yearly Plan 250 EUR (9 properties)")
  const business3 = await prisma.user.upsert({
    where: { email: "yearly@business.ro" },
    update: {
      role: "ADMIN",
      subscriptionType: "yearly",
      subscriptionStatus: "active",
      coveredProperties: 9,
    },
    create: {
      email: "yearly@business.ro",
      name: "Radu Georgescu",
      password: hashedPassword,
      role: "ADMIN",
      approved: true,
      active: true,
      ownerSlug: "georgescu-real-estate",
      companyName: "Georgescu Real Estate SRL",
      companyRegNumber: "J12/300/2024",
      companyFiscalCode: "RO300000",
      workingEmail: "contact@georgescu-re.ro",
      phone: "+40 740 000 004",
      subscriptionType: "yearly",
      subscriptionStatus: "active",
      subscriptionStart: new Date(new Date().setDate(new Date().getDate() - 2)), // 2 days ago
      subscriptionEnd: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 1 year from start
      coveredProperties: 9,
      paidProperties: 8, // BOGO: pays for 8, gets 9 covered
    },
  })

  // Create 9 properties for business 3
  const cities = ["București", "Cluj-Napoca", "Timișoara", "Iași", "Constanța"]
  for (let i = 1; i <= 9; i++) {
    const property = await prisma.property.upsert({
      where: { id: `property-yearly-${i}` },
      update: { managerId: business3.id },
      create: {
        id: `property-yearly-${i}`,
        address: `Strada Principală ${i}`,
        city: cities[i % cities.length],
        country: "Romania",
        type: i % 3 === 0 ? "Casă" : "Apartament",
        sqm: 40 + (i * 10),
        rooms: 1 + (i % 3),
        monthlyRent: 1500 + (i * 200),
        deposit: 3000 + (i * 400),
        available: i % 2 === 0,
        managerId: business3.id,
      },
    })
    console.log(`   ✓ Created property ${i}: ${property.address}, ${property.city}`)
  }

  console.log("\n✅ Mock businesses created successfully!")
  console.log("\n📊 Summary:")
  console.log("   Business 1: Popescu Imobiliare (FREE) - 1 property")
  console.log("   Business 2: Ionescu Properties (50 EUR/month) - 2 properties, 1 tenant")
  console.log("   Business 3: Georgescu Real Estate (250 EUR/year) - 9 properties")
  console.log("\n🔐 Login credentials:")
  console.log("   All owners: Owner123!")
  console.log("   Tenant: Tenant123!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
