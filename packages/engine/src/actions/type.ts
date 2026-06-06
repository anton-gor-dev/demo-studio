import type { TypeStep } from '@demo-studio/core-dsl'
import type { Driver } from '@demo-studio/shared'

export function typeHandler(driver: Driver, step: TypeStep, defaultTimeout: number): Promise<void> {
  return driver.type(step.selector, step.value, {
    ...(step.delay !== undefined && { delay: step.delay }),
    ...(step.clear !== undefined && { clear: step.clear }),
    timeout: step.timeout ?? defaultTimeout,
  })
}
