import type { Step } from '@demo-studio/core-dsl'
import type { Driver } from '@demo-studio/shared'
import { clickHandler } from './actions/click.js'
import { gotoHandler } from './actions/goto.js'
import { hoverHandler } from './actions/hover.js'
import { scrollHandler } from './actions/scroll.js'
import { switchContextHandler } from './actions/switchContext.js'
import { typeHandler } from './actions/type.js'
import { waitForHandler } from './actions/waitFor.js'

type ActionHandler<T extends Step> = (
  driver: Driver,
  step: T,
  defaultTimeout: number,
) => Promise<void>

type ActionHandlerMap = {
  [K in Step['action']]: ActionHandler<Extract<Step, { action: K }>>
}

const handlers: ActionHandlerMap = {
  goto: gotoHandler,
  click: clickHandler,
  type: typeHandler,
  waitFor: waitForHandler,
  hover: hoverHandler,
  scroll: scrollHandler,
  switchContext: switchContextHandler,
}

export function dispatch(driver: Driver, step: Step, defaultTimeout: number): Promise<void> {
  const handler = handlers[step.action] as ActionHandler<Step>
  return handler(driver, step, defaultTimeout)
}
