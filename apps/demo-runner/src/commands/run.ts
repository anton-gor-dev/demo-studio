import { defineCommand } from 'citty'
import { createPlaywrightDriver } from '@demo-studio/driver-playwright'
import { run } from '@demo-studio/engine'
import type { StepResult } from '@demo-studio/shared'
import { fmt, formatDuration, padEnd, printErr, printLine } from '../utils/output.js'
import { readScenario } from '../utils/read-scenario.js'
import { stepLabel } from '../utils/step-label.js'

export const runCommand = defineCommand({
  meta: {
    name: 'run',
    description: 'Run a DSL scenario file',
  },
  args: {
    file: {
      type: 'positional',
      description: 'Path to scenario JSON file',
      required: true,
    },
    headless: {
      type: 'boolean',
      description: 'Run browser in headless mode',
      default: true,
    },
    browser: {
      type: 'string',
      description: 'Browser to use: chromium | firefox | webkit',
      default: 'chromium',
    },
    'slow-mo': {
      type: 'string',
      description: 'Slow down each action by N ms',
      default: '0',
    },
    'dry-run': {
      type: 'boolean',
      description: 'Validate scenario without launching a browser',
      default: false,
    },
    timeout: {
      type: 'string',
      description: 'Default step timeout in ms',
      default: '10000',
    },
  },

  async run({ args }) {
    const file = args.file as string
    const headless = args.headless as boolean
    const dryRun = args['dry-run'] as boolean
    const slowMo = parseInt(args['slow-mo'] as string, 10) || 0
    const defaultTimeout = parseInt(args.timeout as string, 10) || 10_000
    const browser = (args.browser as string | undefined) ?? 'chromium'

    if (!['chromium', 'firefox', 'webkit'].includes(browser)) {
      printErr(fmt.red(`✗ Unknown browser "${browser}". Use: chromium | firefox | webkit`))
      process.exit(1)
    }

    // --- Parse scenario ---
    let scenario
    try {
      scenario = await readScenario(file)
    }
    catch (err) {
      printErr(fmt.red(`✗ ${err instanceof Error ? err.message : String(err)}`))
      process.exit(1)
    }

    const total = scenario.steps.length
    printLine()
    printLine(
      `${fmt.bold('▶ Running:')} ${fmt.cyan(scenario.name)} `
      + fmt.gray(`(${total} step${total === 1 ? '' : 's'}${dryRun ? ', dry-run' : ''})`),
    )
    printLine()

    // --- Wire driver ---
    const driver = dryRun
      ? undefined
      : await createPlaywrightDriver({
          browser: browser as 'chromium' | 'firefox' | 'webkit',
          headless,
          slowMo,
        })

    const LABEL_WIDTH = 56

    const onStepDone = (result: StepResult) => {
      const step = scenario.steps[result.stepIndex]!
      const label = padEnd(`${result.stepIndex + 1}/${total}  ${stepLabel(step)}`, LABEL_WIDTH)
      printLine(
        `  ${fmt.green('✓')} ${fmt.dim(label)} ${fmt.gray(formatDuration(result.duration))}`,
      )
    }

    const onStepError = (result: StepResult) => {
      const step = scenario.steps[result.stepIndex]!
      const label = padEnd(`${result.stepIndex + 1}/${total}  ${stepLabel(step)}`, LABEL_WIDTH)
      printLine(`  ${fmt.red('✗')} ${fmt.dim(label)} ${fmt.red('FAILED')}`)
      if (result.error) {
        printLine(`    ${fmt.gray(result.error.message)}`)
      }
    }

    // --- Run ---
    const result = await run(driver ?? makeDryRunDriver(), scenario, {
      dryRun,
      defaultTimeout,
      onStepDone,
      onStepError,
    })

    await driver?.close()

    printLine()

    if (result.status === 'success') {
      printLine(
        `${fmt.green('✓')} ${fmt.bold('Run complete')}  `
        + fmt.gray(`${total}/${total} steps  ${formatDuration(result.duration)}`),
      )
      printLine()
      process.exit(0)
    }
    else {
      const failed = result.steps.find(s => s.status === 'failed')
      const stepNum = failed ? failed.stepIndex + 1 : '?'
      printLine(
        `${fmt.red('✗')} ${fmt.bold('Run failed')} `
        + fmt.gray(`(step ${stepNum})  ${formatDuration(result.duration)}`),
      )
      printLine()
      process.exit(1)
    }
  },
})

// Minimal no-op driver used in dry-run mode so the engine has something to call
function makeDryRunDriver() {
  const noop = async () => undefined
  return {
    goto: noop, click: noop, type: noop, waitFor: noop,
    hover: noop, scroll: noop, screenshot: async () => Buffer.alloc(0), close: noop,
  }
}
