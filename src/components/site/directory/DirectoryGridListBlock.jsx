'use client'

import { Callout, Card, Grid, Text, Title } from '@tremor/react'
import { RiFilter3Line } from '@remixicon/react'
import SearchableSelect from '../../ui/SearchableSelect'
import DirectoryGridCard from './DirectoryGridCard'

export default function DirectoryGridListBlock({
  error,
  categories,
  filteredApps,
  selectedCategory,
  setSelectedCategory,
  availabilityFilter,
  setAvailabilityFilter,
  availabilityOptions,
}) {
  const categoryOptions = [
    { value: 'all', label: 'All categories', icon: RiFilter3Line },
    ...categories.map((category) => ({
      value: category.id,
      label: category.name,
      keywords: [category.slug],
    })),
  ]

  return (
    <Card className="creai-card rounded-[2rem] p-6">
      <div className="flex flex-col gap-4 border-b border-mist-200/80 pb-6 dark:border-ink-700 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-2">
          <Title>Available apps</Title>
          <Text>Grid list directory shell prepared for Tremor Blocks based catalog views.</Text>
        </div>
        <div className="grid w-full gap-3 md:grid-cols-2 xl:w-auto xl:min-w-[420px]">
          <div className="space-y-2">
            <Text className="font-medium">Category</Text>
            <SearchableSelect
              value={selectedCategory}
              onChange={setSelectedCategory}
              options={categoryOptions}
              placeholder="All categories"
              searchPlaceholder="Search categories..."
              emptyMessage="No category found."
            />
          </div>
          <div className="space-y-2">
            <Text className="font-medium">Availability</Text>
            <SearchableSelect
              value={availabilityFilter}
              onChange={setAvailabilityFilter}
              options={availabilityOptions}
              placeholder="All availability"
              searchPlaceholder="Search availability..."
              emptyMessage="No availability option found."
            />
          </div>
        </div>
      </div>

      {error ? (
        <Callout className="mt-6" title="Directory unavailable" color="rose">
          {error}
        </Callout>
      ) : null}

      {filteredApps.length ? (
        <Grid numItemsMd={2} numItemsLg={4} className="mt-6 gap-4">
          {filteredApps.map((app) => (
            <DirectoryGridCard key={app.id} app={app} />
          ))}
        </Grid>
      ) : (
        <Card className="creai-card mt-6 rounded-3xl border border-dashed border-mist-300 p-10 text-center dark:border-ink-700">
          <Text>No apps match the current filters yet.</Text>
        </Card>
      )}
    </Card>
  )
}
