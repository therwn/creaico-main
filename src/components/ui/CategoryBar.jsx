'use client'

import React from 'react'
import { getColorClassName, AvailableChartColors } from '../../lib/chart-utils'
import { cx } from '../../lib/utils'

const getPositionLeft = (value, maxValue) => (value ? (value / maxValue) * 100 : 0)
const sumNumericArray = (arr) => arr.reduce((prefixSum, num) => prefixSum + num, 0)

const formatNumber = (num) => {
  if (Number.isInteger(num)) return num.toString()
  return num.toFixed(1)
}

function BarLabels({ values }) {
  const sumValues = React.useMemo(() => sumNumericArray(values), [values])
  let prefixSum = 0
  let sumConsecutiveHiddenLabels = 0

  return (
    <div
      className={cx(
        'relative mb-2 flex h-5 w-full text-sm font-medium',
        'text-gray-700 dark:text-gray-300',
      )}
    >
      <div className="absolute bottom-0 left-0 flex items-center">0</div>
      {values.map((widthPercentage, index) => {
        prefixSum += widthPercentage
        const showLabel =
          (widthPercentage >= 0.1 * sumValues || sumConsecutiveHiddenLabels >= 0.09 * sumValues) &&
          sumValues - prefixSum >= 0.1 * sumValues &&
          prefixSum >= 0.1 * sumValues &&
          prefixSum < 0.9 * sumValues

        sumConsecutiveHiddenLabels = showLabel ? 0 : (sumConsecutiveHiddenLabels += widthPercentage)
        const widthPositionLeft = getPositionLeft(widthPercentage, sumValues)

        return (
          <div
            key={`item-${index}`}
            className="flex items-center justify-end pr-0.5"
            style={{ width: `${widthPositionLeft}%` }}
          >
            {showLabel ? (
              <span className={cx('block translate-x-1/2 text-sm tabular-nums')}>
                {formatNumber(prefixSum)}
              </span>
            ) : null}
          </div>
        )
      })}
      <div className="absolute bottom-0 right-0 flex items-center">{formatNumber(sumValues)}</div>
    </div>
  )
}

const CategoryBar = React.forwardRef(function CategoryBar(
  {
    values = [],
    colors = AvailableChartColors,
    marker,
    showLabels = true,
    className,
    ...props
  },
  forwardedRef,
) {
  const maxValue = React.useMemo(() => sumNumericArray(values), [values])
  const adjustedMarkerValue = React.useMemo(() => {
    if (marker === undefined) return undefined
    if (marker.value < 0) return 0
    if (marker.value > maxValue) return maxValue
    return marker.value
  }, [marker, maxValue])

  const markerPositionLeft = React.useMemo(
    () => getPositionLeft(adjustedMarkerValue, maxValue),
    [adjustedMarkerValue, maxValue],
  )

  const markerColor = React.useMemo(() => {
    if (adjustedMarkerValue === undefined) return ''
    let prefixSum = 0
    for (let index = 0; index < values.length; index += 1) {
      prefixSum += values[index]
      if (prefixSum >= adjustedMarkerValue) {
        return getColorClassName(colors[index] ?? 'gray', 'bg')
      }
    }
    return getColorClassName(colors[values.length - 1] ?? 'gray', 'bg')
  }, [adjustedMarkerValue, colors, values])

  return (
    <div
      ref={forwardedRef}
      className={cx(className)}
      aria-label="Category bar"
      aria-valuenow={marker?.value}
      tremor-id="tremor-raw"
      {...props}
    >
      {showLabels ? <BarLabels values={values} /> : null}
      <div className="relative flex h-2 w-full items-center">
        <div className="flex h-full flex-1 items-center gap-0.5 overflow-hidden rounded-full">
          {values.map((value, index) => {
            const barColor = colors[index] ?? 'gray'
            const percentage = maxValue ? (value / maxValue) * 100 : 0

            return (
              <div
                key={`item-${index}`}
                className={cx(
                  'h-full',
                  getColorClassName(barColor, 'bg'),
                  percentage === 0 && 'hidden',
                )}
                style={{ width: `${percentage}%` }}
              />
            )
          })}
        </div>

        {marker !== undefined ? (
          <div
            className={cx(
              'absolute w-2 -translate-x-1/2',
              marker.showAnimation && 'transform-gpu transition-all duration-300 ease-in-out',
            )}
            style={{ left: `${markerPositionLeft}%` }}
          >
            <div
              className={cx(
                'mx-auto h-4 w-1 rounded-full ring-2',
                'ring-white dark:ring-gray-950',
                markerColor,
              )}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
})

export default CategoryBar
