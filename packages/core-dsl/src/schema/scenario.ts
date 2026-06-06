import { z } from 'zod'
import { StepSchema } from './actions.js'

const NetworkMockResponseSchema = z.object({
  status: z.number().int().min(100).max(599).default(200),
  body: z.unknown().optional(),
  headers: z.record(z.string(), z.string()).optional(),
})

const NetworkMockSchema = z.object({
  url: z.string().min(1, 'mock url pattern must not be empty'),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']).optional(),
  response: NetworkMockResponseSchema,
})

export const DemoScenarioSchema = z.object({
  version: z.literal('1.0'),
  name: z.string().min(1, 'scenario name must not be empty'),
  description: z.string().optional(),
  networkMocks: z.array(NetworkMockSchema).optional(),
  steps: z.array(StepSchema).min(1, 'scenario must contain at least one step'),
})
