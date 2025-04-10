import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/navbar"
import { Analytics } from "@vercel/analytics/react"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "言磎精品中文",
  description: "快乐学习中文",
  viewport: "width=device-width, initial-scale=1, shrink-to-fit=no"
}
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* ADDED: Proper viewport meta tag to control scaling */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
      </head>
      <body className={`${inter.className} overflow-x-hidden w-full`} suppressHydrationWarning>
        {/* ADDED: w-full class to ensure body takes full width */}
        {/* ADDED: overflow-x-hidden to prevent horizontal scrolling */}
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <div className="flex min-h-screen flex-col w-full">
            {/* ADDED: w-full class to ensure layout container takes full width */}
            <Navbar />
            <main className="flex-1 w-full">{children}</main>
            {/* ADDED: w-full class to ensure main content takes full width */}
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
