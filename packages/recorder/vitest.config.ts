import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'recorder',
    environment: 'node',
    passWithNoTests: true,
  },
})
