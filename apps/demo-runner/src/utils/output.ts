const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
}

const NO_COLOR = Boolean(process.env['NO_COLOR']) || !process.stdout.isTTY

const paint = (code: string, text: string) =>
  NO_COLOR ? text : `${code}${text}${c.reset}`

export const fmt = {
  bold: (s: string) => paint(c.bold, s),
  dim: (s: string) => paint(c.dim, s),
  green: (s: string) => paint(c.green, s),
  red: (s: string) => paint(c.red, s),
  yellow: (s: string) => paint(c.yellow, s),
  cyan: (s: string) => paint(c.cyan, s),
  gray: (s: string) => paint(c.gray, s),
}

export function printLine(msg: string = ''): void {
  process.stdout.write(msg + '\n')
}

export function printErr(msg: string): void {
  process.stderr.write(msg + '\n')
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

export function padEnd(s: string, len: number): string {
  return s.length >= len ? s : s + ' '.repeat(len - s.length)
}
