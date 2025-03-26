"use client"

import { Inter } from "next/font/google"
import { Toaster } from "sonner"
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import Navbar from '@/components/shared/Navbar'
import { AuthProvider } from "@/contexts/AuthContext"
import { usePathname } from 'next/navigation'

const inter = Inter({ subsets: ["latin"] })

export default function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hideNavbarRoutes = ['/exam', '/interview']
  const shouldHideNavbar = hideNavbarRoutes.some(route => pathname?.startsWith(route))

  return (
    <div className={inter.className}>
      <AuthProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Toaster position="top-center" />
          {!shouldHideNavbar && <Navbar />}
          <main className={`min-h-screen ${!shouldHideNavbar ? 'pt-16' : ''} bg-background`}>
            {children}
          </main>
        </ThemeProvider>
      </AuthProvider>
    </div>
  )
} 