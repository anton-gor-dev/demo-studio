export type ContextType = 'page' | 'popup' | 'background'

export interface GotoOptions {
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle'
  timeout?: number
}

export interface ClickOptions {
  button?: 'left' | 'right' | 'middle'
  modifiers?: Array<'Alt' | 'Control' | 'Meta' | 'Shift'>
  timeout?: number
}

export interface TypeOptions {
  delay?: number
  clear?: boolean
  timeout?: number
}

export interface WaitForOptions {
  state?: 'visible' | 'hidden' | 'attached' | 'detached'
  timeout?: number
}

export interface HoverOptions {
  timeout?: number
}

export interface ScrollOptions {
  direction?: 'up' | 'down' | 'left' | 'right'
  amount?: number
}

export interface Driver {
  goto(url: string, options?: GotoOptions): Promise<void>
  click(selector: string, options?: ClickOptions): Promise<void>
  type(selector: string, value: string, options?: TypeOptions): Promise<void>
  waitFor(selector: string, options?: WaitForOptions): Promise<void>
  hover(selector: string, options?: HoverOptions): Promise<void>
  scroll(selector: string, options?: ScrollOptions): Promise<void>
  screenshot(): Promise<Buffer>
  switchContext?(to: ContextType): Promise<void>
  close(): Promise<void>
}
