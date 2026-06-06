import type { WaitForStep } from '@demo-studio/core-dsl'
import type { Driver } from '@demo-studio/shared'

export function waitForHandler(driver: Driver, step: WaitForStep, defaultTimeout: number): Promise<void> {
  return driver.waitFor(step.selector, {
    ...(step.state !== undefined && { state: step.state }),
    timeout: step.timeout ?? defaultTimeout,
  })
}
