import { describe, expect, it } from 'vitest'
import {
  ClickStepSchema,
  GotoStepSchema,
  HoverStepSchema,
  ScrollStepSchema,
  StepSchema,
  SwitchContextStepSchema,
  TypeStepSchema,
  WaitForStepSchema,
} from './actions.js'

describe('GotoStepSchema', () => {
  it('parses minimal valid step', () => {
    const result = GotoStepSchema.safeParse({ action: 'goto', url: 'https://example.com' })
    expect(result.success).toBe(true)
  })

  it('parses all optional fields', () => {
    const result = GotoStepSchema.safeParse({
      action: 'goto',
      url: 'https://example.com',
      waitUntil: 'networkidle',
      timeout: 5000,
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid URL', () => {
    const result = GotoStepSchema.safeParse({ action: 'goto', url: 'not-a-url' })
    expect(result.success).toBe(false)
  })

  it('rejects unknown waitUntil value', () => {
    const result = GotoStepSchema.safeParse({
      action: 'goto',
      url: 'https://example.com',
      waitUntil: 'ready',
    })
    expect(result.success).toBe(false)
  })

  it('rejects negative timeout', () => {
    const result = GotoStepSchema.safeParse({
      action: 'goto',
      url: 'https://example.com',
      timeout: -1,
    })
    expect(result.success).toBe(false)
  })
})

describe('ClickStepSchema', () => {
  it('parses minimal valid step', () => {
    const result = ClickStepSchema.safeParse({ action: 'click', selector: '#btn' })
    expect(result.success).toBe(true)
  })

  it('parses with all optional fields', () => {
    const result = ClickStepSchema.safeParse({
      action: 'click',
      selector: '[data-testid="submit"]',
      button: 'right',
      modifiers: ['Shift', 'Control'],
      timeout: 3000,
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty selector', () => {
    const result = ClickStepSchema.safeParse({ action: 'click', selector: '' })
    expect(result.success).toBe(false)
  })

  it('rejects unknown modifier', () => {
    const result = ClickStepSchema.safeParse({
      action: 'click',
      selector: '#btn',
      modifiers: ['Windows'],
    })
    expect(result.success).toBe(false)
  })
})

describe('TypeStepSchema', () => {
  it('parses step with empty value (allowed at schema level)', () => {
    const result = TypeStepSchema.safeParse({ action: 'type', selector: '#email', value: '' })
    expect(result.success).toBe(true)
  })

  it('parses with all optional fields', () => {
    const result = TypeStepSchema.safeParse({
      action: 'type',
      selector: '#email',
      value: 'user@example.com',
      delay: 50,
      clear: true,
      timeout: 2000,
    })
    expect(result.success).toBe(true)
  })

  it('rejects negative delay', () => {
    const result = TypeStepSchema.safeParse({
      action: 'type',
      selector: '#email',
      value: 'test',
      delay: -10,
    })
    expect(result.success).toBe(false)
  })
})

describe('WaitForStepSchema', () => {
  it('parses all state variants', () => {
    for (const state of ['visible', 'hidden', 'attached', 'detached'] as const) {
      const result = WaitForStepSchema.safeParse({ action: 'waitFor', selector: '.spinner', state })
      expect(result.success, `state="${state}" should be valid`).toBe(true)
    }
  })
})

describe('HoverStepSchema', () => {
  it('parses valid step', () => {
    const result = HoverStepSchema.safeParse({ action: 'hover', selector: '[data-testid="tooltip"]' })
    expect(result.success).toBe(true)
  })
})

describe('ScrollStepSchema', () => {
  it('parses all direction variants', () => {
    for (const direction of ['up', 'down', 'left', 'right'] as const) {
      const result = ScrollStepSchema.safeParse({ action: 'scroll', selector: '.feed', direction })
      expect(result.success, `direction="${direction}" should be valid`).toBe(true)
    }
  })

  it('rejects non-positive amount', () => {
    const result = ScrollStepSchema.safeParse({ action: 'scroll', selector: '.feed', amount: 0 })
    expect(result.success).toBe(false)
  })
})

describe('SwitchContextStepSchema', () => {
  it('parses all context variants', () => {
    for (const to of ['page', 'popup', 'background'] as const) {
      const result = SwitchContextStepSchema.safeParse({ action: 'switchContext', to })
      expect(result.success, `to="${to}" should be valid`).toBe(true)
    }
  })
})

describe('StepSchema (discriminated union)', () => {
  it('routes to correct schema based on action field', () => {
    const steps = [
      { action: 'goto', url: 'https://example.com' },
      { action: 'click', selector: '#btn' },
      { action: 'type', selector: '#input', value: 'hello' },
      { action: 'waitFor', selector: '.result' },
      { action: 'hover', selector: '.tooltip' },
      { action: 'scroll', selector: '.list' },
      { action: 'switchContext', to: 'popup' },
    ]

    for (const step of steps) {
      const result = StepSchema.safeParse(step)
      expect(result.success, `action="${step.action}" should parse`).toBe(true)
    }
  })

  it('rejects unknown action type', () => {
    const result = StepSchema.safeParse({ action: 'doubleClick', selector: '#btn' })
    expect(result.success).toBe(false)
  })

  it('rejects step missing required fields', () => {
    const result = StepSchema.safeParse({ action: 'click' })
    expect(result.success).toBe(false)
  })
})
