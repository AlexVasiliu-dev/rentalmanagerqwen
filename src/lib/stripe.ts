import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy", {
  apiVersion: "2026-01-28.clover",
  typescript: true,
})

// Pricing configuration
export const PRICING = {
  pricePerProperty: 5000, // 50 EUR in cents
  currency: "EUR",
  billingPeriod: "yearly",
  // Buy one get one free multiplier
  bogoMultiplier: 2,
}

export interface SubscriptionCheckoutParams {
  userId: string
  email: string
  propertiesCount: number
  successUrl: string
  cancelUrl: string
}

export interface SubscriptionData {
  paidProperties: number
  coveredProperties: number
  totalAmount: number
  amountInCents: number
}

/**
 * Calculate subscription pricing with BOGO deal
 * Buy 1 property = Get 2 properties covered
 * Buy 2 properties = Get 4 properties covered
 * etc.
 */
export function calculateSubscription(propertiesCount: number): SubscriptionData {
  // Calculate how many properties need to be paid for
  // With BOGO: paidProperties = ceil(propertiesCount / 2)
  const paidProperties = Math.ceil(propertiesCount / PRICING.bogoMultiplier)
  const coveredProperties = paidProperties * PRICING.bogoMultiplier
  
  const amountInCents = paidProperties * PRICING.pricePerProperty
  const totalAmount = amountInCents / 100 // Convert to EUR
  
  return {
    paidProperties,
    coveredProperties,
    totalAmount,
    amountInCents,
  }
}

/**
 * Create a Stripe Checkout Session for subscription
 */
export async function createCheckoutSession(
  params: SubscriptionCheckoutParams
): Promise<string> {
  const { userId, email, propertiesCount, successUrl, cancelUrl } = params
  
  const pricing = calculateSubscription(propertiesCount)
  
  // Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: PRICING.currency,
          product_data: {
            name: `Property Management Subscription`,
            description: `Manage ${pricing.coveredProperties} properties (${pricing.paidProperties} paid + ${pricing.paidProperties} free with BOGO deal)`,
            metadata: {
              propertiesCount: propertiesCount.toString(),
              paidProperties: pricing.paidProperties.toString(),
              coveredProperties: pricing.coveredProperties.toString(),
              userId,
            },
          },
          unit_amount: PRICING.pricePerProperty,
          recurring: {
            interval: "year",
          },
        },
        quantity: pricing.paidProperties,
      },
    ],
    mode: "subscription",
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: email,
    metadata: {
      userId,
      propertiesCount: propertiesCount.toString(),
      paidProperties: pricing.paidProperties.toString(),
      coveredProperties: pricing.coveredProperties.toString(),
    },
  })
  
  return session.url!
}

/**
 * Create Stripe Customer Portal for subscription management
 */
export async function createCustomerPortalSession(
  customerId: string,
  returnUrl: string
): Promise<string> {
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
  
  return portalSession.url
}

/**
 * Handle Stripe Webhook events
 */
export async function handleWebhookEvent(
  event: Stripe.Event
): Promise<{ success: boolean; message: string }> {
  const eventType = event.type
  
  switch (eventType) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session
      
      if (session.mode === "subscription") {
        const { userId, paidProperties, coveredProperties } = session.metadata || {}
        
        if (!userId) {
          return { success: false, message: "No userId in session metadata" }
        }
        
        // Import prisma here to avoid circular dependencies
        const { prisma } = await import("@/lib/prisma")
        
        // Update or create subscription
        await prisma.subscription.upsert({
          where: { userId },
          update: {
            status: "ACTIVE",
            stripeSubscriptionId: session.subscription as string,
            paidProperties: parseInt(paidProperties || "0"),
            coveredProperties: parseInt(coveredProperties || "0"),
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
          },
          create: {
            userId,
            status: "ACTIVE",
            stripeSubscriptionId: session.subscription as string,
            paidProperties: parseInt(paidProperties || "0"),
            coveredProperties: parseInt(coveredProperties || "0"),
            pricePerProperty: PRICING.pricePerProperty,
            currency: PRICING.currency,
            billingPeriod: PRICING.billingPeriod,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          },
        })
        
        // Create payment record
        await prisma.payment.create({
          data: {
            userId,
            stripePaymentId: session.payment_intent as string || undefined,
            amount: session.amount_total || 0,
            currency: session.currency || "EUR",
            status: "succeeded",
            propertiesCount: parseInt(session.metadata?.propertiesCount || "0"),
            promotionalCredits: parseInt(coveredProperties || "0") - parseInt(paidProperties || "0"),
            periodStart: new Date(),
            periodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          },
        })
        
        // Update properties to mark them as covered by subscription
        const properties = await prisma.property.findMany({
          where: {
            managerId: userId,
          },
          take: parseInt(coveredProperties || "0"),
        })
        
        await prisma.property.updateMany({
          where: {
            id: { in: properties.map(p => p.id) },
          },
          data: {
            isSubscriptionActive: true,
          },
        })
      }
      
      break
    }
    
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription
      
      const { prisma } = await import("@/lib/prisma")
      
      await prisma.subscription.updateMany({
        where: {
          stripeSubscriptionId: subscription.id,
        },
        data: {
          status: subscription.status.toUpperCase() as any,
          currentPeriodStart: (subscription as any).current_period_start
            ? new Date((subscription as any).current_period_start * 1000)
            : undefined,
          currentPeriodEnd: (subscription as any).current_period_end
            ? new Date((subscription as any).current_period_end * 1000)
            : undefined,
        },
      })
      
      break
    }
    
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription
      
      const { prisma } = await import("@/lib/prisma")
      
      await prisma.subscription.updateMany({
        where: {
          stripeSubscriptionId: subscription.id,
        },
        data: {
          status: "CANCELLED",
        },
      })
      
      break
    }
    
    default:
      return { success: true, message: `Unhandled event type: ${eventType}` }
  }
  
  return { success: true, message: "Webhook processed successfully" }
}

/**
 * Get subscription status for a user
 */
export async function getUserSubscription(userId: string) {
  const { prisma } = await import("@/lib/prisma")
  
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  })
  
  if (!subscription) {
    return null
  }
  
  // Check if subscription is still active based on period end
  const now = new Date()
  if (subscription.currentPeriodEnd && subscription.currentPeriodEnd < now) {
    return {
      ...subscription,
      status: "EXPIRED" as const,
    }
  }
  
  return subscription
}

/**
 * Check if user can add more properties based on subscription
 */
export async function canAddProperty(userId: string): Promise<{
  canAdd: boolean
  reason?: string
  currentProperties: number
  coveredProperties: number
}> {
  const { prisma } = await import("@/lib/prisma")
  
  // Get user's subscription
  const subscription = await getUserSubscription(userId)
  
  // Get user's current properties
  const currentProperties = await prisma.property.count({
    where: { managerId: userId },
  })
  
  // If no subscription, they can only have 1 property (trial)
  if (!subscription || subscription.status !== "ACTIVE") {
    return {
      canAdd: currentProperties < 1,
      reason: currentProperties >= 1 ? "Upgrade to add more properties" : undefined,
      currentProperties,
      coveredProperties: 1,
    }
  }
  
  // Check if within subscription limit
  const canAdd = currentProperties < subscription.coveredProperties
  
  return {
    canAdd,
    reason: canAdd ? undefined : `Your subscription covers ${subscription.coveredProperties} properties. Upgrade to add more.`,
    currentProperties,
    coveredProperties: subscription.coveredProperties,
  }
}
