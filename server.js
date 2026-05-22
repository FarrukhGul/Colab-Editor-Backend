import { createServer } from 'http'
import { Server } from 'socket.io'
import app from './src/app.js'
import env from './src/config/env.js'
import connectDb from './src/config/db.js'
import socketHandler from './src/socket/socketHandler.js'

// create HTTP server from Express app 
const httpServer = createServer(app)

// create Socket.io server from HTTP server 
const io = new Server(httpServer, {
    cors: {
        origin: env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true
    }
})

// Socket handler initialize 
socketHandler(io)

// DB connect 
connectDb()

const PORT = env.PORT || 3000

httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})