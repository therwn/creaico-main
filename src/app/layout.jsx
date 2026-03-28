import './globals.css'
import { DM_Sans } from 'next/font/google'
import ThemeProviders from '../components/providers/ThemeProviders'

const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata = {
  title: 'CREAI | Imagine Beyond',
  description: 'CREAI landing page, app directory, and admin workspace.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${dmSans.className} antialiased dark:bg-ink-950`}>
      <body>
        <ThemeProviders>{children}</ThemeProviders>
      </body>
    </html>
  )
}
