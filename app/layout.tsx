import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sentimo',
  description: 'AI-Powered Journal',
  icons: {
    icon: '/sentimo2.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
