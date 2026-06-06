import type { z } from 'zod'
import type {
  ClickStepSchema,
  GotoStepSchema,
  HoverStepSchema,
  ScrollStepSchema,
  StepSchema,
  SwitchContextStepSchema,
  TypeStepSchema,
  WaitForStepSchema,
} from './schema/actions.js'
import type { DemoScenarioSchema } from './schema/scenario.js'

export type DemoScenario = z.infer<typeof DemoScenarioSchema>
export type Step = z.infer<typeof StepSchema>
export type GotoStep = z.infer<typeof GotoStepSchema>
export type ClickStep = z.infer<typeof ClickStepSchema>
export type TypeStep = z.infer<typeof TypeStepSchema>
export type WaitForStep = z.infer<typeof WaitForStepSchema>
export type HoverStep = z.infer<typeof HoverStepSchema>
export type ScrollStep = z.infer<typeof ScrollStepSchema>
export type SwitchContextStep = z.infer<typeof SwitchContextStepSchema>
