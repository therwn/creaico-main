'use client'

import LandingExperience from './components/landing/LandingExperience'
import WorkspaceExperience from './components/site/WorkspaceExperience'
import { resolveSiteRoute } from './lib/site-routing'

export default function App({ initialPath = '/', initialHost = '' }) {
  const route = resolveSiteRoute(initialHost, initialPath)

  if (route.surface === 'landing') {
    return <LandingExperience />
  }

  return <WorkspaceExperience route={route} />
}
