import type { Step } from '@demo-studio/core-dsl'
import type { RunResult, StepResult } from '@demo-studio/shared'

export interface RunOptions {
  /** Default timeout per step in ms. Default: 10_000 */
  defaultTimeout?: number
  /** Delay between steps in ms for paced visual playback. Default: 0 */
  stepDelay?: number
  /** Capture a screenshot after each successful step. Default: false */
  captureScreenshots?: boolean
  /** Validate steps without executing them. Default: false */
  dryRun?: boolean
  /** Cancel the run when this signal fires. */
  abortSignal?: AbortSignal
  /** Called before a step is executed. */
  onStepStart?: (stepIndex: number, step: Step) => void
  /** Called after a step completes successfully. */
  onStepDone?: (result: StepResult) => void
  /** Called when a step fails. Run halts after this. */
  onStepError?: (result: StepResult) => void
  /** Called after the entire run completes (success, failed, or aborted). */
  onRunDone?: (result: RunResult) => void
}

export interface ResolvedOptions {
  defaultTimeout: number
  stepDelay: number
  captureScreenshots: boolean
  dryRun: boolean
  abortSignal: AbortSignal | undefined
  onStepStart: NonNullable<RunOptions['onStepStart']>
  onStepDone: NonNullable<RunOptions['onStepDone']>
  onStepError: NonNullable<RunOptions['onStepError']>
  onRunDone: NonNullable<RunOptions['onRunDone']>
}

const noop = () => undefined

export function resolveOptions(opts: RunOptions = {}): ResolvedOptions {
  return {
    defaultTimeout: opts.defaultTimeout ?? 10_000,
    stepDelay: opts.stepDelay ?? 0,
    captureScreenshots: opts.captureScreenshots ?? false,
    dryRun: opts.dryRun ?? false,
    abortSignal: opts.abortSignal,
    onStepStart: opts.onStepStart ?? noop,
    onStepDone: opts.onStepDone ?? noop,
    onStepError: opts.onStepError ?? noop,
    onRunDone: opts.onRunDone ?? noop,
  }
}
