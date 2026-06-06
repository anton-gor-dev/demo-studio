import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'demo-runner',
    environment: 'node',
    passWithNoTests: true,
  },
})
