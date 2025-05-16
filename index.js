import { createChatServer } from './lib/server'
import { HTML } from './ui'

const server = createChatServer(HTML)

// Start server on a random available port
server.listen(0, () => {
  const { port } = server.address()
  console.log(`BareChat Web server started on port ${port}`)
  console.log(`Open your browser and navigate to http://localhost:${port}`)
})
