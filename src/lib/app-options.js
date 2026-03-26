import {
  AppleLight,
  Cloudflare,
  CloudflareWorkers,
  Firebase,
  Nextjs,
  Nodejs,
  OpenAILight,
  PostgreSQL,
  ReactLight,
  Stripe,
  Supabase,
  Swift,
  TypeScript,
} from '@ridemountainpig/svgl-react'
import {
  RiApps2Line,
  RiBrainLine,
  RiLineChartLine,
  RiMapPin2Line,
  RiRobot2Line,
  RiSparklingLine,
  RiStackLine,
  RiVoiceprintLine,
} from '@remixicon/react'

export const stackOptions = [
  { value: 'OpenAI', label: 'OpenAI', icon: OpenAILight },
  { value: 'Supabase', label: 'Supabase', icon: Supabase },
  { value: 'Firebase', label: 'Firebase', icon: Firebase },
  { value: 'Stripe', label: 'Stripe', icon: Stripe },
  { value: 'Postgres', label: 'Postgres', icon: PostgreSQL },
  { value: 'Cloudflare', label: 'Cloudflare', icon: Cloudflare },
  { value: 'Cloudflare Workers', label: 'Cloudflare Workers', icon: CloudflareWorkers },
  { value: 'Node.js', label: 'Node.js', icon: Nodejs },
  { value: 'TypeScript', label: 'TypeScript', icon: TypeScript },
  { value: 'React', label: 'React', icon: ReactLight },
  { value: 'Next.js', label: 'Next.js', icon: Nextjs },
  { value: 'Analytics', label: 'Analytics', icon: RiLineChartLine },
  { value: 'Automation', label: 'Automation', icon: RiRobot2Line },
  { value: 'Voice', label: 'Voice', icon: RiVoiceprintLine },
  { value: 'AI Search', label: 'AI Search', icon: RiBrainLine },
  { value: 'Payments', label: 'Payments', icon: RiSparklingLine },
]

export const frameworkOptions = [
  { value: 'SwiftUI', label: 'SwiftUI', icon: Swift },
  { value: 'UIKit', label: 'UIKit', icon: AppleLight },
  { value: 'Combine', label: 'Combine', icon: Swift },
  { value: 'WidgetKit', label: 'WidgetKit', icon: AppleLight },
  { value: 'StoreKit', label: 'StoreKit', icon: AppleLight },
  { value: 'Core Data', label: 'Core Data', icon: RiStackLine },
  { value: 'CloudKit', label: 'CloudKit', icon: AppleLight },
  { value: 'HealthKit', label: 'HealthKit', icon: AppleLight },
  { value: 'AVFoundation', label: 'AVFoundation', icon: AppleLight },
  { value: 'Vision', label: 'Vision', icon: RiApps2Line },
  { value: 'VisionKit', label: 'VisionKit', icon: RiApps2Line },
  { value: 'Core ML', label: 'Core ML', icon: RiBrainLine },
  { value: 'MapKit', label: 'MapKit', icon: RiMapPin2Line },
  { value: 'ActivityKit', label: 'ActivityKit', icon: AppleLight },
  { value: 'App Intents', label: 'App Intents', icon: AppleLight },
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
    categoryIds: [],
    stacks: [],
    frameworks: [],
    accentColor: '#c2ff29',
    status: 'published',
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
