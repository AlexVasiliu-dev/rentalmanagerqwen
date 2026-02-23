import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const registerSchema = z.object({
  email: z.string().email("Adresă de email invalidă"),
  password: z.string().min(8, "Parola trebuie să aibă minim 8 caractere"),
  name: z.string().min(2, "Numele trebuie să aibă minim 2 caractere"),
  phone: z.string().optional(),
  role: z.enum(["SUPERADMIN", "ADMIN", "MANAGER", "RENTER"]).optional(),
  // Business details - required for OWNERS (ADMIN)
  companyName: z.string().optional(),
  companyRegNumber: z.string().optional(),
  companyFiscalCode: z.string().optional(),
  workingEmail: z.string().email().optional().or(z.literal("")),
  // Owner slug - generated from business name
  ownerSlug: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Există deja un utilizator cu acest email" },
        { status: 400 }
      )
    }

    // For OWNERS (ADMIN): require business details and generate slug
    let ownerSlug = validatedData.ownerSlug
    if (validatedData.role === "ADMIN") {
      if (!validatedData.companyName) {
        return NextResponse.json(
          { error: "Numele companiei este obligatoriu pentru proprietari" },
          { status: 400 }
        )
      }
      
      // Generate slug from company name if not provided
      if (!ownerSlug) {
        ownerSlug = validatedData.companyName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
      }
      
      // Check if slug is already taken
      const existingSlug = await prisma.user.findUnique({
        where: { ownerSlug },
      })
      
      if (existingSlug) {
        return NextResponse.json(
          { error: "Acest nume de afacere este deja folosit. Te rugăm să alegi altul." },
          { status: 400 }
        )
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Create user with TRIAL subscription (15 days)
    const trialEnd = new Date()
    trialEnd.setDate(trialEnd.getDate() + 15)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        phone: validatedData.phone,
        role: "ADMIN", // Only owners can register on main site
        approved: true, // Auto-approved
        active: true,
        ownerSlug: ownerSlug,
        companyName: validatedData.companyName,
        companyRegNumber: validatedData.companyRegNumber,
        companyFiscalCode: validatedData.companyFiscalCode,
        workingEmail: validatedData.workingEmail,
        // Trial subscription
        subscriptionType: "trial",
        subscriptionStatus: "trial",
        subscriptionStart: new Date(),
        subscriptionEnd: trialEnd,
        paidProperties: 0,
        coveredProperties: 10, // Unlimited during trial (up to 10 properties)
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        approved: true,
        ownerSlug: true,
        companyName: true,
        subscriptionType: true,
        subscriptionEnd: true,
      },
    })

    return NextResponse.json(
      {
        message: "Înregistrare reușită! Contul tău de proprietar a fost creat.",
        user,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "A apărut o eroare la înregistrare" },
      { status: 500 }
    )
  }
}
