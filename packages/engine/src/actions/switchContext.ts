import type { SwitchContextStep } from '@demo-studio/core-dsl'
import { DriverError } from '@demo-studio/shared'
import type { Driver } from '@demo-studio/shared'

export async function switchContextHandler(
  driver: Driver,
  step: SwitchContextStep,
  _defaultTimeout: number,
): Promise<void> {
  if (!driver.switchContext) {
    throw new DriverError(
      'This driver does not support context switching. Use driver-playwright with extensionPath to enable it.',
    )
  }
  await driver.switchContext(step.to)
}
