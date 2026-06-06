import { defineCommand, runMain } from 'citty'
import { runCommand } from './commands/run.js'

const main = defineCommand({
  meta: {
    name: 'demo-studio',
    description: 'Record and replay web app & extension demos from declarative DSL scenarios',
    version: '0.0.0',
  },
  subCommands: {
    run: runCommand,
  },
})

runMain(main)
