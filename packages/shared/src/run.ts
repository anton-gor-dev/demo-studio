import type { DemoStudioError } from './errors.js'

export type RunStatus = 'success' | 'failed' | 'aborted'
export type StepStatus = 'success' | 'failed' | 'skipped'

export interface StepResult {
  stepIndex: number
  action: string
  status: StepStatus
  duration: number
  error?: DemoStudioError
  screenshot?: Buffer
}

export interface RunResult {
  status: RunStatus
  steps: StepResult[]
  duration: number
  error?: DemoStudioError
}
