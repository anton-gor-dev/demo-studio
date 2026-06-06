export class DemoStudioError extends Error {
  readonly code: string

  constructor(message: string, code: string, options?: ErrorOptions) {
    super(message, options)
    this.name = this.constructor.name
    this.code = code

    // Maintain correct prototype chain when transpiled to ES5
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class ParseError extends DemoStudioError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, 'PARSE_ERROR', options)
  }
}

export class ValidationError extends DemoStudioError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, 'VALIDATION_ERROR', options)
  }
}

export class StepError extends DemoStudioError {
  readonly stepIndex: number

  constructor(message: string, code: string, stepIndex: number, options?: ErrorOptions) {
    super(message, code, options)
    this.stepIndex = stepIndex
  }
}

export class TimeoutError extends StepError {
  readonly timeout: number

  constructor(message: string, stepIndex: number, timeout: number, options?: ErrorOptions) {
    super(message, 'TIMEOUT', stepIndex, options)
    this.timeout = timeout
  }
}

export class SelectorNotFoundError extends StepError {
  readonly selector: string

  constructor(message: string, stepIndex: number, selector: string, options?: ErrorOptions) {
    super(message, 'SELECTOR_NOT_FOUND', stepIndex, options)
    this.selector = selector
  }
}

export class ActionError extends StepError {
  constructor(message: string, stepIndex: number, options?: ErrorOptions) {
    super(message, 'ACTION_ERROR', stepIndex, options)
  }
}

export class DriverError extends DemoStudioError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, 'DRIVER_ERROR', options)
  }
}

export class ContextSwitchError extends DemoStudioError {
  readonly requestedContext: string

  constructor(requestedContext: string, options?: ErrorOptions) {
    super(`Context "${requestedContext}" is not available`, 'CONTEXT_SWITCH_ERROR', options)
    this.requestedContext = requestedContext
  }
}

export class FfmpegNotFoundError extends DemoStudioError {
  constructor(options?: ErrorOptions) {
    super(
      'ffmpeg not found in PATH. Install it from https://ffmpeg.org/download.html',
      'FFMPEG_NOT_FOUND',
      options,
    )
  }
}
