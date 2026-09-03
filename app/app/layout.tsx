import './globals.css'

export const metadata = {
  title: 'JBC Workshop ERP',
  description: 'Workshop Management System - Surbhi Global PVT Ltd',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
