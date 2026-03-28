import './globals.css'
import { GeistSans } from 'geist/font/sans'
import ThemeProviders from '../components/providers/ThemeProviders'

export const metadata = {
  title: 'CREAI | Imagine Beyond',
  description: 'CREAI landing page, app directory, and admin workspace.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.className} antialiased dark:bg-ink-950`}>
      <body>
        <ThemeProviders>{children}</ThemeProviders>
      </body>
    </html>
  )
}
