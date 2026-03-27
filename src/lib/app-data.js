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
    case 'frameworks':
    case 'category_ids':
      return formatArrayValue(value)
    case 'social_links':
    case 'store_links':
      return summarizeLinkKeys(value)
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

function summarizeAppRecord(row) {
  if (!row) return {}

  const categoryIds = Array.isArray(row.category_ids)
    ? row.category_ids
    : row.category_id
      ? [row.category_id]
      : []

  return {
    name: row.name,
    slug: row.slug,
    status: row.status,
    categoryIds,
    categoryCount: categoryIds.length,
    stackCount: Array.isArray(row.stacks) ? row.stacks.length : 0,
    frameworkCount: Array.isArray(row.frameworks) ? row.frameworks.length : 0,
    socialCount: countLinks(row.social_links),
    storeCount: countLinks(row.store_links),
  }
}

function buildChangedFields(previous, next) {
  const fields = [
    ['name', previous?.name, next?.name],
    ['slug', previous?.slug, next?.slug],
    ['status', previous?.status, next?.status],
    ['category_ids', previous?.category_ids ?? (previous?.category_id ? [previous.category_id] : []), next?.category_ids ?? (next?.category_id ? [next.category_id] : [])],
    ['description', previous?.description, next?.description],
    ['short_description', previous?.short_description, next?.short_description],
    ['accent_color', previous?.accent_color, next?.accent_color],
    ['stacks', previous?.stacks ?? [], next?.stacks ?? []],
    ['frameworks', previous?.frameworks ?? [], next?.frameworks ?? []],
    ['social_links', previous?.social_links ?? {}, next?.social_links ?? {}],
    ['store_links', previous?.store_links ?? {}, next?.store_links ?? {}],
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

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.short_description ?? '',
    description: row.description ?? '',
    category: categories[0] ?? row.category ?? null,
    categories,
    categoryIds,
    logoUrl: row.logo_url ?? '',
    accentColor: row.accent_color ?? '#c2ff29',
    stacks: Array.isArray(row.stacks) ? row.stacks : [],
    frameworks: Array.isArray(row.frameworks) ? row.frameworks : [],
    socialLinks: row.social_links ?? {},
    storeLinks: row.store_links ?? {},
    status: row.status ?? 'draft',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function normalizeWorkspaceSettings(row) {
  return {
    bannerEyebrow: row?.banner_eyebrow ?? 'CREAI directory',
    bannerTitle: row?.banner_title ?? 'Explore CREAI products in one place',
    bannerDescription: row?.banner_description ?? 'Discover live apps, browse the stack, and open every product profile from a single catalog surface.',
  }
}

export async function fetchApps() {
  const supabase = getSupabaseBrowserClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('apps')
    .select(`
      id,
      slug,
      name,
      short_description,
      description,
      category_ids,
      logo_url,
      accent_color,
      stacks,
      frameworks,
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
    `)
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
    .select(`
      id,
      slug,
      name,
      short_description,
      description,
      category_ids,
      logo_url,
      accent_color,
      stacks,
      frameworks,
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
    `)
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
    .select('banner_eyebrow, banner_title, banner_description')
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
      supabase
        .from('apps')
        .select(`
          id,
          slug,
          name,
          short_description,
          description,
          category_ids,
          logo_url,
          accent_color,
          stacks,
          frameworks,
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
        `)
        .order('updated_at', { ascending: false }),
      supabase.from('app_categories').select('id, name, slug, created_at').order('name', { ascending: true }),
      supabase
        .from('app_activity')
        .select('id, action, entity_type, entity_id, actor_email, details, created_at')
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('workspace_settings')
        .select('banner_eyebrow, banner_title, banner_description')
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
      },
      { onConflict: 'id' },
    )
    .select('banner_eyebrow, banner_title, banner_description')
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
    .select(`
      id,
      slug,
      name,
      short_description,
      description,
      logo_url,
      category_ids,
      accent_color,
      stacks,
      frameworks,
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
    `)
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
    .select(
      'id, name, slug, short_description, description, category_id, category_ids, logo_url, accent_color, stacks, frameworks, social_links, store_links, status',
    )
    .eq('id', id)
    .single()

  if (previousError) throw previousError

  const { data, error } = await supabase
    .from('apps')
    .update(payload)
    .eq('id', id)
    .select(`
      id,
      slug,
      name,
      short_description,
      description,
      logo_url,
      category_ids,
      accent_color,
      stacks,
      frameworks,
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
    `)
    .single()

  if (error) throw error

  await recordActivity({
    action: 'updated',
    entityType: 'app',
    entityId: data.id,
    actorEmail,
    details: {
      ...summarizeAppRecord(data),
      previousStatus: previous.status,
      changes: buildChangedFields(previous, payload),
      changedFields: buildChangedFields(previous, payload).map((item) => item.field),
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
    .select('id, name, slug, category_id, category_ids, stacks, frameworks, social_links, store_links, status')
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
