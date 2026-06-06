import { parse } from '@demo-studio/core-dsl'
import { createPlaywrightDriver } from '@demo-studio/driver-playwright'
import { run } from '@demo-studio/engine'
import type { Driver } from '@demo-studio/shared'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import type { FixtureServer } from './fixture-server.js'
import { startLoginFixture } from './fixture-server.js'

let server: FixtureServer
let driver: Driver

beforeAll(async () => { server = await startLoginFixture() })
afterAll(async () => { await server.close() })

beforeEach(async () => {
  driver = await createPlaywrightDriver({ headless: true })
})
afterEach(async () => {
  await driver.close()
})

describe('M1 E2E smoke — login flow', () => {
  it('runs 5-step scenario end-to-end and returns success', async () => {
    const scenario = parse({
      version: '1.0',
      name: 'Login flow',
      steps: [
        { action: 'goto',    url: server.url },
        { action: 'type',    selector: '[data-testid="email"]',    value: 'user@example.com' },
        { action: 'type',    selector: '[data-testid="password"]', value: 'secret123' },
        { action: 'click',   selector: '[data-testid="submit"]' },
        { action: 'waitFor', selector: '[data-testid="dashboard-heading"]', state: 'visible' },
      ],
    })

    const stepStatuses: string[] = []
    const result = await run(driver, scenario, {
      onStepDone:  r => { stepStatuses.push(`${r.action}:success`) },
      onStepError: r => { stepStatuses.push(`${r.action}:failed`) },
    })

    expect(result.status).toBe('success')
    expect(result.steps).toHaveLength(5)
    expect(result.steps.every(s => s.status === 'success')).toBe(true)
    expect(stepStatuses).toEqual([
      'goto:success',
      'type:success',
      'type:success',
      'click:success',
      'waitFor:success',
    ])
    expect(result.duration).toBeLessThan(30_000)
  })

  it('reports failure when selector does not exist', async () => {
    const scenario = parse({
      version: '1.0',
      name: 'Failing login',
      steps: [
        { action: 'goto',    url: server.url },
        { action: 'click',   selector: '[data-testid="nonexistent"]', timeout: 800 },
      ],
    })

    const result = await run(driver, scenario)

    expect(result.status).toBe('failed')
    expect(result.steps[0]!.status).toBe('success')
    expect(result.steps[1]!.status).toBe('failed')
    expect(result.error).toBeDefined()
  })

  it('dry-run completes all steps without touching the browser', async () => {
    const scenario = parse({
      version: '1.0',
      name: 'Dry run test',
      steps: [
        { action: 'goto',    url: server.url },
        { action: 'type',    selector: '[data-testid="email"]',    value: 'x@x.com' },
        { action: 'click',   selector: '[data-testid="submit"]' },
        { action: 'waitFor', selector: '[data-testid="dashboard-heading"]' },
        { action: 'hover',   selector: '[data-testid="welcome-message"]' },
      ],
    })

    const result = await run(driver, scenario, { dryRun: true })

    expect(result.status).toBe('success')
    expect(result.steps).toHaveLength(5)
    // No actual navigation — page is still blank
  })

  it('screenshot is a valid PNG buffer when captureScreenshots is enabled', async () => {
    const scenario = parse({
      version: '1.0',
      name: 'Screenshot test',
      steps: [
        { action: 'goto',    url: server.url },
        { action: 'waitFor', selector: '[data-testid="submit"]', state: 'visible' },
      ],
    })

    const result = await run(driver, scenario, { captureScreenshots: true })

    expect(result.status).toBe('success')
    for (const step of result.steps) {
      expect(step.screenshot).toBeInstanceOf(Buffer)
      // PNG magic bytes
      expect(step.screenshot![0]).toBe(0x89)
      expect(step.screenshot![1]).toBe(0x50)
    }
  })
})
