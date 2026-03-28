import { getSupabaseBrowserClient } from './supabase'

function countLinks(group) {
  return Object.values(group ?? {}).filter(Boolean).length
}

function summarizeLinkKeys(group) {
  const keys = Object.entries(group ?? {})
    .filter(([, value]) => Boolean(value))
    .map(([key]) => key)

  return keys.length ? keys.join(', ') : 'empty'
}

function formatScalarValue(value) {
  if (value === null || value === undefined || value === '') return 'empty'
  return String(value)
}

function formatArrayValue(value) {
  if (!Array.isArray(value) || value.length === 0) return 'empty'
  return value.join(', ')
}

function formatChangeValue(field, value) {
  switch (field) {
    case 'stacks':
    case 'web_technologies':
    case 'mobile_technologies':
    case 'category_ids':
      return formatArrayValue(value)
    case 'social_links':
    case 'store_links':
      return summarizeLinkKeys(value)
    case 'platforms':
      return Object.entries(value ?? {})
        .filter(([, platform]) => platform?.enabled)
        .map(([key, platform]) => `${key}:${platform.status || 'draft'}`)
        .join(', ') || 'empty'
    case 'description':
    case 'short_description':
      return formatScalarValue(value).slice(0, 120)
    default:
      return formatScalarValue(value)
  }
}

function buildCategoryMap(rows) {
  return new Map((rows ?? []).map((row) => [row.id, row]))
}

function collectCategoryIds(rows) {
  return [...new Set(
    (rows ?? [])
      .flatMap((row) => {
        const ids = Array.isArray(row.category_ids) ? row.category_ids : []
        return row.category?.id ? [...ids, row.category.id] : ids
      })
      .filter(Boolean),
  )]
}

async function fetchCategoriesByIds(supabase, ids) {
  if (!ids.length) return new Map()

  const { data, error } = await supabase
    .from('app_categories')
    .select('id, name, slug, created_at')
    .in('id', ids)

  if (error) throw error
  return buildCategoryMap(data)
}

function clonePlatform(platform) {
  return {
    enabled: Boolean(platform?.enabled),
    status: platform?.status || 'draft',
    url: platform?.url || '',
  }
}

function normalizeExternalUrl(value) {
  const trimmed = value?.trim?.() ?? value
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${String(trimmed).replace(/^\/+/, '')}`
}

function normalizeMonthDate(value) {
  if (!value) return null
  const stringValue = String(value).trim()
  if (!stringValue) return null
  if (/^\d{4}-\d{2}$/.test(stringValue)) return `${stringValue}-01`
  if (/^\d{4}-\d{2}-\d{2}$/.test(stringValue)) return stringValue
  return null
}

function normalizePlatforms(row) {
  const rawPlatforms = row?.platforms ?? {}
  const fallbackStatus = row?.status === 'published' ? 'live' : row?.status || 'draft'
  const legacyStoreLinks = row?.store_links ?? {}

  const nextPlatforms = {
    ios: clonePlatform(rawPlatforms.ios),
    android: clonePlatform(rawPlatforms.android),
    web: clonePlatform(rawPlatforms.web),
  }

  const legacyMap = {
    ios: legacyStoreLinks.app_store,
    android: legacyStoreLinks.google_play,
    web: legacyStoreLinks.web_app,
  }

  Object.entries(legacyMap).forEach(([key, legacyUrl]) => {
    if (!nextPlatforms[key].url && legacyUrl) {
      nextPlatforms[key].url = normalizeExternalUrl(legacyUrl)
    }
    if (!rawPlatforms?.[key] && legacyUrl) {
      nextPlatforms[key].enabled = true
      nextPlatforms[key].status = fallbackStatus
    }
  })

  Object.keys(nextPlatforms).forEach((key) => {
    const platform = nextPlatforms[key]
    if (platform.url) {
      platform.url = normalizeExternalUrl(platform.url)
      if (!platform.enabled) platform.enabled = true
    }
  })

  return nextPlatforms
}

function normalizeGitHubRepository(value) {
  const trimmed = value?.trim()
  if (!trimmed) return ''

  const directMatch = trimmed.match(/^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/)
  if (directMatch) return `${directMatch[1]}/${directMatch[2]}`

  try {
    const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`)
    if (!url.hostname.includes('github.com')) return ''
    const [owner, repo] = url.pathname.replace(/^\/+/, '').split('/')
    if (!owner || !repo) return ''
    return `${owner}/${repo.replace(/\.git$/i, '')}`
  } catch {
    return ''
  }
}

