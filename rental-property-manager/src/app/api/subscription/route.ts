import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

// Pricing constants
const PRICE_PER_PROPERTY = 50 // EUR per year
const BOGO_MULTIPLIER = 2 // Buy 1 Get 1 Free
const TRIAL_DAYS = 15

// GET - Get user subscription status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Get user with subscription details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        ownerSlug: true,
        companyName: true,
        subscriptionType: true,
        subscriptionStatus: true,
        subscriptionStart: true,
        subscriptionEnd: true,
        paidProperties: true,
        coveredProperties: true,
        managedProperties: {
          select: { id: true, available: true },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const propertiesCount = user.managedProperties.length
    const coveredProperties = user.coveredProperties || (user.subscriptionType === "free" ? 1 : 0)
    const paidProperties = user.paidProperties || 0
    const remainingSlots = Math.max(0, coveredProperties - propertiesCount)

    // Calculate next payment due date
    let nextPaymentDue = user.subscriptionEnd
    if (user.subscriptionType === "trial" && user.subscriptionEnd) {
      // Trial ends soon, payment due at end of trial
      nextPaymentDue = user.subscriptionEnd
    }

    // Calculate amount paid
    let amountPaid = 0
    if (user.subscriptionType === "yearly" && paidProperties) {
      amountPaid = paidProperties * PRICE_PER_PROPERTY
    }

    return NextResponse.json({
      hasSubscription: user.subscriptionType !== "free" && user.subscriptionType !== null,
      status: user.subscriptionStatus?.toUpperCase() || "FREE",
      subscriptionType: user.subscriptionType || "free",
      propertiesCount,
      coveredProperties,
      paidProperties,
      remainingSlots,
      currentPeriodStart: user.subscriptionStart?.toISOString() || null,
      currentPeriodEnd: user.subscriptionEnd?.toISOString() || null,
      nextPaymentDue: nextPaymentDue?.toISOString() || null,
      amountPaid,
      pricePerProperty: PRICE_PER_PROPERTY,
      currency: "EUR",
      trialProperties: TRIAL_DAYS,
      message: getSubscriptionMessage(user.subscriptionType, propertiesCount, coveredProperties),
    })
  } catch (error) {
    console.error("Error fetching subscription:", error)
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    )
  }
}

// POST - Create/update subscription (payment)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const body = await request.json()
    const { propertiesCount } = body

    if (!propertiesCount || propertiesCount < 1) {
      return NextResponse.json(
        { error: "Invalid properties count" },
        { status: 400 }
      )
    }

    // Calculate pricing with BOGO
    const paidProperties = Math.ceil(propertiesCount / BOGO_MULTIPLIER)
    const coveredProperties = paidProperties * BOGO_MULTIPLIER
    const totalAmount = paidProperties * PRICE_PER_PROPERTY

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update user subscription
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionType: "yearly",
        subscriptionStatus: "active",
        subscriptionStart: new Date(),
        subscriptionEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        paidProperties,
        coveredProperties,
      },
    })

    // In production, this would create a Stripe checkout session
    // For now, we'll return a mock checkout URL
    return NextResponse.json({
      success: true,
      message: "Subscription updated successfully",
      checkoutUrl: null, // Would be Stripe URL in production
      subscription: {
        paidProperties,
        coveredProperties,
        totalAmount,
        currency: "EUR",
        billingPeriod: "yearly",
        nextBillingDate: updatedUser.subscriptionEnd,
      },
    })
  } catch (error) {
    console.error("Error creating subscription:", error)
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    )
  }
}

// Helper function to get subscription message
function getSubscriptionMessage(
  subscriptionType: string | null,
  propertiesCount: number,
  coveredProperties: number
): string {
  if (!subscriptionType || subscriptionType === "free") {
    return "Abonament gratuit pentru 1 proprietate"
  }
  if (subscriptionType === "trial") {
    return `Perioadă de probă pentru ${propertiesCount} proprietăți`
  }
  if (subscriptionType === "yearly") {
    return `Abonament anual pentru ${coveredProperties} proprietăți`
  }
  return "Abonament activ"
}
