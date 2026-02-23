import { MeterType } from "@prisma/client"

export interface ConsumptionCalculation {
  meterType: MeterType
  previousReading: number | null
  currentReading: number
  consumption: number
  pricePerUnit: number
  total: number
}

export interface BillCalculation {
  periodStart: Date
  periodEnd: Date
  consumptions: ConsumptionCalculation[]
  rentAmount?: number
  totalAmount: number
  currency: string
}

export function calculateConsumption(
  currentReading: number,
  previousReading: number | null
): number {
  if (previousReading === null) {
    return 0 // Initial reading, no consumption yet
  }
  return Math.max(0, currentReading - previousReading)
}

/**
 * Calculate utility cost based on meter type using Romanian formulas:
 * - Energy: meter_difference * 1.16
 * - Gas: meter_difference * 10.813 * 0.25620 * 1.21
 * - Water: [meter_difference * 9.97 + (meter_difference + 1.24)] * 1.11
 */
export function calculateUtilityCost(
  consumption: number,
  meterType: MeterType,
  pricePerUnit?: number
): number {
  let cost: number

  switch (meterType) {
    case "ELECTRICITY":
      // Energy: meter_difference * 1.16
      cost = consumption * 1.16
      break
    case "GAS":
      // Gas: meter_difference * 10.813 * 0.25620 * 1.21
      cost = consumption * 10.813 * 0.25620 * 1.21
      break
    case "WATER":
      // Water: [meter_difference * 9.97 + (meter_difference + 1.24)] * 1.11
      cost = (consumption * 9.97 + (consumption + 1.24)) * 1.11
      break
    default:
      cost = consumption
  }

  return Math.round(cost * 100) / 100 // Round to 2 decimal places
}

export async function getUtilityPrices(): Promise<Record<MeterType, number>> {
  // In production, fetch from database UtilityPrice model
  // For now, return default prices
  return {
    ELECTRICITY: 0.65, // RON per kWh
    WATER: 5.50,       // RON per cubic meter
    GAS: 0.15,         // RON per kWh
  }
}

export function calculateBill(
  readings: ConsumptionCalculation[],
  rentAmount?: number
): BillCalculation {
  const utilitiesTotal = readings.reduce(
    (sum, r) => sum + r.total,
    0
  )

  const totalAmount = (rentAmount || 0) + utilitiesTotal

  return {
    periodStart: new Date(),
    periodEnd: new Date(),
    consumptions: readings,
    rentAmount,
    totalAmount,
    currency: "RON",
  }
}

export function generateBillBreakdown(
  readings: ConsumptionCalculation[]
) {
  return readings.map((r) => ({
    meterType: r.meterType,
    consumption: r.consumption,
    pricePerUnit: r.pricePerUnit,
    total: r.total,
  }))
}

export function calculateProratedRent(
  monthlyRent: number,
  moveInDate: Date,
  monthStart: Date,
  monthEnd: Date
): number {
  const daysInMonth =
    (monthEnd.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24)
  const daysOccupied =
    (monthEnd.getTime() - Math.max(moveInDate.getTime(), monthStart.getTime())) /
    (1000 * 60 * 60 * 24)

  const proratedRent = (monthlyRent * daysOccupied) / daysInMonth
  return Math.round(proratedRent * 100) / 100
}
