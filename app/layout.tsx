import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/providers/auth-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "VanshVriksh - Family Tree Management Platform",
  description:
    "A modern, secure, and intuitive family tree management platform built with Next.js 14",
  keywords: ["family tree", "genealogy", "family management", "ancestry"],
  authors: [{ name: "Vaibhav Kotiyal" }],
  openGraph: {
    title: "VanshVriksh - Family Tree Management Platform",
    description: "Create and manage your family tree with ease",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
