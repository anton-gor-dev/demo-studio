import { ValidationError } from '@demo-studio/shared'
import type { DemoScenario, Step } from './types.js'

export interface ValidationIssue {
  stepIndex?: number
  field: string
  message: string
  severity: 'error' | 'warning'
}

export interface ValidationResult {
  valid: boolean
  issues: ValidationIssue[]
}

// Selectors that look like unstable auto-generated paths
const FRAGILE_SELECTOR_RE = /(:nth-child\(\d+\).*){2,}/

export function validate(scenario: DemoScenario): ValidationResult {
  const issues: ValidationIssue[] = []

  scenario.steps.forEach((step, i) => validateStep(step, i, issues))

  return {
    valid: !issues.some(i => i.severity === 'error'),
    issues,
  }
}

/**
 * Throws ValidationError if any errors are present. Warnings are ignored.
 */
export function assertValid(scenario: DemoScenario): void {
  const result = validate(scenario)
  if (!result.valid) {
    const message = result.issues
      .filter(i => i.severity === 'error')
      .map(i => {
        const prefix = i.stepIndex !== undefined ? `step[${i.stepIndex}].${i.field}` : i.field
        return `  ${prefix}: ${i.message}`
      })
      .join('\n')
    throw new ValidationError(`Scenario validation failed:\n${message}`)
  }
}

function validateStep(step: Step, stepIndex: number, issues: ValidationIssue[]): void {
  if (step.action === 'type' && step.value === '') {
    issues.push({
      stepIndex,
      field: 'value',
      message: 'type action has an empty value — did you mean to clear the field?',
      severity: 'warning',
    })
  }

  if ('selector' in step) {
    const { selector } = step

    if (selector !== selector.trim()) {
      issues.push({
        stepIndex,
        field: 'selector',
        message: 'selector has leading or trailing whitespace',
        severity: 'error',
      })
    }

    if (FRAGILE_SELECTOR_RE.test(selector)) {
      issues.push({
        stepIndex,
        field: 'selector',
        message:
          'selector relies on positional :nth-child chains and may break on DOM changes — prefer [data-testid] or aria attributes',
        severity: 'warning',
      })
    }
  }
}
