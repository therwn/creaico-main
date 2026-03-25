import './globals.css'

export const metadata = {
  title: 'CREAI | Imagine Beyond',
  description: 'CREAI app directory and admin workspace.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
