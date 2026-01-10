import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/providers/auth-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  title: {
    default: "VanshVriksh - Family Tree Management Platform",
    template: "%s | VanshVriksh",
  },
  description:
    "Create, manage, and visualize your family tree with VanshVriksh. A modern, secure platform for preserving your family history and genealogy.",
  keywords: [
    "family tree",
    "genealogy",
    "family management",
    "ancestry",
    "family history",
    "genealogy software",
    "family tree builder",
    "pedigree chart",
  ],
  authors: [{ name: "Vaibhav Kotiyal", url: "https://vaibhavkotiyal.com" }],
  creator: "Vaibhav Kotiyal",
  publisher: "Vaibhav Kotiyal",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "VanshVriksh - Family Tree Management Platform",
    description: "Create, manage, and visualize your family tree with ease",
    siteName: "VanshVriksh",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "VanshVriksh - Family Tree Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VanshVriksh - Family Tree Management Platform",
    description: "Create, manage, and visualize your family tree with ease",
    images: ["/og-image.png"],
    creator: "@vkotiyal",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-emerald-600 focus:px-4 focus:py-2 focus:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          Skip to main content
        </a>
        <AuthProvider>
          <main id="main-content">{children}</main>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
