import { ParseError } from '@demo-studio/shared'
import { DemoScenarioSchema } from './schema/scenario.js'
import type { DemoScenario } from './types.js'

export function parse(input: unknown): DemoScenario {
  const result = DemoScenarioSchema.safeParse(input)

  if (!result.success) {
    const message = result.error.issues
      .map(issue => {
        const path = issue.path.length > 0 ? issue.path.join('.') : '(root)'
        return `  ${path}: ${issue.message}`
      })
      .join('\n')

    throw new ParseError(`Invalid DSL scenario:\n${message}`, { cause: result.error })
  }

  return result.data
}
