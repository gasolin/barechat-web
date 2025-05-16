import http from 'bare-http1'

/**
 * Creates a chat server using bare-http1
 * @returns {http.Server} The HTTP server instance
 */
export function createChatServer(staticContent) {
  // Create server
  const server = http.createServer((req, res) => {
    if (req.url === '/') {
      res.statusCode = 200
      res.setHeader('Content-Type', 'text/html')
      res.setHeader('Content-Length', Buffer.byteLength(staticContent))
      res.write(staticContent)
      res.end()
    } else {
      res.statusCode = 404
      res.end('Not found')
    }
  })

  return server;
}
