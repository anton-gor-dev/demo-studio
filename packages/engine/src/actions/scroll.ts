import type { ScrollStep } from '@demo-studio/core-dsl'
import type { Driver } from '@demo-studio/shared'

export function scrollHandler(driver: Driver, step: ScrollStep, _defaultTimeout: number): Promise<void> {
  return driver.scroll(step.selector, {
    ...(step.direction !== undefined && { direction: step.direction }),
    ...(step.amount !== undefined && { amount: step.amount }),
  })
}
