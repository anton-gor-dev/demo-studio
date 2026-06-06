import { describe, expect, it } from 'vitest'
import { stepLabel } from './step-label.js'

describe('stepLabel', () => {
  it('goto — shows URL', () => {
    expect(stepLabel({ action: 'goto', url: 'https://example.com' })).toContain('https://example.com')
  })

  it('goto — truncates long URL', () => {
    const long = 'https://example.com/' + 'a'.repeat(60)
    expect(stepLabel({ action: 'goto', url: long }).length).toBeLessThan(80)
  })

  it('click — shows selector', () => {
    expect(stepLabel({ action: 'click', selector: '[data-testid="btn"]' })).toContain('[data-testid="btn"]')
  })

  it('type — shows selector and truncated value', () => {
    const label = stepLabel({ action: 'type', selector: '#email', value: 'user@example.com' })
    expect(label).toContain('#email')
    expect(label).toContain('←')
  })

  it('waitFor — includes state when present', () => {
    const label = stepLabel({ action: 'waitFor', selector: '.spinner', state: 'hidden' })
    expect(label).toContain('hidden')
  })

  it('waitFor — omits state when absent', () => {
    const label = stepLabel({ action: 'waitFor', selector: '.spinner' })
    expect(label).not.toContain('(')
  })

  it('hover — shows selector', () => {
    expect(stepLabel({ action: 'hover', selector: '.tooltip' })).toContain('.tooltip')
  })

  it('scroll — shows direction and amount', () => {
    const label = stepLabel({ action: 'scroll', selector: '.feed', direction: 'down', amount: 300 })
    expect(label).toContain('down')
    expect(label).toContain('300px')
  })

  it('switchContext — shows target context', () => {
    expect(stepLabel({ action: 'switchContext', to: 'popup' })).toContain('popup')
  })
})
