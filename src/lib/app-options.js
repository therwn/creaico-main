import {
  AppleLight,
  Cloudflare,
  CloudflareWorkers,
  Expo,
  Firebase,
  Flutter,
  Nextjs,
  Nodejs,
  OpenAILight,
  PostgreSQL,
  ReactLight,
  Stripe,
  Supabase,
  Swift,
  TailwindCSS,
  TypeScript,
  VercelLight,
} from '@ridemountainpig/svgl-react'
import {
  RiAndroidLine,
  RiAppleFill,
  RiApps2Line,
  RiBrainLine,
  RiGlobalLine,
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
  { value: 'Analytics', label: 'Analytics', icon: RiLineChartLine },
  { value: 'Automation', label: 'Automation', icon: RiRobot2Line },
  { value: 'Voice', label: 'Voice', icon: RiVoiceprintLine },
  { value: 'AI Search', label: 'AI Search', icon: RiBrainLine },
  { value: 'Payments', label: 'Payments', icon: RiSparklingLine },
]

export const webTechnologyOptions = [
  { value: 'React', label: 'React', icon: ReactLight },
  { value: 'Next.js', label: 'Next.js', icon: Nextjs },
  { value: 'Tailwind CSS', label: 'Tailwind CSS', icon: TailwindCSS },
  { value: 'Vercel', label: 'Vercel', icon: VercelLight },
  { value: 'Cloudflare Pages', label: 'Cloudflare Pages', icon: Cloudflare },
  { value: 'Cloudflare Workers', label: 'Cloudflare Workers', icon: CloudflareWorkers },
  { value: 'Node.js', label: 'Node.js', icon: Nodejs },
  { value: 'TypeScript', label: 'TypeScript', icon: TypeScript },
  { value: 'WebRTC', label: 'WebRTC', icon: RiApps2Line },
]

export const mobileTechnologyOptions = [
  { value: 'SwiftUI', label: 'SwiftUI', icon: Swift },
  { value: 'UIKit', label: 'UIKit', icon: AppleLight },
  { value: 'React Native', label: 'React Native', icon: ReactLight },
  { value: 'Expo', label: 'Expo', icon: Expo },
  { value: 'Flutter', label: 'Flutter', icon: Flutter },
  { value: 'Combine', label: 'Combine', icon: Swift },
  { value: 'WidgetKit', label: 'WidgetKit', icon: AppleLight },
  { value: 'StoreKit', label: 'StoreKit', icon: AppleLight },
  { value: 'Core Data', label: 'Core Data', icon: RiStackLine },
  { value: 'CloudKit', label: 'CloudKit', icon: AppleLight },
  { value: 'HealthKit', label: 'HealthKit', icon: AppleLight },
  { value: 'AVFoundation', label: 'AVFoundation', icon: AppleLight },
  { value: 'VisionKit', label: 'VisionKit', icon: RiApps2Line },
  { value: 'Core ML', label: 'Core ML', icon: RiBrainLine },
  { value: 'MapKit', label: 'MapKit', icon: RiMapPin2Line },
  { value: 'ActivityKit', label: 'ActivityKit', icon: AppleLight },
  { value: 'App Intents', label: 'App Intents', icon: AppleLight },
]

const techOptions = [...stackOptions, ...webTechnologyOptions, ...mobileTechnologyOptions]
const techOptionMap = new Map(techOptions.map((option) => [option.value, option]))

export function getTechOption(value) {
  return techOptionMap.get(value) || null
}

export const platformOptions = [
  { key: 'ios', label: 'iOS', shortLabel: 'iOS', icon: RiAppleFill },
  { key: 'android', label: 'Android', shortLabel: 'Android', icon: RiAndroidLine },
  { key: 'web', label: 'Web', shortLabel: 'Web', icon: RiGlobalLine },
]

export const platformStatusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'coming_soon', label: 'Coming soon' },
  { value: 'beta', label: 'Beta' },
  { value: 'live', label: 'Live' },
]

const platformStatusMeta = {
  draft: { label: 'Draft', shortLabel: 'Draft', color: 'gray', className: '' },
  coming_soon: { label: 'Coming soon', shortLabel: 'Soon', color: 'gray', className: '' },
  beta: { label: 'Beta', shortLabel: 'Beta', color: 'gray', className: '' },
  live: { label: 'Live', shortLabel: 'Live', color: 'lime', className: 'creai-badge' },
}

export function getPlatformStatusMeta(value) {
  return platformStatusMeta[value] || platformStatusMeta.draft
}

export function getPlatformMeta(key) {
  return platformOptions.find((platform) => platform.key === key) || null
}

export const socialFieldOptions = [
  { key: 'website', label: 'Website' },
  { key: 'x', label: 'X' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'github', label: 'GitHub' },
  { key: 'linkedin', label: 'LinkedIn' },
]

export const dashboardSections = [
  { value: 'overview', label: 'Overview', href: '/admin/dashboard' },
  { value: 'recent-updates', label: 'Recent Updates', href: '/admin/dashboard/recent-updates' },
  { value: 'categories', label: 'Categories', href: '/admin/dashboard/categories' },
  { value: 'quick-actions', label: 'Quick Actions', href: '/admin/dashboard/quick-actions' },
  { value: 'recent-activity', label: 'Recent Activity', href: '/admin/dashboard/recent-activity' },
]

export function createEmptyPlatformState() {
  return {
    enabled: false,
    status: 'draft',
    url: '',
  }
}

export function createEmptyAppForm() {
  return {
    name: '',
    slug: '',
    shortDescription: '',
    description: '',
    startedAt: '',
    launchedAt: '',
    categoryIds: [],
    stacks: [],
    webTechnologies: [],
    mobileTechnologies: [],
    accentColor: '#c2ff29',
    githubRepository: '',
    platforms: {
      ios: createEmptyPlatformState(),
      android: createEmptyPlatformState(),
      web: createEmptyPlatformState(),
    },
    socialLinks: {
      website: '',
      x: '',
      instagram: '',
      github: '',
      linkedin: '',
    },
    logoFile: null,
    logoUrl: '',
  }
}
