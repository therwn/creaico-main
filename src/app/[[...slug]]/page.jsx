import { headers } from 'next/headers'
import App from '../../App'

export const runtime = 'edge'

export default function CatchAllPage({ params }) {
  const pathname = `/${(params.slug || []).join('/')}`.replace(/\/+$/, '') || '/'
  const host = headers().get('host')?.toLowerCase() || ''

  return <App initialPath={pathname} initialHost={host} />
}
