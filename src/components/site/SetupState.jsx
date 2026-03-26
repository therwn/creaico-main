'use client'

import { Callout, Card, List, ListItem, Text, Title } from '@tremor/react'
import { RiAlertLine, RiSettings3Line } from '@remixicon/react'

export default function SetupState({ title, description }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full rounded-3xl border border-mist-200/80 bg-white/90 p-8 shadow-soft dark:border-ink-700/80 dark:bg-ink-900/85 dark:shadow-soft-dark">
        <div className="space-y-3">
          <Title>{title}</Title>
          <Text>{description}</Text>
        </div>

        <Callout className="mt-6" title="Supabase setup required" icon={RiAlertLine} color="amber">
          Add the public URL and anon key for this project, then create the tables and storage bucket.
        </Callout>

        <div className="mt-6 rounded-2xl border border-mist-200/70 bg-mist-50/80 p-5 dark:border-ink-700 dark:bg-ink-800/70">
          <div className="mb-3 flex items-center gap-2">
            <RiSettings3Line className="h-4 w-4 text-mist-500 dark:text-brand-300" />
            <Text className="font-medium">Required environment variables</Text>
          </div>
          <List>
            <ListItem>
              <span>NEXT_PUBLIC_SUPABASE_URL</span>
            </ListItem>
            <ListItem>
              <span>NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
            </ListItem>
          </List>
        </div>
      </Card>
    </div>
  )
}
