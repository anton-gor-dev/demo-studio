import type { HoverStep } from '@demo-studio/core-dsl'
import type { Driver } from '@demo-studio/shared'

export function hoverHandler(driver: Driver, step: HoverStep, defaultTimeout: number): Promise<void> {
  return driver.hover(step.selector, {
    timeout: step.timeout ?? defaultTimeout,
  })
}
