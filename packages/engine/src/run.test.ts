import type { DemoScenario } from '@demo-studio/core-dsl'
import { ActionError, DemoStudioError, TimeoutError } from '@demo-studio/shared'
import type { RunResult, StepResult } from '@demo-studio/shared'
import { describe, expect, it, vi } from 'vitest'
import { run } from './run.js'
import { createMockDriver } from './testing/mock-driver.js'

const SCENARIO: DemoScenario = {
  version: '1.0',
  name: 'Test scenario',
  steps: [
    { action: 'goto', url: 'https://example.com' },
    { action: 'click', selector: '[data-testid="btn"]' },
    { action: 'type', selector: '#email', value: 'user@example.com' },
    { action: 'waitFor', selector: '.dashboard' },
  ],
}

describe('run — happy path', () => {
  it('returns success RunResult with all steps', async () => {
    const driver = createMockDriver()
    const result = await run(driver, SCENARIO)

    expect(result.status).toBe('success')
    expect(result.steps).toHaveLength(4)
    expect(result.steps.every(s => s.status === 'success')).toBe(true)
    expect(result.duration).toBeGreaterThanOrEqual(0)
  })

  it('dispatches each action to the correct driver method', async () => {
    const driver = createMockDriver()
    await run(driver, SCENARIO)

    const methods = driver.calls.map(c => c.method)
    expect(methods).toEqual(['goto', 'click', 'type', 'waitFor'])
  })

  it('passes correct args to driver.goto', async () => {
    const driver = createMockDriver()
    await run(driver, {
      version: '1.0',
      name: 'x',
      steps: [{ action: 'goto', url: 'https://example.com', waitUntil: 'networkidle', timeout: 5000 }],
    })

    expect(driver.calls[0]).toMatchObject({
      method: 'goto',
      args: ['https://example.com', { waitUntil: 'networkidle', timeout: 5000 }],
    })
  })

  it('passes correct args to driver.click with modifiers', async () => {
    const driver = createMockDriver()
    await run(driver, {
      version: '1.0',
      name: 'x',
      steps: [{ action: 'click', selector: '#btn', button: 'right', modifiers: ['Shift'] }],
    })

    expect(driver.calls[0]).toMatchObject({
      method: 'click',
      args: ['#btn', { button: 'right', modifiers: ['Shift'] }],
    })
  })

  it('uses defaultTimeout when step has no timeout', async () => {
    const driver = createMockDriver()
    await run(driver, {
      version: '1.0',
      name: 'x',
      steps: [{ action: 'click', selector: '#btn' }],
    }, { defaultTimeout: 3000 })

    expect((driver.calls[0]?.args[1] as { timeout: number }).timeout).toBe(3000)
  })
})

describe('run — callbacks', () => {
  it('calls onStepStart before each step', async () => {
    const driver = createMockDriver()
    const starts: number[] = []

    await run(driver, SCENARIO, {
      onStepStart: (i) => { starts.push(i) },
    })

    expect(starts).toEqual([0, 1, 2, 3])
  })

  it('calls onStepDone after each successful step', async () => {
    const driver = createMockDriver()
    const doneResults: StepResult[] = []

    await run(driver, SCENARIO, { onStepDone: r => { doneResults.push(r) } })

    expect(doneResults).toHaveLength(4)
    expect(doneResults.every(r => r.status === 'success')).toBe(true)
  })

  it('calls onRunDone once at the end', async () => {
    const driver = createMockDriver()
    const onRunDone = vi.fn<(r: RunResult) => void>()

    await run(driver, SCENARIO, { onRunDone })

    expect(onRunDone).toHaveBeenCalledTimes(1)
    const [runResult] = onRunDone.mock.calls[0]!
    expect(runResult.status).toBe('success')
  })
})

describe('run — step failure', () => {
  it('returns failed RunResult and halts on first error', async () => {
    const driver = createMockDriver({ failOnCall: 2 })
    const result = await run(driver, SCENARIO)

    expect(result.status).toBe('failed')
    expect(result.steps).toHaveLength(2)
    expect(result.steps[0]!.status).toBe('success')
    expect(result.steps[1]!.status).toBe('failed')
  })

  it('wraps non-DemoStudioError in ActionError', async () => {
    const driver = createMockDriver({ failOnCall: 1, failWith: new Error('network error') })
    const result = await run(driver, SCENARIO)

    expect(result.error).toBeInstanceOf(ActionError)
    expect(result.error?.message).toContain('network error')
  })

  it('preserves DemoStudioError subclass without wrapping', async () => {
    const timeout = new TimeoutError('timed out', 0, 10_000)
    const driver = createMockDriver({ failOnCall: 1, failWith: timeout })
    const result = await run(driver, SCENARIO)

    expect(result.error).toBeInstanceOf(TimeoutError)
    expect(result.error).toBe(timeout)
  })

  it('calls onStepError (not onStepDone) for a failing step', async () => {
    const driver = createMockDriver({ failOnCall: 1 })
    const onStepDone = vi.fn()
    const onStepError = vi.fn<(r: StepResult) => void>()

    await run(driver, SCENARIO, { onStepDone, onStepError })

    expect(onStepDone).not.toHaveBeenCalled()
    expect(onStepError).toHaveBeenCalledOnce()
    const [stepResult] = onStepError.mock.calls[0]!
    expect(stepResult.status).toBe('failed')
  })

  it('StepResult.error has correct stepIndex', async () => {
    const driver = createMockDriver({ failOnCall: 3 })
    const result = await run(driver, SCENARIO)

    expect(result.steps[2]!.error).toBeInstanceOf(DemoStudioError)
    expect((result.steps[2]!.error as ActionError).stepIndex).toBe(2)
  })
})

describe('run — dry run', () => {
  it('does not call any driver methods', async () => {
    const driver = createMockDriver()
    const result = await run(driver, SCENARIO, { dryRun: true })

    const actionCalls = driver.calls.filter(c => c.method !== 'screenshot')
    expect(actionCalls).toHaveLength(0)
    expect(result.status).toBe('success')
    expect(result.steps).toHaveLength(4)
  })
})

describe('run — screenshots', () => {
  it('does not call screenshot by default', async () => {
    const driver = createMockDriver()
    await run(driver, SCENARIO)

    expect(driver.calls.some(c => c.method === 'screenshot')).toBe(false)
  })

  it('captures screenshot after each step when captureScreenshots: true', async () => {
    const driver = createMockDriver()
    const result = await run(driver, SCENARIO, { captureScreenshots: true })

    const screenshots = driver.calls.filter(c => c.method === 'screenshot')
    expect(screenshots).toHaveLength(4)
    expect(result.steps.every(s => s.screenshot instanceof Buffer)).toBe(true)
  })
})

describe('run — abort', () => {
  it('returns aborted status when signal is already aborted', async () => {
    const driver = createMockDriver()
    const controller = new AbortController()
    controller.abort()

    const result = await run(driver, SCENARIO, { abortSignal: controller.signal })

    expect(result.status).toBe('aborted')
    expect(driver.calls).toHaveLength(0)
  })

  it('aborts between steps when signal fires mid-run', async () => {
    const controller = new AbortController()
    let callCount = 0

    const driver = createMockDriver()
    const original = driver.goto.bind(driver)
    driver.goto = async (...args) => {
      callCount++
      await original(...args)
      if (callCount === 1) controller.abort()
    }

    const result = await run(driver, SCENARIO, { abortSignal: controller.signal })

    expect(result.status).toBe('aborted')
    expect(result.steps[0]!.status).toBe('success')
    expect(result.steps).toHaveLength(1)
  })
})