function countLivePlatforms(platforms) {
  return Object.values(platforms ?? {}).filter((platform) => platform?.enabled && platform?.status === 'live').length
}

function countEnabledPlatforms(platforms) {
  return Object.values(platforms ?? {}).filter((platform) => platform?.enabled).length
}

function summarizeAppRecord(row) {
  if (!row) return {}

  const categoryIds = Array.isArray(row.category_ids)
    ? row.category_ids
    : row.category_id
      ? [row.category_id]
      : []

  const platforms = normalizePlatforms(row)

  return {
    name: row.name,
    slug: row.slug,
    categoryIds,
    categoryCount: categoryIds.length,
    stackCount: Array.isArray(row.stacks) ? row.stacks.length : 0,
    webTechnologyCount: Array.isArray(row.web_technologies) ? row.web_technologies.length : 0,
    mobileTechnologyCount: Array.isArray(row.mobile_technologies) ? row.mobile_technologies.length : 0,
    socialCount: countLinks(row.social_links),
    githubRepository: normalizeGitHubRepository(row.github_repository ?? row.social_links?.github ?? ''),
    platformCount: countEnabledPlatforms(platforms),
    livePlatformCount: countLivePlatforms(platforms),
    platforms,
  }
}

function buildChangedFields(previous, next) {
  const fields = [
    ['name', previous?.name, next?.name],
    ['slug', previous?.slug, next?.slug],
    ['category_ids', previous?.category_ids ?? (previous?.category_id ? [previous.category_id] : []), next?.category_ids ?? (next?.category_id ? [next.category_id] : [])],
    ['description', previous?.description, next?.description],
    ['short_description', previous?.short_description, next?.short_description],
    ['started_at', previous?.started_at ?? null, next?.started_at ?? null],
    ['launched_at', previous?.launched_at ?? null, next?.launched_at ?? null],
    ['accent_color', previous?.accent_color, next?.accent_color],
    ['github_repository', previous?.github_repository ?? '', next?.github_repository ?? ''],
    ['stacks', previous?.stacks ?? [], next?.stacks ?? []],
    ['web_technologies', previous?.web_technologies ?? [], next?.web_technologies ?? []],
    ['mobile_technologies', previous?.mobile_technologies ?? [], next?.mobile_technologies ?? []],
    ['platforms', normalizePlatforms(previous), normalizePlatforms(next)],
    ['social_links', previous?.social_links ?? {}, next?.social_links ?? {}],
    ['logo_url', previous?.logo_url ?? null, next?.logo_url ?? null],
  ]

  return fields
    .filter(([, before, after]) => JSON.stringify(before) !== JSON.stringify(after))
    .map(([field, before, after]) => ({
      field,
      before: formatChangeValue(field, before),
      after: formatChangeValue(field, after),
    }))
}

