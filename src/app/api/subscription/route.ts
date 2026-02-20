import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { createCheckoutSession, calculateSubscription, canAddProperty } from "@/lib/stripe"
import { z } from "zod"

const createSubscriptionSchema = z.object({
  propertiesCount: z.coerce.number().int().positive().max(100),
})

// POST - Create subscription checkout session
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createSubscriptionSchema.parse(body)

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        stripeCustomerId: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user can add this many properties
    const eligibility = await canAddProperty(session.user.id)
    
    // Calculate pricing
    const pricing = calculateSubscription(validatedData.propertiesCount)

    // Create Stripe checkout session
    const checkoutUrl = await createCheckoutSession({
      userId: user.id,
      email: user.email,
      propertiesCount: validatedData.propertiesCount,
      successUrl: `${process.env.NEXTAUTH_URL}/dashboard/subscription?success=true`,
      cancelUrl: `${process.env.NEXTAUTH_URL}/dashboard/subscription?canceled=true`,
    })

    return NextResponse.json({
      checkoutUrl,
      pricing: {
        paidProperties: pricing.paidProperties,
        coveredProperties: pricing.coveredProperties,
        totalAmount: pricing.totalAmount,
        currency: "EUR",
        billingPeriod: "yearly",
        bogoDeal: true,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error("Error creating subscription:", error)
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    )
  }
}

// GET - Get current subscription status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { prisma } = await import("@/lib/prisma")
    
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            stripeCustomerId: true,
          },
        },
      },
    })

    // Get current properties count
    const propertiesCount = await prisma.property.count({
      where: { managerId: session.user.id },
    })

    if (!subscription) {
      return NextResponse.json({
        hasSubscription: false,
        status: "INACTIVE",
        propertiesCount,
        trialProperties: 1,
        message: "Start with 1 property free, then upgrade for unlimited",
      })
    }

    // Check if subscription is expired
    const now = new Date()
    const isExpired = subscription.currentPeriodEnd 
      ? subscription.currentPeriodEnd < now 
      : false

    return NextResponse.json({
      hasSubscription: true,
      status: isExpired ? "EXPIRED" : subscription.status,
      paidProperties: subscription.paidProperties,
      coveredProperties: subscription.coveredProperties,
      propertiesCount,
      remainingSlots: Math.max(0, subscription.coveredProperties - propertiesCount),
      currentPeriodEnd: subscription.currentPeriodEnd,
      currentPeriodStart: subscription.currentPeriodStart,
      pricePerProperty: subscription.pricePerProperty / 100, // Convert from cents
      currency: subscription.currency,
      stripeCustomerId: subscription.user.stripeCustomerId,
    })
  } catch (error) {
    console.error("Error fetching subscription:", error)
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    )
  }
}
