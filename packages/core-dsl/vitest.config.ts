import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'core-dsl',
    environment: 'node',
    passWithNoTests: true,
  },
})
