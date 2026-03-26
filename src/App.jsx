'use client'

import { useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { brandContent } from './content'
import CreaiLogo from './CreaiLogo'

const landingScanLines = [
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
}

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    document.title = 'CREAI | Imagine Beyond'
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncPreference = () => setReducedMotion(media.matches)

    syncPreference()
    setIsLoaded(true)
    media.addEventListener('change', syncPreference)

    return () => media.removeEventListener('change', syncPreference)
  }, [])

  useEffect(() => {
    if (reducedMotion) return undefined

    const ctx = gsap.context(() => {
      gsap.to('.landing-ambient-one', {
        xPercent: 10,
        yPercent: 8,
        scale: 1.08,
        rotation: 8,
        duration: 14,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })

      gsap.to('.landing-ambient-two', {
        xPercent: -12,
        yPercent: -10,
        scale: 1.14,
        rotation: -10,
        duration: 16,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })

      gsap.to('.landing-ambient-three', {
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
    <main className={`landing-shell ${isLoaded ? 'is-loaded' : ''}`}>
      <div className="landing-noise" aria-hidden="true" />
      <div className="landing-grid-field" aria-hidden="true" />
      <div className="landing-ambient landing-ambient-one" aria-hidden="true" />
      <div className="landing-ambient landing-ambient-two" aria-hidden="true" />
      <div className="landing-ambient landing-ambient-three" aria-hidden="true" />
      <div className="landing-line-cluster" aria-hidden="true">
        {landingScanLines.map((line, index) => (
          <span
            key={`landing-${line.left}-${index}`}
            className="landing-scan-line"
            style={{
              '--line-left': line.left,
              '--line-duration': line.duration,
              '--line-delay': line.delay,
              '--line-opacity': line.strength,
            }}
          />
        ))}
      </div>

      <section className="landing-hero">
        <div className="landing-hero-visual">
          <div className="landing-logo-stage">
            <CreaiLogo />
          </div>
          <p className="landing-hero-eyebrow">{brandContent.eyebrow}</p>
          <p className="landing-logo-caption">{brandContent.caption}</p>
        </div>

        <div className="landing-hero-copy">
          <div className="landing-social-list" aria-label="Social links">
            {brandContent.socialLinks.map((item) => (
              <a key={item.label} href={item.url} target="_blank" rel="noreferrer" aria-label={item.label}>
                <span className="social-icon">{socialIcons[item.label]}</span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
