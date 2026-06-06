import type { Driver } from '@demo-studio/shared'
import { chromium, firefox, webkit } from 'playwright'
import type { Browser, BrowserContext, Page } from 'playwright'
import { resolveDriverOptions } from './options.js'
import type { PlaywrightDriverOptions } from './options.js'

const launchers = { chromium, firefox, webkit }

export async function createPlaywrightDriver(options?: PlaywrightDriverOptions): Promise<Driver> {
  const opts = resolveDriverOptions(options)
  const launcher = launchers[opts.browser]

  let browser: Browser | undefined
  let context: BrowserContext
  let page: Page

  if (opts.extensionPath) {
    // Persistent context required for extension support (chromium only, M4)
    const { mkdtemp } = await import('node:fs/promises')
    const { join } = await import('node:path')
    const { tmpdir } = await import('node:os')
    const userDataDir = await mkdtemp(join(tmpdir(), 'demo-studio-ext-'))

    context = await chromium.launchPersistentContext(userDataDir, {
      headless: opts.headless,
      slowMo: opts.slowMo,
      viewport: opts.viewport,
      args: [
        `--load-extension=${opts.extensionPath}`,
        `--disable-extensions-except=${opts.extensionPath}`,
      ],
    })
  }
  else {
    browser = await launcher.launch({ headless: opts.headless, slowMo: opts.slowMo })
    context = await browser.newContext({ viewport: opts.viewport })
  }

  page = await context.newPage()

  return {
    goto: async (url, gotoOpts) => {
      await page.goto(url, {
        ...(gotoOpts?.waitUntil !== undefined && { waitUntil: gotoOpts.waitUntil }),
        ...(gotoOpts?.timeout !== undefined && { timeout: gotoOpts.timeout }),
      })
    },

    click: async (selector, clickOpts) => {
      await page.locator(selector).click({
        ...(clickOpts?.button !== undefined && { button: clickOpts.button }),
        ...(clickOpts?.modifiers !== undefined && { modifiers: clickOpts.modifiers }),
        ...(clickOpts?.timeout !== undefined && { timeout: clickOpts.timeout }),
      })
    },

    type: async (selector, value, typeOpts) => {
      const locator = page.locator(selector)
      if (typeOpts?.clear) {
        await locator.clear({ ...(typeOpts.timeout !== undefined && { timeout: typeOpts.timeout }) })
      }
      if (typeOpts?.delay) {
        await locator.pressSequentially(value, {
          delay: typeOpts.delay,
          ...(typeOpts.timeout !== undefined && { timeout: typeOpts.timeout }),
        })
      }
      else {
        await locator.fill(value, {
          ...(typeOpts?.timeout !== undefined && { timeout: typeOpts.timeout }),
        })
      }
    },

    waitFor: async (selector, waitOpts) => {
      await page.locator(selector).waitFor({
        ...(waitOpts?.state !== undefined && { state: waitOpts.state }),
        ...(waitOpts?.timeout !== undefined && { timeout: waitOpts.timeout }),
      })
    },

    hover: async (selector, hoverOpts) => {
      await page.locator(selector).hover({
        ...(hoverOpts?.timeout !== undefined && { timeout: hoverOpts.timeout }),
      })
    },

    scroll: async (selector, scrollOpts) => {
      const locator = page.locator(selector)
      await locator.waitFor({ state: 'visible' })
      const direction = scrollOpts?.direction ?? 'down'
      const amount = scrollOpts?.amount ?? 300
      const deltaX = direction === 'left' ? -amount : direction === 'right' ? amount : 0
      const deltaY = direction === 'up' ? -amount : direction === 'down' ? amount : 0
      await locator.evaluate(
        (el, delta) => { el.scrollBy(delta.x, delta.y) },
        { x: deltaX, y: deltaY },
      )
    },

    screenshot: () => page.screenshot({ type: 'png' }),

    switchContext: async (to) => {
      if (to === 'popup') {
        const popup = context.pages().find(p => p !== page)
        if (!popup) throw new Error('No popup page found in browser context')
        page = popup
      }
      else if (to === 'page') {
        const mainPage = context.pages()[0]
        if (!mainPage) throw new Error('No main page found in browser context')
        page = mainPage
      }
    },

    close: async () => {
      await context.close()
      await browser?.close()
    },
  }
}
