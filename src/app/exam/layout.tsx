import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Exam - AcademiX",
  description: "Take your exam on AcademiX",
}

export default function ExamLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
} 