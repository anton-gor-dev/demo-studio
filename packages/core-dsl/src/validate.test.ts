import { ValidationError } from '@demo-studio/shared'
import { describe, expect, it } from 'vitest'
import type { DemoScenario } from './types.js'
import { assertValid, validate } from './validate.js'

const BASE: DemoScenario = {
  version: '1.0',
  name: 'Base scenario',
  steps: [
    { action: 'goto', url: 'https://example.com' },
    { action: 'click', selector: '[data-testid="btn"]' },
  ],
}

describe('validate', () => {
  it('returns valid=true and no issues for a clean scenario', () => {
    const result = validate(BASE)
    expect(result.valid).toBe(true)
    expect(result.issues).toHaveLength(0)
  })

  describe('selector whitespace (error)', () => {
    it('flags leading whitespace', () => {
      const result = validate({
        ...BASE,
        steps: [{ action: 'click', selector: ' #btn' }],
      })
      expect(result.valid).toBe(false)
      expect(result.issues).toHaveLength(1)
      expect(result.issues[0]).toMatchObject({
        stepIndex: 0,
        field: 'selector',
        severity: 'error',
      })
    })

    it('flags trailing whitespace', () => {
      const result = validate({
        ...BASE,
        steps: [{ action: 'click', selector: '#btn ' }],
      })
      expect(result.valid).toBe(false)
    })
  })

  describe('fragile selectors (warning)', () => {
    it('warns about multiple :nth-child chains', () => {
      const result = validate({
        ...BASE,
        steps: [{ action: 'click', selector: 'div:nth-child(2) > span:nth-child(1) > a:nth-child(3)' }],
      })
      expect(result.valid).toBe(true) // warnings don't fail validation
      const warnings = result.issues.filter(i => i.severity === 'warning')
      expect(warnings).toHaveLength(1)
      expect(warnings[0]?.field).toBe('selector')
    })

    it('does not warn for a single :nth-child', () => {
      const result = validate({
        ...BASE,
        steps: [{ action: 'click', selector: 'ul:nth-child(1) > li' }],
      })
      const warnings = result.issues.filter(i => i.severity === 'warning')
      expect(warnings).toHaveLength(0)
    })
  })

  describe('empty type value (warning)', () => {
    it('warns when type value is empty string', () => {
      const result = validate({
        ...BASE,
        steps: [{ action: 'type', selector: '#input', value: '' }],
      })
      expect(result.valid).toBe(true)
      const warnings = result.issues.filter(i => i.severity === 'warning')
      expect(warnings).toHaveLength(1)
      expect(warnings[0]?.stepIndex).toBe(0)
    })

    it('does not warn for non-empty type value', () => {
      const result = validate({
        ...BASE,
        steps: [{ action: 'type', selector: '#input', value: 'hello' }],
      })
      expect(result.issues).toHaveLength(0)
    })
  })

  it('reports issues for multiple steps with correct stepIndex', () => {
    const result = validate({
      ...BASE,
      steps: [
        { action: 'click', selector: ' #btn' },
        { action: 'click', selector: '#ok' },
        { action: 'type', selector: '#input ', value: 'x' },
      ],
    })
    const errorIndices = result.issues.filter(i => i.severity === 'error').map(i => i.stepIndex)
    expect(errorIndices).toContain(0)
    expect(errorIndices).toContain(2)
  })

  it('goto and switchContext steps have no selector to validate', () => {
    const result = validate({
      ...BASE,
      steps: [
        { action: 'goto', url: 'https://example.com' },
        { action: 'switchContext', to: 'popup' },
      ],
    })
    expect(result.issues).toHaveLength(0)
  })
})

describe('assertValid', () => {
  it('does not throw for a valid scenario', () => {
    expect(() => assertValid(BASE)).not.toThrow()
  })

  it('throws ValidationError when errors exist', () => {
    const bad: DemoScenario = {
      ...BASE,
      steps: [{ action: 'click', selector: ' #btn' }],
    }
    expect(() => assertValid(bad)).toThrow(ValidationError)
  })

  it('does not throw when only warnings exist', () => {
    const withWarning: DemoScenario = {
      ...BASE,
      steps: [{ action: 'type', selector: '#input', value: '' }],
    }
    expect(() => assertValid(withWarning)).not.toThrow()
  })

  it('error message lists affected steps and fields', () => {
    try {
      assertValid({ ...BASE, steps: [{ action: 'click', selector: ' #btn' }] })
      expect.fail('should have thrown')
    }
    catch (err) {
      expect(err).toBeInstanceOf(ValidationError)
      expect((err as ValidationError).message).toContain('selector')
    }
  })
})
