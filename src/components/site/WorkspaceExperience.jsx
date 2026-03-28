'use client'

import { useEffect } from 'react'
import PublicDirectory from './PublicDirectory'
import AppDetailView from './AppDetailView'
import AdminWorkspace from './admin/AdminWorkspace'

function getDocumentTitle(path) {
  if (path.startsWith('/admin')) return 'CREAI Admin'
  if (path.startsWith('/apps/')) return 'CREAI App'
  return 'CREAI App Directory'
}

export default function WorkspaceExperience({ route }) {
  const path = route.path || '/'
  const detailSlug = path.startsWith('/apps/') ? path.split('/')[2] : null
  const isAdminRoute = path === '/admin' || path.startsWith('/admin/')

  useEffect(() => {
    document.title = getDocumentTitle(path)
  }, [path])

  if (isAdminRoute) {
    return <AdminWorkspace route={route} />
  }

  if (detailSlug) {
    return <PublicDirectory publicRoot={route.publicRoot} detailSlug={detailSlug} />
  }

  return <PublicDirectory publicRoot={route.publicRoot} />
}
