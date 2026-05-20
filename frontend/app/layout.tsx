import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "NexoraSpace — AI Research OS",
  description: "Your AI-powered research operating system",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}