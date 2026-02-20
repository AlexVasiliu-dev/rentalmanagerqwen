import Tesseract from "tesseract.js"

export interface OCRResult {
  value: number
  confidence: number
  text: string
}

export async function processMeterImage(
  imageUrl: string,
  meterType: "ELECTRICITY" | "WATER" | "GAS"
): Promise<OCRResult> {
  try {
    const {
      data: { text, confidence },
    } = await Tesseract.recognize(imageUrl, "eng", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          console.log(`OCR Progress: ${(m.progress * 100).toFixed(0)}%`)
        }
      },
    })

    // Extract numbers from the text
    const numbers = text.match(/[\d.]+/g)
    
    if (!numbers || numbers.length === 0) {
      throw new Error("No numbers detected in the image")
    }

    // Take the largest number (likely the meter reading)
    const value = Math.max(...numbers.map((n) => parseFloat(n)))

    if (isNaN(value)) {
      throw new Error("Could not parse meter reading from image")
    }

    return {
      value,
      confidence: confidence / 100, // Normalize to 0-1
      text: text.trim(),
    }
  } catch (error) {
    console.error("OCR processing error:", error)
    throw new Error("Failed to process meter image")
  }
}

export function validateMeterReading(
  value: number,
  previousValue: number | null
): { valid: boolean; error?: string } {
  if (value < 0) {
    return { valid: false, error: "Reading cannot be negative" }
  }

  if (previousValue !== null && value < previousValue) {
    return {
      valid: false,
      error: "Reading cannot be lower than previous reading",
    }
  }

  // Check for unreasonable jumps (more than 10x average consumption)
  if (previousValue !== null) {
    const consumption = value - previousValue
    const maxReasonableConsumption = 10000 // Adjust based on meter type
    if (consumption > maxReasonableConsumption) {
      return {
        valid: false,
        error: "Unusually high consumption detected. Please verify the reading.",
      }
    }
  }

  return { valid: true }
}
