import type { DemoScenario } from '@demo-studio/core-dsl'
import { ActionError, DemoStudioError } from '@demo-studio/shared'
import type { Driver, RunResult, StepResult } from '@demo-studio/shared'
import { dispatch } from './dispatcher.js'
import { resolveOptions } from './options.js'
import type { RunOptions } from './options.js'

export async function run(
  driver: Driver,
  scenario: DemoScenario,
  options?: RunOptions,
): Promise<RunResult> {
  const opts = resolveOptions(options)
  const runStart = Date.now()
  const stepResults: StepResult[] = []

  for (const [index, step] of scenario.steps.entries()) {
    if (opts.abortSignal?.aborted) {
      return finish('aborted', stepResults, runStart, opts.onRunDone)
    }

    const stepStart = Date.now()
    opts.onStepStart(index, step)

    try {
      if (!opts.dryRun) {
        await dispatch(driver, step, opts.defaultTimeout)
      }

      const screenshot = opts.captureScreenshots
        ? await driver.screenshot()
        : undefined

      const result: StepResult = {
        stepIndex: index,
        action: step.action,
        status: 'success',
        duration: Date.now() - stepStart,
        ...(screenshot !== undefined && { screenshot }),
      }

      stepResults.push(result)
      opts.onStepDone(result)
    }
    catch (err) {
      const error = err instanceof DemoStudioError
        ? err
        : new ActionError(
            err instanceof Error ? err.message : String(err),
            index,
            { cause: err },
          )

      const result: StepResult = {
        stepIndex: index,
        action: step.action,
        status: 'failed',
        duration: Date.now() - stepStart,
        error,
      }

      stepResults.push(result)
      opts.onStepError(result)
      return finish('failed', stepResults, runStart, opts.onRunDone, error)
    }

    if (opts.stepDelay > 0) {
      await sleep(opts.stepDelay)
    }
  }

  return finish('success', stepResults, runStart, opts.onRunDone)
}

function finish(
  status: RunResult['status'],
  steps: StepResult[],
  startedAt: number,
  onRunDone: (r: RunResult) => void,
  error?: DemoStudioError,
): RunResult {
  const result: RunResult = {
    status,
    steps,
    duration: Date.now() - startedAt,
    ...(error !== undefined && { error }),
  }
  onRunDone(result)
  return result
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
