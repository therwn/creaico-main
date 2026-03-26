function normalizeHost(host = '') {
  return host.toLowerCase().replace(/:\d+$/, '')
}

function normalizePath(path = '/') {
  return path.replace(/\/+$/, '') || '/'
}

export function resolveSiteRoute(initialHost = '', initialPath = '/') {
  const host = normalizeHost(initialHost)
  const path = normalizePath(initialPath)
  const isAppHost = host === 'app.creai.co'
  const isLocalWorkspacePath =
    path === '/directory' ||
    path.startsWith('/directory/') ||
    path === '/admin' ||
    path.startsWith('/admin/') ||
    path.startsWith('/apps/')

  if (!isAppHost && !isLocalWorkspacePath) {
    return {
      surface: 'landing',
      host,
      path,
      publicRoot: '/directory',
    }
  }

  let workspacePath = path

  if (!isAppHost && (path === '/directory' || path.startsWith('/directory/'))) {
    workspacePath = path.replace(/^\/directory/, '') || '/'
  }

  return {
    surface: 'workspace',
    host,
    path: workspacePath,
    isAppHost,
    publicRoot: isAppHost ? '/' : '/directory',
  }
}
