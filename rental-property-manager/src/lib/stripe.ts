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
        // Note: Subscription and Payment models need to be added to Prisma schema
        // const { prisma } = await import("@/lib/prisma")

        // TODO: Update or create subscription in database when models are added
        console.log("Subscription checkout completed:", {
          userId,
          paidProperties,
          coveredProperties,
          stripeSubscriptionId: session.subscription,
        })

        // TODO: Create payment record when Payment model is added
        console.log("Payment recorded:", {
          userId,
          amount: session.amount_total,
          currency: session.currency,
        })

        // TODO: Update properties to mark them as covered by subscription when models are updated
      }

      break
    }
    
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription

      // Note: Subscription model needs to be added to Prisma schema
      // const { prisma } = await import("@/lib/prisma")
      
      // TODO: Update subscription status when Subscription model is added
      console.log("Subscription updated:", {
        stripeSubscriptionId: subscription.id,
        status: subscription.status,
      })

      break
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription

      // Note: Subscription model needs to be added to Prisma schema
      // const { prisma } = await import("@/lib/prisma")

      // TODO: Update subscription status when Subscription model is added
      console.log("Subscription deleted:", {
        stripeSubscriptionId: subscription.id,
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
  // Note: Subscription model needs to be added to Prisma schema
  // const { prisma } = await import("@/lib/prisma")
  // const subscription = await prisma.subscription.findUnique({ where: { userId } })

  // TODO: Return actual subscription data when model is added
  return null
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
  // Note: This requires Subscription model to be added to Prisma schema
  // For now, return default values

  // Get user's current properties
  const { prisma } = await import("@/lib/prisma")
  const currentProperties = await prisma.property.count({
    where: { managerId: userId },
  })

  // If no subscription, they can only have 1 property (trial)
  return {
    canAdd: currentProperties < 1,
    reason: currentProperties >= 1 ? "Upgrade to add more properties" : undefined,
    currentProperties,
    coveredProperties: 1,
  }
}
