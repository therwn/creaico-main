'use client'

import { Callout, Card, Grid, Select, SelectItem, Text, Title } from '@tremor/react'
import { RiFilter3Line } from '@remixicon/react'
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
  return (
    <Card className="rounded-[2rem] p-6">
      <div className="flex flex-col gap-4 border-b border-mist-200/80 pb-6 dark:border-ink-700 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-2">
          <Title>Available apps</Title>
          <Text>Grid list directory shell prepared for Tremor Blocks based catalog views.</Text>
        </div>
        <div className="grid w-full gap-3 md:grid-cols-2 xl:w-auto xl:min-w-[420px]">
          <div className="space-y-2">
            <Text className="flex items-center gap-2 font-medium">
              <RiFilter3Line className="h-4 w-4" />
              Category
            </Text>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Text className="font-medium">Availability</Text>
            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              {availabilityOptions.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </Select>
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
        <Card className="mt-6 rounded-3xl border border-dashed border-mist-300 bg-mist-50/80 p-10 text-center dark:border-ink-700 dark:bg-ink-900/60">
          <Text>No apps match the current filters yet.</Text>
        </Card>
      )}
    </Card>
  )
}
