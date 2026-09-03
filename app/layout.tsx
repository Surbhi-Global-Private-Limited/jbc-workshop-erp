export const metadata = {
  title: 'JBC Workshop ERP',
  description: 'Surbhi Global PVT Ltd - Workshop Management System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className="bg-slate-100 text-slate-800 antialiased font-sans">
        {children}
      </body>
    </html>
  )
}