function normalizeApp(row, categoryMap = new Map()) {
  if (!row) return null

  const categoryIds = Array.isArray(row.category_ids)
    ? row.category_ids
    : row.category?.id
      ? [row.category.id]
      : []

  const categories = categoryIds
    .map((id) => categoryMap.get(id))
    .filter(Boolean)

  if (!categories.length && row.category?.id) {
    categories.push(row.category)
  }

  const platforms = normalizePlatforms(row)

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.short_description ?? '',
    description: row.description ?? '',
    startedAt: normalizeMonthDate(row.started_at) ?? normalizeMonthDate(row.created_at),
    launchedAt: normalizeMonthDate(row.launched_at),
    category: categories[0] ?? row.category ?? null,
    categories,
    categoryIds,
    logoUrl: row.logo_url ?? '',
    accentColor: row.accent_color ?? '#c2ff29',
    githubRepository: normalizeGitHubRepository(row.github_repository ?? row.social_links?.github ?? ''),
    stacks: Array.isArray(row.stacks) ? row.stacks : [],
    webTechnologies: Array.isArray(row.web_technologies) ? row.web_technologies : [],
    mobileTechnologies: Array.isArray(row.mobile_technologies) ? row.mobile_technologies : [],
    socialLinks: row.social_links ?? {},
    platforms,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function normalizeWorkspaceSettings(row) {
  return {
    bannerEyebrow: row?.banner_eyebrow ?? 'CREAI directory',
    bannerTitle: row?.banner_title ?? 'Explore CREAI products in one place',
    bannerDescription: row?.banner_description ?? 'Discover live apps, browse the stack, and open every product profile from a single catalog surface.',
    bannerImageUrl: row?.banner_image_url ?? '',
  }
}

function appSelectQuery() {
  return `
      id,
      slug,
      name,
      short_description,
      description,
      started_at,
      launched_at,
      category_ids,
      logo_url,
      accent_color,
      github_repository,
      stacks,
      web_technologies,
      mobile_technologies,
      platforms,
      social_links,
      store_links,
      status,
      created_at,
      updated_at,
      category:app_categories (
        id,
        name,
        slug
      )
    `
}

export async function fetchApps() {
  const supabase = getSupabaseBrowserClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('apps')
    .select(appSelectQuery())
    .order('updated_at', { ascending: false })

  if (error) throw error

  const categoryMap = await fetchCategoriesByIds(supabase, collectCategoryIds(data ?? []))
  return (data ?? []).map((row) => normalizeApp(row, categoryMap))
}

export async function fetchAppBySlug(slug) {
  const supabase = getSupabaseBrowserClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('apps')
    .select(appSelectQuery())
    .eq('slug', slug)
    .maybeSingle()

  if (error) throw error

  const categoryMap = await fetchCategoriesByIds(supabase, collectCategoryIds(data ? [data] : []))
  return normalizeApp(data, categoryMap)
}

export async function fetchWorkspaceSettings() {
  const supabase = getSupabaseBrowserClient()
  if (!supabase) return normalizeWorkspaceSettings(null)

  const { data, error } = await supabase
    .from('workspace_settings')
    .select('banner_eyebrow, banner_title, banner_description, banner_image_url')
    .eq('id', 'directory')
    .maybeSingle()

  if (error) throw error
  return normalizeWorkspaceSettings(data)
}

export async function fetchAdminSnapshot() {
  const supabase = getSupabaseBrowserClient()
  if (!supabase) return { apps: [], categories: [], activity: [], settings: normalizeWorkspaceSettings(null) }

  const [{ data: apps, error: appsError }, { data: categories, error: categoriesError }, { data: activity, error: activityError }, { data: settings, error: settingsError }] =
    await Promise.all([
      supabase.from('apps').select(appSelectQuery()).order('updated_at', { ascending: false }),
      supabase.from('app_categories').select('id, name, slug, created_at').order('name', { ascending: true }),
      supabase
        .from('app_activity')
        .select('id, action, entity_type, entity_id, actor_email, details, created_at')
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('workspace_settings')
        .select('banner_eyebrow, banner_title, banner_description, banner_image_url')
        .eq('id', 'directory')
        .maybeSingle(),
    ])

  if (appsError) throw appsError
  if (categoriesError) throw categoriesError
  if (activityError) throw activityError
  if (settingsError) throw settingsError

  const categoryMap = buildCategoryMap(categories ?? [])

  return {
    apps: (apps ?? []).map((row) => normalizeApp(row, categoryMap)),
    categories: categories ?? [],
    activity: activity ?? [],
    settings: normalizeWorkspaceSettings(settings),
  }
}

export async function upsertWorkspaceSettings(payload) {
  const supabase = getSupabaseBrowserClient()
  if (!supabase) throw new Error('Supabase env is missing.')

  const { data, error } = await supabase
    .from('workspace_settings')
    .upsert(
      {
        id: 'directory',
        banner_eyebrow: payload.bannerEyebrow?.trim() || null,
        banner_title: payload.bannerTitle?.trim() || null,
        banner_description: payload.bannerDescription?.trim() || null,
        banner_image_url: payload.bannerImageUrl?.trim() || null,
      },
      { onConflict: 'id' },
    )
    .select('banner_eyebrow, banner_title, banner_description, banner_image_url')
    .single()

  if (error) throw error
  return normalizeWorkspaceSettings(data)
}

export async function insertCategory(name) {
  const supabase = getSupabaseBrowserClient()
  if (!supabase) throw new Error('Supabase env is missing.')

  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  const { data, error } = await supabase
    .from('app_categories')
    .insert({ name: name.trim(), slug })
    .select('id, name, slug, created_at')
    .single()

  if (error) throw error
  return data
}

export async function uploadLogo(file, userId) {
  const supabase = getSupabaseBrowserClient()
  if (!supabase || !file) return ''

  const fileName = `${userId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '-')}`
  const { error } = await supabase.storage.from('app-logos').upload(fileName, file, {
    cacheControl: '3600',
    upsert: true,
  })

  if (error) throw error

  const { data } = supabase.storage.from('app-logos').getPublicUrl(fileName)
  return data.publicUrl
}

export async function recordActivity({ action, entityType, entityId, actorEmail, details }) {
  const supabase = getSupabaseBrowserClient()
  if (!supabase) return

  await supabase.from('app_activity').insert({
    action,
    entity_type: entityType,
    entity_id: entityId,
    actor_email: actorEmail,
    details,
  })
}

export async function createAppRecord(payload, actorEmail) {
  const supabase = getSupabaseBrowserClient()
  if (!supabase) throw new Error('Supabase env is missing.')

  const { data, error } = await supabase
    .from('apps')
    .insert(payload)
    .select(appSelectQuery())
    .single()

  if (error) throw error

  await recordActivity({
    action: 'created',
    entityType: 'app',
    entityId: data.id,
    actorEmail,
    details: {
      ...summarizeAppRecord(data),
      message: `Created ${data.name}`,
    },
  })

  const categoryMap = await fetchCategoriesByIds(supabase, collectCategoryIds(data ? [data] : []))
  return normalizeApp(data, categoryMap)
}

export async function updateAppRecord(id, payload, actorEmail) {
  const supabase = getSupabaseBrowserClient()
  if (!supabase) throw new Error('Supabase env is missing.')

  const { data: previous, error: previousError } = await supabase
    .from('apps')
    .select('id, name, slug, short_description, description, started_at, launched_at, category_id, category_ids, logo_url, accent_color, github_repository, stacks, web_technologies, mobile_technologies, platforms, social_links, store_links, status')
    .eq('id', id)
    .single()

  if (previousError) throw previousError

  const { data, error } = await supabase
    .from('apps')
    .update(payload)
    .eq('id', id)
    .select(appSelectQuery())
    .single()

  if (error) throw error

  const changes = buildChangedFields(previous, payload)
  await recordActivity({
    action: 'updated',
    entityType: 'app',
    entityId: data.id,
    actorEmail,
    details: {
      ...summarizeAppRecord(data),
      changes,
      changedFields: changes.map((item) => item.field),
      message: `Updated ${data.name}`,
    },
  })

  const categoryMap = await fetchCategoriesByIds(supabase, collectCategoryIds(data ? [data] : []))
  return normalizeApp(data, categoryMap)
}

export async function deleteAppRecord(id, actorEmail) {
  const supabase = getSupabaseBrowserClient()
  if (!supabase) throw new Error('Supabase env is missing.')

  const { data: previous, error: previousError } = await supabase
    .from('apps')
    .select('id, name, slug, started_at, launched_at, category_id, category_ids, github_repository, stacks, web_technologies, mobile_technologies, platforms, social_links, store_links, status')
    .eq('id', id)
    .single()

  if (previousError) throw previousError

  const { error } = await supabase.from('apps').delete().eq('id', id)

  if (error) throw error

  await recordActivity({
    action: 'deleted',
    entityType: 'app',
    entityId: id,
    actorEmail,
    details: {
      ...summarizeAppRecord(previous),
      message: `Deleted ${previous.name}`,
    },
  })
}
