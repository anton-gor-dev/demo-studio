import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import type { Server } from 'node:http'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export interface FixtureServer {
  url: string
  close(): Promise<void>
}

export async function startFixtureServer(): Promise<FixtureServer> {
  const html = await readFile(join(__dirname, 'fixture.html'), 'utf-8')

  const server: Server = createServer((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end(html)
  })

  return new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address()
      if (!addr || typeof addr === 'string') {
        reject(new Error('Unexpected server address'))
        return
      }
      resolve({
        url: `http://127.0.0.1:${addr.port}`,
        close: () => new Promise((res, rej) => server.close(err => (err ? rej(err) : res()))),
      })
    })
  })
}
