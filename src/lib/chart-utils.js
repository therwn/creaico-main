export const chartColors = {
  brand: {
    bg: 'bg-brand-500',
    stroke: 'stroke-brand-500',
    fill: 'fill-brand-500',
    text: 'text-brand-500',
  },
  lime: {
    bg: 'bg-lime-500',
    stroke: 'stroke-lime-500',
    fill: 'fill-lime-500',
    text: 'text-lime-500',
  },
  gray: {
    bg: 'bg-gray-500',
    stroke: 'stroke-gray-500',
    fill: 'fill-gray-500',
    text: 'text-gray-500',
  },
  zinc: {
    bg: 'bg-zinc-500',
    stroke: 'stroke-zinc-500',
    fill: 'fill-zinc-500',
    text: 'text-zinc-500',
  },
  amber: {
    bg: 'bg-amber-500',
    stroke: 'stroke-amber-500',
    fill: 'fill-amber-500',
    text: 'text-amber-500',
  },
  red: {
    bg: 'bg-red-500',
    stroke: 'stroke-red-500',
    fill: 'fill-red-500',
    text: 'text-red-500',
  },
} 

export const AvailableChartColors = Object.keys(chartColors)

export function constructCategoryColors(categories, colors) {
  const categoryColors = new Map()
  categories.forEach((category, index) => {
    categoryColors.set(category, colors[index % colors.length])
  })
  return categoryColors
}

export function getColorClassName(color, type) {
  const fallbackColor = {
    bg: 'bg-gray-500',
    stroke: 'stroke-gray-500',
    fill: 'fill-gray-500',
    text: 'text-gray-500',
  }

  return chartColors[color]?.[type] ?? fallbackColor[type]
}

export function getYAxisDomain(autoMinValue, minValue, maxValue) {
  const minDomain = autoMinValue ? 'auto' : minValue ?? 0
  const maxDomain = maxValue ?? 'auto'
  return [minDomain, maxDomain]
}

export function hasOnlyOneValueForKey(array, keyToCheck) {
  const values = []

  for (const obj of array) {
    if (Object.prototype.hasOwnProperty.call(obj, keyToCheck)) {
      values.push(obj[keyToCheck])
      if (values.length > 1) {
        return false
      }
    }
  }

  return true
}
