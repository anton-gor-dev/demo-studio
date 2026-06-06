import type { ClickStep } from '@demo-studio/core-dsl'
import type { Driver } from '@demo-studio/shared'

export function clickHandler(driver: Driver, step: ClickStep, defaultTimeout: number): Promise<void> {
  return driver.click(step.selector, {
    ...(step.button !== undefined && { button: step.button }),
    ...(step.modifiers !== undefined && { modifiers: step.modifiers }),
    timeout: step.timeout ?? defaultTimeout,
  })
}
