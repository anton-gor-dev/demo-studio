import type { ContextType, Driver } from '@demo-studio/shared'

export interface MockCall {
  method: string
  args: unknown[]
}

export interface MockDriverOptions {
  /** If set, the driver will throw this error when the call count reaches this number (1-based). */
  failOnCall?: number
  failWith?: Error
}

export function createMockDriver(opts: MockDriverOptions = {}): Driver & { calls: MockCall[] } {
  const calls: MockCall[] = []
  let callCount = 0

  const record =
    <T extends unknown[]>(method: string) =>
    async (...args: T): Promise<void> => {
      callCount++
      calls.push({ method, args })
      if (opts.failOnCall !== undefined && callCount === opts.failOnCall) {
        throw opts.failWith ?? new Error(`Mock driver: forced failure on call ${callCount}`)
      }
    }

  return {
    calls,
    goto: record('goto'),
    click: record('click'),
    type: record('type'),
    waitFor: record('waitFor'),
    hover: record('hover'),
    scroll: record('scroll'),
    switchContext: record<[ContextType]>('switchContext'),
    screenshot: async () => {
      calls.push({ method: 'screenshot', args: [] })
      return Buffer.from('mock-screenshot')
    },
    close: async () => {
      calls.push({ method: 'close', args: [] })
    },
  }
}
