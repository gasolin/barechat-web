import ws from 'bare-ws'
import process from 'bare-process'

import { getBackend } from 'barechat/lib/chat-core'

import { createChatServer } from './lib/server'
import { HTML } from './ui'

// Initialize backend functionality from chat-core
const {
  swarm,
  getMemberId,
  createRoom,
  joinRoom,
  sendMessage,
  version
} = getBackend()

// Stores active WebSocket connections
const activeConnections = new Set()

// Reference to the chat room topic
let currentRoomTopic = null

// Create HTTP server for serving the web interface
const server = createChatServer(HTML)

// When there's a new peer connection in the swarm, listen for new messages
swarm.on('connection', peer => {
  const memberId = getMemberId(peer)
  console.log(`[info] New peer ${memberId} joined`)
  
  peer.on('data', rawData => {
    try {
      const event = JSON.parse(rawData)
      // Broadcast the message to all WebSocket clients
      broadcastMessage({ type: 'message', sender: memberId, text: event.message })
    } catch (error) {
      console.error('Error processing peer data:', error)
    }
  })
  
  peer.on('error', e => console.log(`Connection error: ${e}`))
  
  // Notify WebSocket clients about new peer
  broadcastMessage({ type: 'system', text: `New peer ${memberId} joined` })
})

// When there's updates to the swarm, notify about peer count
swarm.on('update', () => {
  const peerCount = swarm.connections.size
  console.log(`[info] Number of connections is now ${peerCount}`)
  broadcastMessage({ type: 'system', text: `Connected peers: ${peerCount}` })
})

// Create WebSocket server that shares the HTTP server's port
const wsServer = new ws.Server({ server }, socket => {
  console.log('[WebSocket] New client connected')
  activeConnections.add(socket)
  
  // Send welcome message and room information
  if (currentRoomTopic) {
    socket.write(JSON.stringify({ 
      type: 'system', 
      text: `Welcome to BareChat! Current room: ${currentRoomTopic}` 
    }))
  } else {
    socket.write(JSON.stringify({ 
      type: 'system', 
      text: 'Welcome to BareChat! No room joined yet.' 
    }))
  }
  
  // Handle WebSocket messages from clients
  socket.on('data', data => {
    try {
      const message = JSON.parse(data.toString())
      
      if (message.type === 'command') {
        handleCommand(message.command, socket)
      } else if (message.type === 'chat') {
        // Handle chat message
        sendMessage(message.text)
        // Broadcast to all clients including sender (with "me" as sender)
        broadcastMessage({ type: 'message', sender: 'me', text: message.text })
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error)
    }
  })
  
  socket.on('close', () => {
    console.log('[WebSocket] Client disconnected')
    activeConnections.delete(socket)
  })
  
  socket.on('error', error => {
    console.error('[WebSocket] Error:', error)
    activeConnections.delete(socket)
  })
})

// Broadcast message to all connected WebSocket clients
function broadcastMessage(message) {
  const messageStr = JSON.stringify(message)
  for (const socket of activeConnections) {
    try {
      socket.write(messageStr)
    } catch (error) {
      console.error('Error sending to WebSocket client:', error)
    }
  }
}

// Handle commands from WebSocket clients
async function handleCommand(command, socket) {
  const parts = command.split(' ')
  const cmd = parts[0].toLowerCase()
  
  switch (cmd) {
    case 'create':
      const { done: createDone, topic } = await createRoom()
      if (createDone) {
        currentRoomTopic = topic
        const message = `Created and joined new chat room: ${topic}`
        console.log(`[info] ${message}`)
        socket.write(JSON.stringify({ type: 'system', text: message }))
        broadcastMessage({ type: 'system', text: message })
      } else {
        socket.write(JSON.stringify({ type: 'system', text: 'Failed to create chat room' }))
      }
      break;
      
    case 'join':
      if (parts.length < 2) {
        socket.write(JSON.stringify({ type: 'system', text: 'Please provide a room topic to join' }))
        return
      }
      
      const roomKey = parts[1]
      const { done: joinDone, topic: joinedTopic } = await joinRoom(roomKey)
      
      if (joinDone) {
        currentRoomTopic = joinedTopic
        const message = `Joined chat room: ${joinedTopic}`
        console.log(`[info] ${message}`)
        socket.write(JSON.stringify({ type: 'system', text: message }))
        broadcastMessage({ type: 'system', text: message })
      } else {
        socket.write(JSON.stringify({ type: 'system', text: 'Failed to join chat room' }))
      }
      break;
      
    case 'info':
      socket.write(JSON.stringify({ 
        type: 'system', 
        text: `BareChat v.${version}\nCurrent room: ${currentRoomTopic || 'None'}\nConnected peers: ${swarm.connections.size}`
      }))
      break;
      
    default:
      socket.write(JSON.stringify({ type: 'system', text: `Unknown command: ${cmd}` }))
  }
}

// Start server on a random available port
server.listen(0, () => {
  const { port } = server.address()
  console.log(`BareChat Web server started on port ${port}`)
  console.log(`Open your browser and navigate to http://localhost:${port}`)
})

// Clean up on process exit
process.on('SIGINT', () => {
  console.log('\nShutting down BareChat Web...')
  broadcastMessage({ type: 'system', text: 'Server shutting down' })
  swarm.destroy()
  wsServer.close()
  server.close()
  process.exit(0)
})
