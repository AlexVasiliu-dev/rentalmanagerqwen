import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { processMeterImage, validateMeterReading } from "@/lib/ocr"
import { calculateConsumption, calculateUtilityCost } from "@/lib/billing"

const meterReadingSchema = z.object({
  meterId: z.string(),
  leaseId: z.string().optional(),
  readingType: z.enum(["INITIAL", "MONTHLY", "FINAL"]),
  value: z.coerce.number().positive(),
  photoUrl: z.string().optional(),
  readingDate: z.string().optional(),
  periodStart: z.string().optional(),
  periodEnd: z.string().optional(),
  notes: z.string().optional(),
})

// GET - List meter readings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const meterId = searchParams.get("meterId")
    const leaseId = searchParams.get("leaseId")
    const limit = parseInt(searchParams.get("limit") || "50")

    const where: Record<string, unknown> = {}

    if (meterId) where.meterId = meterId
    if (leaseId) where.leaseId = leaseId

    // Renters can only see their own readings
    if (session.user.role === "RENTER") {
      const lease = await prisma.lease.findFirst({
        where: {
          renterId: session.user.id,
          isActive: true,
        },
      })
      if (!lease) {
        return NextResponse.json([])
      }
      where.leaseId = lease.id
    }

    const readings = await prisma.meterReading.findMany({
      where,
      include: {
        meter: {
          select: {
            id: true,
            type: true,
            pricePerUnit: true,
            serialNumber: true,
          },
        },
        submittedByUser: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { readingDate: "desc" },
      take: limit,
    })

    return NextResponse.json(readings)
  } catch (error) {
    console.error("Error fetching meter readings:", error)
    return NextResponse.json(
      { error: "Failed to fetch meter readings" },
      { status: 500 }
    )
  }
}

// POST - Create meter reading
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = meterReadingSchema.parse(body)

    // Get meter details
    const meter = await prisma.meter.findUnique({
      where: { id: validatedData.meterId },
      include: { property: true },
    })

    if (!meter) {
      return NextResponse.json({ error: "Meter not found" }, { status: 404 })
    }

    // Check permissions
    if (session.user.role === "RENTER") {
      const lease = await prisma.lease.findFirst({
        where: {
          renterId: session.user.id,
          isActive: true,
          propertyId: meter.propertyId,
        },
      })
      if (!lease) {
        return NextResponse.json(
          { error: "No active lease for this property" },
          { status: 403 }
        )
      }
      validatedData.leaseId = lease.id
    }

    // Get previous reading
    const previousReading = await prisma.meterReading.findFirst({
      where: { meterId: validatedData.meterId },
      orderBy: { readingDate: "desc" },
    })

    // Validate reading
    const validation = validateMeterReading(
      validatedData.value,
      previousReading?.value || null
    )

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Calculate consumption
    const consumption = calculateConsumption(
      validatedData.value,
      previousReading?.value || null
    )

    // Process image with OCR if photoUrl is provided
    let ocrConfidence: number | undefined
    let isOCRProcessed = false

    if (validatedData.photoUrl) {
      try {
        const ocrResult = await processMeterImage(
          validatedData.photoUrl,
          meter.type as "ELECTRICITY" | "WATER" | "GAS"
        )
        ocrConfidence = ocrResult.confidence
        isOCRProcessed = true
      } catch (ocrError) {
        console.warn("OCR processing failed:", ocrError)
        // Continue even if OCR fails
      }
    }

    // Create reading
    const reading = await prisma.meterReading.create({
      data: {
        meterId: validatedData.meterId,
        leaseId: validatedData.leaseId,
        submittedBy: session.user.id,
        readingType: validatedData.readingType,
        value: validatedData.value,
        consumption,
        photoUrl: validatedData.photoUrl,
        isOCRProcessed,
        ocrConfidence,
        readingDate: validatedData.readingDate
          ? new Date(validatedData.readingDate)
          : new Date(),
        periodStart: validatedData.periodStart
          ? new Date(validatedData.periodStart)
          : null,
        periodEnd: validatedData.periodEnd
          ? new Date(validatedData.periodEnd)
          : null,
        notes: validatedData.notes,
        verified: session.user.role !== "RENTER", // Auto-verify if not from renter
      },
      include: {
        meter: {
          select: {
            id: true,
            type: true,
            pricePerUnit: true,
          },
        },
      },
    })

    // Auto-generate bill for the tenant when reading is submitted
    if (consumption > 0 && validatedData.leaseId) {
      try {
        // Calculate the cost using Romanian formulas
        const cost = calculateUtilityCost(consumption, meter.type, meter.pricePerUnit)

        // Get or create the current period bill for this lease
        const periodStart = validatedData.periodStart
          ? new Date(validatedData.periodStart)
          : new Date()
        const periodEnd = validatedData.periodEnd
          ? new Date(validatedData.periodEnd)
          : new Date()
        const dueDate = new Date()
        dueDate.setDate(dueDate.getDate() + 15) // 15 days due date

        // Check if there's an existing bill for this period and type
        const existingBill = await prisma.bill.findFirst({
          where: {
            leaseId: validatedData.leaseId,
            type: meter.type.toLowerCase(),
            periodStart,
            periodEnd,
          },
        })

        if (existingBill) {
          // Update existing bill
          await prisma.bill.update({
            where: { id: existingBill.id },
            data: {
              amount: { increment: cost },
              meterReadingsBreakdown: {
                ...(existingBill.meterReadingsBreakdown as any || {}),
                [meter.type]: {
                  consumption,
                  cost,
                  previousReading: previousReading?.value || 0,
                  currentReading: validatedData.value,
                },
              },
            },
          })
        } else {
          // Create new bill
          await prisma.bill.create({
            data: {
              leaseId: validatedData.leaseId,
              type: meter.type.toLowerCase(),
              description: `Utility bill for ${meter.type} - ${validatedData.readingType.toLowerCase()} reading`,
              amount: cost,
              currency: "RON",
              periodStart,
              periodEnd,
              dueDate,
              paid: false,
              meterReadingsBreakdown: {
                [meter.type]: {
                  consumption,
                  cost,
                  previousReading: previousReading?.value || 0,
                  currentReading: validatedData.value,
                },
              },
            },
          })
        }
      } catch (billError) {
        console.error("Error generating bill:", billError)
        // Don't fail the reading if bill generation fails
      }
    }

    return NextResponse.json(reading, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error("Error creating meter reading:", error)
    return NextResponse.json(
      { error: "Failed to create meter reading" },
      { status: 500 }
    )
  }
}
