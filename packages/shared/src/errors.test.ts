import { describe, expect, it } from 'vitest'
import {
  ActionError,
  ContextSwitchError,
  DemoStudioError,
  DriverError,
  FfmpegNotFoundError,
  ParseError,
  SelectorNotFoundError,
  StepError,
  TimeoutError,
  ValidationError,
} from './errors.js'

describe('DemoStudioError', () => {
  it('sets name, code, message', () => {
    const err = new DemoStudioError('something went wrong', 'GENERIC')
    expect(err.name).toBe('DemoStudioError')
    expect(err.code).toBe('GENERIC')
    expect(err.message).toBe('something went wrong')
  })

  it('is instanceof Error', () => {
    expect(new DemoStudioError('x', 'X')).toBeInstanceOf(Error)
  })

  it('preserves cause chain', () => {
    const cause = new Error('root cause')
    const err = new DemoStudioError('wrapper', 'WRAPPER', { cause })
    expect(err.cause).toBe(cause)
  })
})

describe('ParseError', () => {
  it('has code PARSE_ERROR and extends DemoStudioError', () => {
    const err = new ParseError('invalid JSON at line 3')
    expect(err.code).toBe('PARSE_ERROR')
    expect(err).toBeInstanceOf(DemoStudioError)
    expect(err).toBeInstanceOf(Error)
  })
})

describe('ValidationError', () => {
  it('has code VALIDATION_ERROR', () => {
    const err = new ValidationError('selector is required')
    expect(err.code).toBe('VALIDATION_ERROR')
    expect(err).toBeInstanceOf(DemoStudioError)
  })
})

describe('StepError', () => {
  it('exposes stepIndex', () => {
    const err = new StepError('step failed', 'STEP_FAILED', 3)
    expect(err.stepIndex).toBe(3)
    expect(err.code).toBe('STEP_FAILED')
    expect(err).toBeInstanceOf(DemoStudioError)
  })
})

describe('TimeoutError', () => {
  it('has correct code, stepIndex, timeout', () => {
    const err = new TimeoutError('element not found after 10000ms', 2, 10_000)
    expect(err.code).toBe('TIMEOUT')
    expect(err.stepIndex).toBe(2)
    expect(err.timeout).toBe(10_000)
  })

  it('is instanceof StepError and DemoStudioError', () => {
    const err = new TimeoutError('timed out', 0, 5_000)
    expect(err).toBeInstanceOf(StepError)
    expect(err).toBeInstanceOf(DemoStudioError)
    expect(err).toBeInstanceOf(Error)
  })
})

describe('SelectorNotFoundError', () => {
  it('exposes selector', () => {
    const err = new SelectorNotFoundError('not found', 1, '[data-testid="submit"]')
    expect(err.selector).toBe('[data-testid="submit"]')
    expect(err.stepIndex).toBe(1)
    expect(err.code).toBe('SELECTOR_NOT_FOUND')
    expect(err).toBeInstanceOf(StepError)
  })
})

describe('ActionError', () => {
  it('has code ACTION_ERROR', () => {
    const err = new ActionError('click intercepted', 4)
    expect(err.code).toBe('ACTION_ERROR')
    expect(err.stepIndex).toBe(4)
    expect(err).toBeInstanceOf(StepError)
  })
})

describe('DriverError', () => {
  it('has code DRIVER_ERROR', () => {
    const err = new DriverError('browser crashed')
    expect(err.code).toBe('DRIVER_ERROR')
    expect(err).toBeInstanceOf(DemoStudioError)
  })
})

describe('ContextSwitchError', () => {
  it('embeds requested context in message and exposes it', () => {
    const err = new ContextSwitchError('popup')
    expect(err.requestedContext).toBe('popup')
    expect(err.message).toContain('popup')
    expect(err.code).toBe('CONTEXT_SWITCH_ERROR')
  })
})

describe('FfmpegNotFoundError', () => {
  it('has correct code and actionable message', () => {
    const err = new FfmpegNotFoundError()
    expect(err.code).toBe('FFMPEG_NOT_FOUND')
    expect(err.message).toContain('ffmpeg')
    expect(err.message).toContain('https://')
    expect(err).toBeInstanceOf(DemoStudioError)
  })
})

describe('instanceof across all subclasses', () => {
  const cases = [
    new ParseError('x'),
    new ValidationError('x'),
    new StepError('x', 'X', 0),
    new TimeoutError('x', 0, 1000),
    new SelectorNotFoundError('x', 0, '.btn'),
    new ActionError('x', 0),
    new DriverError('x'),
    new ContextSwitchError('page'),
    new FfmpegNotFoundError(),
  ]

  it.each(cases)('%s is instanceof DemoStudioError and Error', err => {
    expect(err).toBeInstanceOf(DemoStudioError)
    expect(err).toBeInstanceOf(Error)
  })
})
