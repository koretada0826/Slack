import { createServer } from 'http'
import { readFileSync, existsSync, statSync } from 'fs'
import { join, extname } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const DIST = join(__dirname, 'dist')
const PORT = parseInt(process.env.PORT || '10000', 10)
const SELF_URL = process.env.RENDER_EXTERNAL_URL

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
}

const indexHtml = readFileSync(join(DIST, 'index.html'))

const server = createServer((req, res) => {
  const url = req.url.split('?')[0]

  // Health check
  if (url === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end('ok')
    return
  }

  // Try to serve static file from dist
  const filePath = join(DIST, url)
  if (url !== '/' && existsSync(filePath) && statSync(filePath).isFile()) {
    const ext = extname(filePath)
    const mime = MIME_TYPES[ext] || 'application/octet-stream'
    const content = readFileSync(filePath)
    res.writeHead(200, {
      'Content-Type': mime,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
    })
    res.end(content)
    return
  }

  // SPA fallback: serve index.html for all other routes
  res.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': 'no-cache' })
  res.end(indexHtml)
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`)

  // Self-ping every 14 minutes to prevent Render free tier sleep
  if (SELF_URL) {
    setInterval(() => {
      fetch(`${SELF_URL}/healthz`).catch(() => {})
    }, 14 * 60 * 1000)
    console.log(`Self-ping enabled: ${SELF_URL}/healthz every 14min`)
  }
})
