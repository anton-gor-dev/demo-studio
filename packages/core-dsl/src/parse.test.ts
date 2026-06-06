import { ParseError } from '@demo-studio/shared'
import { describe, expect, it } from 'vitest'
import { parse } from './parse.js'
import type { DemoScenario } from './types.js'

const VALID_SCENARIO: DemoScenario = {
  version: '1.0',
  name: 'Login flow',
  steps: [
    { action: 'goto', url: 'https://app.example.com/login' },
    { action: 'type', selector: '#email', value: 'user@example.com' },
    { action: 'type', selector: '#password', value: 's3cr3t', clear: true },
    { action: 'click', selector: '[data-testid="submit"]' },
    { action: 'waitFor', selector: '.dashboard', state: 'visible', timeout: 10000 },
  ],
}

describe('parse', () => {
  describe('valid inputs', () => {
    it('returns parsed scenario for valid input', () => {
      const result = parse(VALID_SCENARIO)
      expect(result.name).toBe('Login flow')
      expect(result.steps).toHaveLength(5)
    })

    it('accepts optional description and networkMocks', () => {
      const result = parse({
        ...VALID_SCENARIO,
        description: 'Tests the login flow end-to-end',
        networkMocks: [
          {
            url: '**/api/session',
            method: 'POST',
            response: { status: 200, body: { token: 'abc' } },
          },
        ],
      })
      expect(result.description).toBe('Tests the login flow end-to-end')
      expect(result.networkMocks).toHaveLength(1)
    })

    it('applies networkMock response status default of 200', () => {
      const result = parse({
        ...VALID_SCENARIO,
        networkMocks: [{ url: '**/api/health', response: {} }],
      })
      expect(result.networkMocks?.[0]?.response.status).toBe(200)
    })

    it('accepts all action types in a single scenario', () => {
      const result = parse({
        version: '1.0',
        name: 'All actions',
        steps: [
          { action: 'goto', url: 'https://example.com' },
          { action: 'click', selector: '#btn', button: 'left', modifiers: ['Shift'] },
          { action: 'type', selector: '#input', value: 'hello', delay: 50, clear: false },
          { action: 'waitFor', selector: '.spinner', state: 'hidden' },
          { action: 'hover', selector: '.tooltip' },
          { action: 'scroll', selector: '.feed', direction: 'down', amount: 300 },
          { action: 'switchContext', to: 'popup' },
        ],
      })
      expect(result.steps).toHaveLength(7)
    })
  })

  describe('invalid inputs', () => {
    it('throws ParseError for null', () => {
      expect(() => parse(null)).toThrow(ParseError)
    })

    it('throws ParseError for a plain string', () => {
      expect(() => parse('not an object')).toThrow(ParseError)
    })

    it('throws ParseError for wrong version', () => {
      expect(() => parse({ ...VALID_SCENARIO, version: '2.0' })).toThrow(ParseError)
    })

    it('throws ParseError for missing version', () => {
      const { version: _, ...rest } = VALID_SCENARIO
      expect(() => parse(rest)).toThrow(ParseError)
    })

    it('throws ParseError for empty name', () => {
      expect(() => parse({ ...VALID_SCENARIO, name: '' })).toThrow(ParseError)
    })

    it('throws ParseError for empty steps array', () => {
      expect(() => parse({ ...VALID_SCENARIO, steps: [] })).toThrow(ParseError)
    })

    it('throws ParseError for unknown action type', () => {
      expect(() =>
        parse({
          ...VALID_SCENARIO,
          steps: [{ action: 'doubleClick', selector: '#btn' }],
        }),
      ).toThrow(ParseError)
    })

    it('throws ParseError for invalid URL in goto', () => {
      expect(() =>
        parse({
          ...VALID_SCENARIO,
          steps: [{ action: 'goto', url: 'not-a-url' }],
        }),
      ).toThrow(ParseError)
    })

    it('error message lists all failing fields', () => {
      try {
        parse({ ...VALID_SCENARIO, name: '', steps: [] })
        expect.fail('should have thrown')
      }
      catch (err) {
        expect(err).toBeInstanceOf(ParseError)
        const message = (err as ParseError).message
        expect(message).toContain('name')
        expect(message).toContain('steps')
      }
    })

    it('error cause is a ZodError', () => {
      try {
        parse({ ...VALID_SCENARIO, name: '' })
        expect.fail('should have thrown')
      }
      catch (err) {
        expect((err as ParseError).cause).toBeDefined()
      }
    })
  })
})
