import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
//import { Analytics } from '@vercel/analytics/react'

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "PDF Scanner Web",
  description: "Free online PDF tools for all your document needs",
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body className={`antialiased min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
        {/* <Analytics /> */}
      </body>
    </html>
  )
}

