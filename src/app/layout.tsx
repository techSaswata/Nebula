import type { Metadata } from "next"
import '@/styles/globals.css'
import RootLayoutContent from '@/components/layouts/RootLayoutContent'

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
      <body suppressHydrationWarning>
        <RootLayoutContent>{children}</RootLayoutContent>
      </body>
    </html>
  )
} 