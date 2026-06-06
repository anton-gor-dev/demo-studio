import { parse } from '@demo-studio/core-dsl'
import type { DemoScenario } from '@demo-studio/core-dsl'
import { ParseError } from '@demo-studio/shared'
import { readFile } from 'node:fs/promises'

export async function readScenario(filePath: string): Promise<DemoScenario> {
  let raw: string

  try {
    raw = await readFile(filePath, 'utf-8')
  }
  catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    throw new Error(`Cannot read file "${filePath}": ${msg}`)
  }

  let json: unknown
  try {
    json = JSON.parse(raw)
  }
  catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    throw new ParseError(`"${filePath}" contains invalid JSON: ${msg}`, { cause: err })
  }

  return parse(json)
}
