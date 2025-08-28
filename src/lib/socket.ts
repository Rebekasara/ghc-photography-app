import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'

export function initializeSocket(server: HTTPServer) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.NEXT_PUBLIC_BASE_URL 
        : 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  })

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    socket.on('message', (data) => {
      console.log('Received message:', data)
      socket.emit('message', { echo: data })
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
    })
  })

  return io
}
