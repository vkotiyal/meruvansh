import { prisma } from "@/lib/prisma"

/**
 * Generate a suggested family code based on tree name
 * Example: "Smith Family Tree" -> "smith2026"
 */
export function generateFamilyCode(treeName: string): string {
  // Extract base name (remove common words and keep alphanumeric only)
  const base = treeName
    .toLowerCase()
    .replace(/family|tree|vansh|vriksh/gi, "")
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 15)

  const year = new Date().getFullYear()

  // If base is too short, use a generic prefix
  if (base.length < 3) {
    return `family${year}`
  }

  return `${base}${year}`
}

/**
 * Check if a family code is unique across the platform
 */
export async function isCodeUnique(code: string): Promise<boolean> {
  const cleanCode = code.toLowerCase().trim()

  const existing = await prisma.viewerAccess.findUnique({
    where: { familyCode: cleanCode },
  })

  return !existing
}

/**
 * Generate a unique family code by appending numbers if needed
 */
export async function generateUniqueFamilyCode(treeName: string): Promise<string> {
  const baseCode = generateFamilyCode(treeName)

  // If the base code is already unique, return it
  if (await isCodeUnique(baseCode)) {
    return baseCode
  }

  // Otherwise, append numbers until we find a unique code
  let counter = 1
  while (counter < 100) {
    const candidateCode = `${baseCode}${counter}`
    if (await isCodeUnique(candidateCode)) {
      return candidateCode
    }
    counter++
  }

  // Fallback: use timestamp
  return `${baseCode}${Date.now().toString().slice(-6)}`
}
