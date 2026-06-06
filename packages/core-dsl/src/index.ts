export { parse } from './parse.js'
export { assertValid, validate } from './validate.js'
export type { ValidationIssue, ValidationResult } from './validate.js'

export {
  ClickStepSchema,
  GotoStepSchema,
  HoverStepSchema,
  ScrollStepSchema,
  StepSchema,
  SwitchContextStepSchema,
  TypeStepSchema,
  WaitForStepSchema,
} from './schema/actions.js'
export { DemoScenarioSchema } from './schema/scenario.js'

export type {
  ClickStep,
  DemoScenario,
  GotoStep,
  HoverStep,
  ScrollStep,
  Step,
  SwitchContextStep,
  TypeStep,
  WaitForStep,
} from './types.js'
