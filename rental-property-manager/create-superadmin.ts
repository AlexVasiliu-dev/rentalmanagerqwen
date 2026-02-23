/**
 * Create SUPERADMIN User Script
 * Run with: npx tsx create-superadmin.ts
 */

import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🔧 Creating SUPERADMIN user...")

  const superadminEmail = "superadmin@rentalmanager.ro"
  const superadminPassword = "SuperAdmin123!"

  // Check if superadmin already exists
  const existing = await prisma.user.findUnique({
    where: { email: superadminEmail },
  })

  if (existing) {
    console.log("✅ SUPERADMIN already exists!")
    console.log(`   Email: ${superadminEmail}`)
    console.log(`   Password: ${superadminPassword}`)
    return
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(superadminPassword, 12)

  // Create superadmin
  const superadmin = await prisma.user.create({
    data: {
      email: superadminEmail,
      name: "Super Administrator",
      password: hashedPassword,
      role: "SUPERADMIN",
      approved: true,
      active: true,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  })

  console.log("✅ SUPERADMIN created successfully!")
  console.log("   Login credentials:")
  console.log(`   Email: ${superadminEmail}`)
  console.log(`   Password: ${superadminPassword}`)
  console.log("\   Access: /ro/dashboard (can see all businesses)")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
