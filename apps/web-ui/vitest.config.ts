import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'web-ui',
    environment: 'jsdom',
    passWithNoTests: true,
  },
})
