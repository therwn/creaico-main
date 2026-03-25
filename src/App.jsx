import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { brandContent } from './content'
import CreaiLogo from './CreaiLogo'

const scanLines = [
  { left: '10%', duration: '8.8s', delay: '1.7s', strength: 0.62 },
  { left: '30%', duration: '10.4s', delay: '0.4s', strength: 0.78 },
  { left: '50%', duration: '7.6s', delay: '2.9s', strength: 0.52 },
  { left: '70%', duration: '9.2s', delay: '1.1s', strength: 0.72 },
  { left: '90%', duration: '8.1s', delay: '3.6s', strength: 0.58 },
]

const socialIcons = {
  Instagram: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3.25" y="3.25" width="17.5" height="17.5" rx="5.25" />
      <circle cx="12" cy="12" r="4.25" />
      <circle cx="17.25" cy="6.75" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  ),
  X: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 4L10.8 13.1L4.7 20H7.4L12 14.8L15.9 20H20L12.8 10.4L18.5 4H15.8L11.6 8.7L8.1 4Z" />
    </svg>
  ),
  LinkedIn: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.53 8.84V20H3.06V8.84H6.53ZM6.76 5.39C6.76 6.39 6 7.19 4.8 7.19H4.78C3.62 7.19 2.86 6.39 2.86 5.39C2.86 4.37 3.64 3.6 4.82 3.6C6 3.6 6.74 4.37 6.76 5.39ZM21 13.13V20H17.54V13.53C17.54 11.91 16.96 10.8 15.5 10.8C14.39 10.8 13.73 11.55 13.44 12.27C13.35 12.49 13.33 12.8 13.33 13.12V20H9.87C9.87 20 9.91 9.05 9.87 8.84H13.33V10.42C13.79 9.66 14.62 8.58 16.93 8.58C19.79 8.58 21 10.45 21 13.13Z" />
    </svg>
  ),
}

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncPreference = () => setReducedMotion(media.matches)

    syncPreference()
    setIsLoaded(true)

    media.addEventListener('change', syncPreference)

    return () => {
      media.removeEventListener('change', syncPreference)
    }
  }, [])

  useEffect(() => {
    if (reducedMotion) {
      return undefined
    }

    const ctx = gsap.context(() => {
      gsap.to('.ambient-one', {
        xPercent: 10,
        yPercent: 8,
        scale: 1.08,
        rotation: 8,
        duration: 14,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })

      gsap.to('.ambient-two', {
        xPercent: -12,
        yPercent: -10,
        scale: 1.14,
        rotation: -10,
        duration: 16,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })

      gsap.to('.ambient-three', {
        xPercent: 6,
        yPercent: -7,
        scale: 1.18,
        opacity: 0.78,
        rotation: 6,
        duration: 12,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })
    })

    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <main className={`page-shell ${isLoaded ? 'is-loaded' : ''}`}>
      <div className="noise" aria-hidden="true" />
      <div className="grid-field" aria-hidden="true" />
      <div
        className="ambient ambient-one"
        aria-hidden="true"
      />
      <div
        className="ambient ambient-two"
        aria-hidden="true"
      />
      <div
        className="ambient ambient-three"
        aria-hidden="true"
      />
      <div
        className="line-cluster line-cluster-drift"
        aria-hidden="true"
      >
        {scanLines.map((line, index) => (
          <span
            key={`drift-${line.left}-${index}`}
            className="scan-line"
            style={{
              '--line-left': line.left,
              '--line-duration': line.duration,
              '--line-delay': line.delay,
              '--line-opacity': line.strength,
            }}
          />
        ))}
      </div>

      <section className="hero">
        <div className="hero-visual">
          <div className="logo-stage">
            <CreaiLogo />
          </div>
          <p className="hero-eyebrow">{brandContent.eyebrow}</p>
          <p className="logo-caption">{brandContent.caption}</p>
        </div>

        <div className="hero-copy">
          <div className="cta-row">
            <div className="social-list" aria-label="Social links">
              {brandContent.socialLinks.map((item) => (
                <a key={item.label} href={item.url} target="_blank" rel="noreferrer" aria-label={item.label}>
                  <span className="social-icon">{socialIcons[item.label]}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
