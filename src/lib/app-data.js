import { getSupabaseBrowserClient } from './supabase'

function normalizeApp(row) {
  if (!row) return null

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.short_description ?? '',
    description: row.description ?? '',
    category: row.category ?? null,
    categoryIds: Array.isArray(row.category_ids)
      ? row.category_ids
      : row.category?.id
        ? [row.category.id]
        : [],
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

export async function fetchPublishedApps() {
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
    .eq('status', 'published')
    .order('updated_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map(normalizeApp)
}

export async function fetchPublishedAppBySlug(slug) {
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
    .eq('status', 'published')
    .maybeSingle()

  if (error) throw error
  return normalizeApp(data)
}

export async function fetchAdminSnapshot() {
  const supabase = getSupabaseBrowserClient()
  if (!supabase) return { apps: [], categories: [], activity: [] }

  const [{ data: apps, error: appsError }, { data: categories, error: categoriesError }, { data: activity, error: activityError }] =
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
    ])

  if (appsError) throw appsError
  if (categoriesError) throw categoriesError
  if (activityError) throw activityError

  return {
    apps: (apps ?? []).map(normalizeApp),
    categories: categories ?? [],
    activity: activity ?? [],
  }
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
    details: { name: data.name, status: data.status },
  })

  return normalizeApp(data)
}

export async function updateAppRecord(id, payload, actorEmail) {
  const supabase = getSupabaseBrowserClient()
  if (!supabase) throw new Error('Supabase env is missing.')

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
    details: { name: data.name, status: data.status },
  })

  return normalizeApp(data)
}
