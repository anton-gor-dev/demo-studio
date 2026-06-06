import type { Step } from '@demo-studio/core-dsl'

const MAX_SELECTOR = 40
const MAX_VALUE = 24
const MAX_URL = 50

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + '…' : s
}

export function stepLabel(step: Step): string {
  switch (step.action) {
    case 'goto':
      return `goto  ${truncate(step.url, MAX_URL)}`
    case 'click':
      return `click  ${truncate(step.selector, MAX_SELECTOR)}`
    case 'type': {
      const val = truncate(JSON.stringify(step.value), MAX_VALUE)
      return `type   ${truncate(step.selector, MAX_SELECTOR)}  ← ${val}`
    }
    case 'waitFor': {
      const state = step.state ? ` (${step.state})` : ''
      return `waitFor  ${truncate(step.selector, MAX_SELECTOR)}${state}`
    }
    case 'hover':
      return `hover  ${truncate(step.selector, MAX_SELECTOR)}`
    case 'scroll': {
      const dir = step.direction ?? 'down'
      const amt = step.amount !== undefined ? `${step.amount}px` : ''
      return `scroll  ${truncate(step.selector, MAX_SELECTOR)}  ${dir}${amt ? ` ${amt}` : ''}`
    }
    case 'switchContext':
      return `switchContext  → ${step.to}`
  }
}
