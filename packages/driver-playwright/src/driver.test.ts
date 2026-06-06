import type { Driver } from '@demo-studio/shared'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createPlaywrightDriver } from './driver.js'
import type { FixtureServer } from './testing/fixture-server.js'
import { startFixtureServer } from './testing/fixture-server.js'

let server: FixtureServer
let driver: Driver

beforeAll(async () => {
  server = await startFixtureServer()
})

afterAll(async () => {
  await server.close()
})

beforeEach(async () => {
  driver = await createPlaywrightDriver({ headless: true })
})

afterEach(async () => {
  await driver.close()
})

describe('goto', () => {
  it('navigates to the fixture page', async () => {
    await expect(driver.goto(server.url)).resolves.toBeUndefined()
  })

  it('accepts waitUntil option', async () => {
    await expect(driver.goto(server.url, { waitUntil: 'networkidle' })).resolves.toBeUndefined()
  })
})

describe('click', () => {
  it('clicks the submit button and shows the result', async () => {
    await driver.goto(server.url)
    await driver.click('[data-testid="submit"]')
    await driver.waitFor('[data-testid="result"]', { state: 'visible' })
  })
})

describe('type', () => {
  it('fills input with value', async () => {
    await driver.goto(server.url)
    await driver.type('[data-testid="email"]', 'user@example.com')
    await driver.waitFor('[data-testid="email"]', { state: 'visible' })
  })

  it('clears existing value before typing when clear: true', async () => {
    await driver.goto(server.url)
    await driver.type('[data-testid="name"]', 'Old Name')
    await driver.type('[data-testid="name"]', 'New Name', { clear: true })
  })

  it('types with delay for realistic input', async () => {
    await driver.goto(server.url)
    await expect(
      driver.type('[data-testid="name"]', 'hello', { delay: 10 }),
    ).resolves.toBeUndefined()
  })
})

describe('waitFor', () => {
  it('waits for element to become visible after click', async () => {
    await driver.goto(server.url)
    await driver.click('[data-testid="submit"]')
    await expect(
      driver.waitFor('[data-testid="result"]', { state: 'visible', timeout: 3000 }),
    ).resolves.toBeUndefined()
  })

  it('throws when element is not found within timeout', async () => {
    await driver.goto(server.url)
    await expect(
      driver.waitFor('[data-testid="nonexistent"]', { timeout: 500 }),
    ).rejects.toThrow()
  })
})

describe('hover', () => {
  it('hovers over an element without throwing', async () => {
    await driver.goto(server.url)
    await expect(driver.hover('[data-testid="hover-target"]')).resolves.toBeUndefined()
  })
})

describe('scroll', () => {
  it('scrolls a scrollable container down', async () => {
    await driver.goto(server.url)
    await expect(
      driver.scroll('[data-testid="scrollable"]', { direction: 'down', amount: 200 }),
    ).resolves.toBeUndefined()
  })

  it('scrolls up after scrolling down', async () => {
    await driver.goto(server.url)
    await driver.scroll('[data-testid="scrollable"]', { direction: 'down', amount: 200 })
    await expect(
      driver.scroll('[data-testid="scrollable"]', { direction: 'up', amount: 100 }),
    ).resolves.toBeUndefined()
  })
})

describe('screenshot', () => {
  it('returns a non-empty PNG buffer', async () => {
    await driver.goto(server.url)
    const buf = await driver.screenshot()
    expect(buf).toBeInstanceOf(Buffer)
    expect(buf.length).toBeGreaterThan(0)
    // PNG magic bytes: 89 50 4E 47
    expect(buf[0]).toBe(0x89)
    expect(buf[1]).toBe(0x50)
  })
})

describe('full scenario flow', () => {
  it('goto → type × 2 → click → waitFor runs end-to-end', async () => {
    await driver.goto(server.url)
    await driver.type('[data-testid="email"]', 'user@example.com')
    await driver.type('[data-testid="name"]', 'Alice')
    await driver.click('[data-testid="submit"]')
    await driver.waitFor('[data-testid="result"]', { state: 'visible' })
  })
})
