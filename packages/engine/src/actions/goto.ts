import type { GotoStep } from '@demo-studio/core-dsl'
import type { Driver } from '@demo-studio/shared'

export function gotoHandler(driver: Driver, step: GotoStep, defaultTimeout: number): Promise<void> {
  return driver.goto(step.url, {
    ...(step.waitUntil !== undefined && { waitUntil: step.waitUntil }),
    timeout: step.timeout ?? defaultTimeout,
  })
}
