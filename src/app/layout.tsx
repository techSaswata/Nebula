import type { Metadata } from "next"
import { Inter } from "next/font/google"
import '@/styles/globals.css'
import { Toaster } from "sonner"
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import Navbar from '@/components/shared/Navbar'
import { AuthProvider } from "@/contexts/AuthContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AcademiX",
  description: "Comprehensive preparation resources for Scaler School of Technology NSET exam",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Toaster position="top-center" />
            <Navbar />
            <main className="min-h-screen pt-16 bg-background">
              {children}
            </main>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
} 