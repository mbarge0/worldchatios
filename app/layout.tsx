import MotionWrapper from "@/tools/foundry-motion/MotionWrapper"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Foundry Core v2",
  description: "Reusable development framework with automation and verification",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        {/* Foundry Motion System: placeholder mount for future animations/effects */}
        <div id="foundry-motion-root" style={{ display: 'contents' }} />
        <MotionWrapper preset="fadeIn">
          {children}
        </MotionWrapper>
      </body>
    </html>
  )
}