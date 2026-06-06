import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'driver-playwright',
    environment: 'node',
    passWithNoTests: true,
  },
})
