import { z } from "zod"

/**
 * Environment Configuration
 *
 * This module provides type-safe access to environment variables.
 * It validates all required variables at build time and runtime.
 *
 * Environment files (in order of precedence):
 * - .env.local           → Local development (gitignored)
 * - .env.production.local → Test production config locally (gitignored)
 * - .env                  → Shared defaults (committed)
 *
 * For Vercel deployment:
 * - Production variables are set in Vercel Dashboard → Settings → Environment Variables
 */

// Schema for server-side environment variables (private)
const serverEnvSchema = z.object({
  // Database
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid PostgreSQL URL"),

  // Authentication
  NEXTAUTH_SECRET: z.string().min(32, "NEXTAUTH_SECRET must be at least 32 characters"),

  // Cloudinary (server-side)
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),
  CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET is required"),

  // Node environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
})

// Schema for client-side environment variables (public - NEXT_PUBLIC_ prefix)
const clientEnvSchema = z.object({
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z
    .string()
    .min(1, "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is required"),
  NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: z
    .string()
    .min(1, "NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET is required"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
})

// Combined schema
const envSchema = serverEnvSchema.merge(clientEnvSchema)

// Type definitions
export type ServerEnv = z.infer<typeof serverEnvSchema>
export type ClientEnv = z.infer<typeof clientEnvSchema>
export type Env = z.infer<typeof envSchema>

/**
 * Validates and returns environment variables.
 * Throws descriptive errors if validation fails.
 */
function validateEnv(): Env {
  const envVars = {
    // Server
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    // Client
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL,
  }

  const result = envSchema.safeParse(envVars)

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors
    const errorMessages = Object.entries(errors)
      .map(([field, messages]) => `  ${field}: ${messages?.join(", ")}`)
      .join("\n")

    throw new Error(
      `\n❌ Invalid environment variables:\n${errorMessages}\n\n` +
        `💡 Make sure you have a .env.local file with all required variables.\n` +
        `   See .env.example for the template.\n`
    )
  }

  return result.data
}

/**
 * Validated environment variables.
 * Use this throughout your application for type-safe access.
 *
 * @example
 * import { env } from '@/lib/env';
 * const dbUrl = env.DATABASE_URL;
 */
export const env = validateEnv()

/**
 * Log environment info on server startup (no sensitive data)
 */
function logEnvironmentInfo(): void {
  // Only log on server-side and in development
  if (typeof window !== "undefined") return

  try {
    const dbHost = new URL(env.DATABASE_URL).host
    const isLocalDb = dbHost === "localhost" || dbHost.startsWith("127.0.0.1")
    const envName = isLocalDb ? "LOCAL" : "PRODUCTION"

    console.log("\n┌─────────────────────────────────────────┐")
    console.log("│           Environment Info              │")
    console.log("├─────────────────────────────────────────┤")
    console.log(`│  Environment:  ${envName.padEnd(24)}│`)
    console.log(`│  App URL:      ${env.NEXT_PUBLIC_APP_URL.padEnd(24).slice(0, 24)}│`)
    console.log(
      `│  Database:     ${(isLocalDb ? "localhost" : dbHost.split(".")[0]).padEnd(24).slice(0, 24)}│`
    )
    console.log(
      `│  Cloudinary:   ${env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.padEnd(24).slice(0, 24)}│`
    )
    console.log("└─────────────────────────────────────────┘\n")
  } catch {
    // Silently fail if URL parsing fails
  }
}

// Log on module load (server startup)
logEnvironmentInfo()

/**
 * Client-safe environment variables.
 * Only includes NEXT_PUBLIC_ prefixed variables.
 * Safe to use in client components.
 */
export const clientEnv: ClientEnv = {
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
  NEXT_PUBLIC_APP_URL: env.NEXT_PUBLIC_APP_URL,
}

/**
 * Helper to check if we're in development mode
 */
export const isDevelopment = env.NODE_ENV === "development"

/**
 * Helper to check if we're in production mode
 */
export const isProduction = env.NODE_ENV === "production"

/**
 * Helper to check if we're in test mode
 */
export const isTest = env.NODE_ENV === "test"
