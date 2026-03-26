import './globals.css'
import ThemeProviders from '../components/providers/ThemeProviders'

export const metadata = {
  title: 'CREAI | Imagine Beyond',
  description: 'CREAI landing page, app directory, and admin workspace.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProviders>{children}</ThemeProviders>
      </body>
    </html>
  )
}
