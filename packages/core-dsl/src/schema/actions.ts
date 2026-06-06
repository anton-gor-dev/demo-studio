import { z } from 'zod'

const selector = z.string().min(1, 'selector must not be empty')
const timeout = z.number().int().positive().optional()

export const GotoStepSchema = z.object({
  action: z.literal('goto'),
  url: z.string().url('url must be a valid URL'),
  waitUntil: z.enum(['load', 'domcontentloaded', 'networkidle']).optional(),
  timeout,
})

export const ClickStepSchema = z.object({
  action: z.literal('click'),
  selector,
  button: z.enum(['left', 'right', 'middle']).optional(),
  modifiers: z.array(z.enum(['Alt', 'Control', 'Meta', 'Shift'])).optional(),
  timeout,
})

export const TypeStepSchema = z.object({
  action: z.literal('type'),
  selector,
  value: z.string(),
  delay: z.number().int().nonnegative().optional(),
  clear: z.boolean().optional(),
  timeout,
})

export const WaitForStepSchema = z.object({
  action: z.literal('waitFor'),
  selector,
  state: z.enum(['visible', 'hidden', 'attached', 'detached']).optional(),
  timeout,
})

export const HoverStepSchema = z.object({
  action: z.literal('hover'),
  selector,
  timeout,
})

export const ScrollStepSchema = z.object({
  action: z.literal('scroll'),
  selector,
  direction: z.enum(['up', 'down', 'left', 'right']).optional(),
  amount: z.number().positive().optional(),
})

export const SwitchContextStepSchema = z.object({
  action: z.literal('switchContext'),
  to: z.enum(['page', 'popup', 'background']),
})

export const StepSchema = z.discriminatedUnion('action', [
  GotoStepSchema,
  ClickStepSchema,
  TypeStepSchema,
  WaitForStepSchema,
  HoverStepSchema,
  ScrollStepSchema,
  SwitchContextStepSchema,
])
