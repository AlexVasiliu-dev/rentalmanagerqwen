/**
 * Seed script to create 3 mock users with different subscription states:
 * 1. Free user with 1 property (expires in 1 year)
 * 2. Paid user with 4 properties (paid 100 EUR, expires in 9 months)
 * 3. Trial user with 7 properties (15 days trial, needs to pay 150 EUR)
 */

import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting seed for mock subscription users...")

  // Clean up existing test users
  await prisma.user.deleteMany({
    where: {
      email: {
        in: [
          "free@example.com",
          "paid@example.com",
          "trial@example.com",
        ],
      },
    },
  })

  const hashedPassword = await bcrypt.hash("password123", 12)

  // ============================================
  // USER 1: FREE - 1 Property, expires in 1 year
  // ============================================
  console.log("\n📦 Creating FREE user (1 property)...")
  
  const freeUser = await prisma.user.create({
    data: {
      email: "free@example.com",
      password: hashedPassword,
      name: "Ion Popescu",
      role: "ADMIN",
      approved: true,
      active: true,
      ownerSlug: "free-properties-srl",
      companyName: "Free Properties SRL",
      companyRegNumber: "J12/123/2024",
      companyFiscalCode: "RO123456",
      workingEmail: "ion@freeproperties.ro",
      phone: "+40700123456",
      // Subscription details
      subscriptionType: "free",
      subscriptionStatus: "free",
      subscriptionStart: new Date(),
      subscriptionEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      paidProperties: 0,
      coveredProperties: 1,
    },
  })

  // Create 1 property for free user
  await prisma.property.create({
    data: {
      address: "Str. Libertății nr. 1",
      city: "București",
      country: "Romania",
      postalCode: "010101",
      type: "Garsonieră",
      sqm: 35,
      rooms: 1,
      floor: 2,
      monthlyRent: 400,
      deposit: 400,
      available: true,
      managerId: freeUser.id,
      description: "Garsonieră confortabilă în centrul orașului",
    },
  })

  console.log(`✓ Created FREE user: ${freeUser.email} with 1 property`)

  // ============================================
  // USER 2: PAID - 4 Properties, paid 100 EUR 3 months ago
  // Expires in 9 months
  // ============================================
  console.log("\n💰 Creating PAID user (4 properties, paid 100 EUR)...")
  
  const paidUser = await prisma.user.create({
    data: {
      email: "paid@example.com",
      password: hashedPassword,
      name: "Maria Ionescu",
      role: "ADMIN",
      approved: true,
      active: true,
      ownerSlug: "premium-imobiliare",
      companyName: "Premium Imobiliare SRL",
      companyRegNumber: "J40/456/2023",
      companyFiscalCode: "RO987654",
      workingEmail: "maria@premiumimobiliare.ro",
      phone: "+40700987654",
      // Subscription details
      subscriptionType: "yearly",
      subscriptionStatus: "active",
      subscriptionStart: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 3 months ago
      subscriptionEnd: new Date(Date.now() + 275 * 24 * 60 * 60 * 1000), // 9 months from now
      paidProperties: 2, // Paid for 2 properties (BOGO: gets 4 covered)
      coveredProperties: 4,
    },
  })

  // Create 4 properties for paid user
  const paidProperties = [
    { address: "Bulevardul Unirii nr. 10", type: "Apartament 2 camere", sqm: 55, rooms: 2, rent: 600 },
    { address: "Str. Victoriei nr. 25", type: "Apartament 3 camere", sqm: 75, rooms: 3, rent: 800 },
    { address: "Calea Dorobanților nr. 50", type: "Garsonieră", sqm: 40, rooms: 1, rent: 450 },
    { address: "Str. Aviației nr. 15", type: "Apartament 2 camere", sqm: 60, rooms: 2, rent: 650 },
  ]

  for (const prop of paidProperties) {
    await prisma.property.create({
      data: {
        address: prop.address,
        city: "București",
        country: "Romania",
        postalCode: "020202",
        type: prop.type as string,
        sqm: prop.sqm,
        rooms: prop.rooms,
        floor: 3,
        monthlyRent: prop.rent,
        deposit: prop.rent,
        available: true,
        managerId: paidUser.id,
        description: `${prop.type} modern și luminos`,
      },
    })
  }

  console.log(`✓ Created PAID user: ${paidUser.email} with 4 properties (paid 100 EUR)`)

  // ============================================
  // USER 3: TRIAL - 7 Properties, 15 days trial
  // Needs to pay 150 EUR after trial
  // ============================================
  console.log("\n🎯 Creating TRIAL user (7 properties, 15 days trial)...")
  
  const trialStartDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
  const trialEndDate = new Date(trialStartDate.getTime() + 15 * 24 * 60 * 60 * 1000) // 15 days from start
  
  const trialUser = await prisma.user.create({
    data: {
      email: "trial@example.com",
      password: hashedPassword,
      name: "Andrei Georgescu",
      role: "ADMIN",
      approved: true,
      active: true,
      ownerSlug: "georgescu-properties",
      companyName: "Georgescu Properties SRL",
      companyRegNumber: "J20/789/2024",
      companyFiscalCode: "RO456789",
      workingEmail: "andrei@georgescuproperties.ro",
      phone: "+40700555123",
      // Subscription details
      subscriptionType: "trial",
      subscriptionStatus: "trial",
      subscriptionStart: trialStartDate,
      subscriptionEnd: trialEndDate,
      paidProperties: 0,
      coveredProperties: 7, // Trial covers all during trial period
    },
  })

  // Create 7 properties for trial user
  const trialProperties = [
    { address: "Str. Primăverii nr. 1", type: "Apartament 3 camere", sqm: 80, rooms: 3, rent: 900 },
    { address: "Bulevardul Magheru nr. 5", type: "Garsonieră", sqm: 38, rooms: 1, rent: 420 },
    { address: "Str. Franceză nr. 12", type: "Apartament 2 camere", sqm: 58, rooms: 2, rent: 620 },
    { address: "Calea Moșilor nr. 100", type: "Apartament 2 camere", sqm: 52, rooms: 2, rent: 550 },
    { address: "Str. Smârdan nr. 8", type: "Garsonieră", sqm: 35, rooms: 1, rent: 400 },
    { address: "Bulevardul Carol nr. 20", type: "Apartament 3 camere", sqm: 85, rooms: 3, rent: 950 },
    { address: "Str. Doamnei nr. 3", type: "Apartament 2 camere", sqm: 55, rooms: 2, rent: 580 },
  ]

  for (const prop of trialProperties) {
    await prisma.property.create({
      data: {
        address: prop.address,
        city: "București",
        country: "Romania",
        postalCode: "030303",
        type: prop.type as string,
        sqm: prop.sqm,
        rooms: prop.rooms,
        floor: 2,
        monthlyRent: prop.rent,
        deposit: prop.rent,
        available: true,
        managerId: trialUser.id,
        description: `${prop.type} în zonă centrală`,
      },
    })
  }

  console.log(`✓ Created TRIAL user: ${trialUser.email} with 7 properties (trial expires ${trialEndDate.toLocaleDateString('ro-RO')})`)

  // ============================================
  // Summary
  // ============================================
  console.log("\n✅ Seed completed successfully!")
  console.log("\n📊 Summary:")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log("1. FREE User:")
  console.log("   Email: free@example.com")
  console.log("   Password: password123")
  console.log("   Slug: /free-properties-srl")
  console.log("   Properties: 1")
  console.log("   Subscription: FREE (expires in 1 year)")
  console.log("")
  console.log("2. PAID User:")
  console.log("   Email: paid@example.com")
  console.log("   Password: password123")
  console.log("   Slug: /premium-imobiliare")
  console.log("   Properties: 4")
  console.log("   Subscription: YEARLY (paid 100 EUR, expires in 9 months)")
  console.log("")
  console.log("3. TRIAL User:")
  console.log("   Email: trial@example.com")
  console.log("   Password: password123")
  console.log("   Slug: /georgescu-properties")
  console.log("   Properties: 7")
  console.log("   Subscription: TRIAL (expires in 10 days, needs to pay 150 EUR)")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log("\n💡 Login at: http://localhost:3000/ro/auth/signin")
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
