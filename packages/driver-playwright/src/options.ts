export interface PlaywrightDriverOptions {
  browser?: 'chromium' | 'firefox' | 'webkit'
  headless?: boolean
  viewport?: { width: number; height: number }
  /** Slows down Playwright operations by the specified ms. Useful for visual debugging. */
  slowMo?: number
  /**
   * Path to an unpacked Chrome extension directory.
   * When set, launches a persistent context with the extension loaded (M4).
   */
  extensionPath?: string
}

export interface ResolvedDriverOptions {
  browser: 'chromium' | 'firefox' | 'webkit'
  headless: boolean
  viewport: { width: number; height: number }
  slowMo: number
  extensionPath: string | undefined
}

export function resolveDriverOptions(opts: PlaywrightDriverOptions = {}): ResolvedDriverOptions {
  return {
    browser: opts.browser ?? 'chromium',
    headless: opts.headless ?? true,
    viewport: opts.viewport ?? { width: 1280, height: 720 },
    slowMo: opts.slowMo ?? 0,
    extensionPath: opts.extensionPath,
  }
}
