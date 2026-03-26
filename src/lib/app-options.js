export const stackOptions = [
  'OpenAI',
  'Supabase',
  'Firebase',
  'Stripe',
  'Postgres',
  'Cloudflare',
  'Cloudflare Workers',
  'Node.js',
  'TypeScript',
  'React',
  'Next.js',
  'Analytics',
  'Automation',
  'Voice',
  'AI Search',
  'Payments',
]

export const frameworkOptions = [
  'SwiftUI',
  'UIKit',
  'Combine',
  'WidgetKit',
  'StoreKit',
  'Core Data',
  'CloudKit',
  'HealthKit',
  'AVFoundation',
  'Vision',
  'VisionKit',
  'Core ML',
  'MapKit',
  'ActivityKit',
  'App Intents',
]

export const socialFieldOptions = [
  { key: 'website', label: 'Website' },
  { key: 'x', label: 'X' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'github', label: 'GitHub' },
  { key: 'linkedin', label: 'LinkedIn' },
]

export const storeFieldOptions = [
  { key: 'app_store', label: 'App Store' },
  { key: 'google_play', label: 'Google Play' },
  { key: 'web_app', label: 'Web App' },
]

export const dashboardSections = [
  { value: 'overview', label: 'Overview', href: '/admin/dashboard' },
  { value: 'recent-updates', label: 'Recent Updates', href: '/admin/dashboard/recent-updates' },
  { value: 'categories', label: 'Categories', href: '/admin/dashboard/categories' },
  { value: 'quick-actions', label: 'Quick Actions', href: '/admin/dashboard/quick-actions' },
  { value: 'recent-activity', label: 'Recent Activity', href: '/admin/dashboard/recent-activity' },
  { value: 'activity-timeline', label: 'Activity Timeline', href: '/admin/dashboard/activity-timeline' },
]

export function createEmptyAppForm() {
  return {
    name: '',
    slug: '',
    shortDescription: '',
    description: '',
    categoryId: '',
    stacks: [],
    frameworks: [],
    accentColor: '#c2ff29',
    status: 'draft',
    socialLinks: {
      website: '',
      x: '',
      instagram: '',
      github: '',
      linkedin: '',
    },
    storeLinks: {
      app_store: '',
      google_play: '',
      web_app: '',
    },
    logoFile: null,
    logoUrl: '',
  }
}
