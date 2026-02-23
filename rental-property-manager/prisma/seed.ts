import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12)
  const admin = await prisma.user.upsert({
    where: { email: "admin@rentmanager.com" },
    update: {},
    create: {
      email: "admin@rentmanager.com",
      name: "Admin User",
      password: adminPassword,
      role: "ADMIN",
      approved: true,
      active: true,
    },
  })
  console.log("✓ Created admin user")

  // Create manager user
  const managerPassword = await bcrypt.hash("manager123", 12)
  const manager = await prisma.user.upsert({
    where: { email: "manager@rentmanager.com" },
    update: {},
    create: {
      email: "manager@rentmanager.com",
      name: "Property Manager",
      password: managerPassword,
      role: "MANAGER",
      approved: true,
      active: true,
    },
  })
  console.log("✓ Created manager user")

  // Create renter user
  const renterPassword = await bcrypt.hash("renter123", 12)
  const renter = await prisma.user.upsert({
    where: { email: "renter@rentmanager.com" },
    update: {},
    create: {
      email: "renter@rentmanager.com",
      name: "John Renter",
      password: renterPassword,
      role: "RENTER",
      approved: true,
      active: true,
    },
  })
  console.log("✓ Created renter user")

  // Create property
  const property = await prisma.property.upsert({
    where: { id: "property-1" },
    update: {},
    create: {
      id: "property-1",
      address: "123 Main Street, Apt 4B",
      city: "Bucharest",
      country: "Romania",
      postalCode: "010101",
      type: "Apartment",
      sqm: 65.5,
      rooms: 2,
      floor: 4,
      description: "Modern 2-room apartment in the city center",
      monthlyRent: 2500,
      deposit: 5000,
      utilitiesIncluded: false,
      available: true,
      managerId: manager.id,
    },
  })
  console.log("✓ Created property")

  // Create meters
  const electricityMeter = await prisma.meter.upsert({
    where: { propertyId_type: { propertyId: property.id, type: "ELECTRICITY" } },
    update: {},
    create: {
      propertyId: property.id,
      type: "ELECTRICITY",
      serialNumber: "ELC-123456",
      location: "Basement",
      pricePerUnit: 0.65,
      currency: "RON",
    },
  })
  console.log("✓ Created electricity meter")

  const waterMeter = await prisma.meter.upsert({
    where: { propertyId_type: { propertyId: property.id, type: "WATER" } },
    update: {},
    create: {
      propertyId: property.id,
      type: "WATER",
      serialNumber: "WTR-789012",
      location: "Basement",
      pricePerUnit: 5.50,
      currency: "RON",
    },
  })
  console.log("✓ Created water meter")

  const gasMeter = await prisma.meter.upsert({
    where: { propertyId_type: { propertyId: property.id, type: "GAS" } },
    update: {},
    create: {
      propertyId: property.id,
      type: "GAS",
      serialNumber: "GAS-345678",
      location: "Basement",
      pricePerUnit: 0.15,
      currency: "RON",
    },
  })
  console.log("✓ Created gas meter")

  // Create lease
  const lease = await prisma.lease.upsert({
    where: { propertyId_renterId_startDate: { propertyId: property.id, renterId: renter.id, startDate: new Date("2024-01-01") } },
    update: {},
    create: {
      propertyId: property.id,
      renterId: renter.id,
      startDate: new Date("2024-01-01"),
      endDate: null,
      isActive: true,
      monthlyRent: 2500,
      deposit: 5000,
      approvedBy: admin.id,
      approvedAt: new Date(),
    },
  })
  console.log("✓ Created lease")

  // Create initial meter readings
  const initialDate = new Date("2024-01-01")
  await prisma.meterReading.create({
    data: {
      meterId: electricityMeter.id,
      leaseId: lease.id,
      submittedBy: admin.id,
      readingType: "INITIAL",
      value: 1000,
      consumption: 0,
      readingDate: initialDate,
      verified: true,
    },
  })

  await prisma.meterReading.create({
    data: {
      meterId: waterMeter.id,
      leaseId: lease.id,
      submittedBy: admin.id,
      readingType: "INITIAL",
      value: 500,
      consumption: 0,
      readingDate: initialDate,
      verified: true,
    },
  })

  await prisma.meterReading.create({
    data: {
      meterId: gasMeter.id,
      leaseId: lease.id,
      submittedBy: admin.id,
      readingType: "INITIAL",
      value: 200,
      consumption: 0,
      readingDate: initialDate,
      verified: true,
    },
  })
  console.log("✓ Created initial meter readings")

  // Create utility prices
  await prisma.utilityPrice.upsert({
    where: { meterType: "ELECTRICITY" },
    update: {},
    create: {
      meterType: "ELECTRICITY",
      pricePerUnit: 0.65,
      currency: "RON",
    },
  })

  await prisma.utilityPrice.upsert({
    where: { meterType: "WATER" },
    update: {},
    create: {
      meterType: "WATER",
      pricePerUnit: 5.50,
      currency: "RON",
    },
  })

  await prisma.utilityPrice.upsert({
    where: { meterType: "GAS" },
    update: {},
    create: {
      meterType: "GAS",
      pricePerUnit: 0.15,
      currency: "RON",
    },
  })
  console.log("✓ Created utility prices")

  console.log("🎉 Seeding completed!")
  console.log("\n📧 Demo credentials:")
  console.log("   Admin:    admin@rentmanager.com / admin123")
  console.log("   Manager:  manager@rentmanager.com / manager123")
  console.log("   Renter:   renter@rentmanager.com / renter123")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
