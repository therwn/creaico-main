import './globals.css'

export const metadata = {
  title: 'CREAI | Imagine Beyond',
  description: 'CREAI creative AI studio landing page.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
