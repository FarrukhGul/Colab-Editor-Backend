import jwt from 'jsonwebtoken'
import env from '../config/env.js'
import documentModel from '../models/document.model.js'
import versionModel from '../models/version.model.js'

// Store active users per document room
const activeUsers = {}

// Generate random color for each user cursor
const generateColor = () => {
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33F5', '#F5FF33', '#33FFF5']
    return colors[Math.floor(Math.random() * colors.length)]
}

const socketHandler = (io) => {

    // Auth middleware for socket
    // Every socket connection will verify JWT token
    io.use((socket, next) => {
        const token = socket.handshake.auth.token

        if(!token) {
            return next(new Error('Authentication error — token missing'))
        }

        try {
            const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET)
            socket.user = decoded  
            next()
        } catch(err) {
            return next(new Error('Authentication error — invalid token'))
        }
    })

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.user.id}`)

       
        // ***JOIN DOCUMENT ROOM***
    
        // User open the document then join the document room
        socket.on('join-document', async(documentId) => {
            try {
                // Document fetch from db
                const document = await documentModel.findById(documentId)
                if(!document) {
                    socket.emit('error', { message: 'Document not found' })
                    return
                }

                // Check if user has access
                const isOwner = document.owner.toString() === socket.user.id
                const isCollaborator = document.collaborators.some(
                    c => c.user.toString() === socket.user.id
                )

                if(!isOwner && !isCollaborator) {
                    socket.emit('error', { message: 'Access denied' })
                    return
                }

                // join Socket room
                // Room name = document id 
                socket.join(documentId)
                socket.currentDocument = documentId  // Current document track karo

                // Add into Active users
                if(!activeUsers[documentId]) {
                    activeUsers[documentId] = {}
                }

                activeUsers[documentId][socket.id] = {
                    userId: socket.user.id,
                    name: socket.user.name,
                    color: generateColor() 
                }

                // send Document content to joining user 
                socket.emit('document-loaded', {
                    document
                })

                // send a notification to every active users if new user joined
                io.to(documentId).emit('active-users', {
                    users: Object.values(activeUsers[documentId])
                })

                // tell the other users of Room that new user joined
                socket.to(documentId).emit('user-joined', {
                    userId: socket.user.id,
                    name: socket.user.name
                })

                console.log(`User ${socket.user.id} joined document ${documentId}`)

            } catch(err) {
                console.error('join-document error:', err.message)
                socket.emit('error', { message: 'Server error' })
            }
        })

       
        // ***DOCUMENT CHANGE***
  
        // if user type or make any change in document then update the content in db and send to other users of same room
        socket.on('document-change', async({ documentId, content }) => {
            try {
                // save the latest content in db
                await documentModel.findByIdAndUpdate(documentId, { content })

                // send the updated content to other users of same document room
               // socket.to() it excludes the  sender
                socket.to(documentId).emit('document-updated', { content })

            } catch(err) {
                console.error('document-change error:', err.message)
                socket.emit('error', { message: 'Server error' })
            }
        })

      
        // ***CURSOR MOVE***
     
        // if user moves cursor then tell the other users of same room
        socket.on('cursor-move', ({ documentId, position }) => {
            const user = activeUsers[documentId]?.[socket.id]

            // send other users of same room about the cursor position of user
            socket.to(documentId).emit('cursor-updated', {
                userId: socket.user.id,
                name: user?.name,
                color: user?.color,
                position
            })
        })

        // ***SAVE VERSION***
  
        // Manual version save
        socket.on('save-version', async({ documentId }) => {
            try {
                const document = await documentModel.findById(documentId)
                if(!document) return

                // take Latest version number 
                const latestVersion = await versionModel.findOne({ documentId })
                    .sort({ versionNumber: -1 })

                // make new  version 
                await versionModel.create({
                    documentId,
                    content: document.content,
                    savedBy: socket.user.id,
                    versionNumber: (latestVersion?.versionNumber || 0) + 1
                })

                // confirm to the user
                socket.emit('version-saved', {
                    message: 'Version saved successfully'
                })

            } catch(err) {
                console.error('save-version error:', err.message)
                socket.emit('error', { message: 'Server error' })
            }
        })

        // ***LEAVE DOCUMENT***

        socket.on('leave-document', (documentId) => {
            handleUserLeave(socket, io, documentId)
        })

     
        // ***DISCONNECT***
      
        // if broser closed or user disconnected then remove the user from active users and tell the other users of same room
        socket.on('disconnect', () => {
            if(socket.currentDocument) {
                handleUserLeave(socket, io, socket.currentDocument)
            }
            console.log(`User disconnected: ${socket.user?.id}`)
        })
    })
}


// ***HELPER — USER LEAVE***
const handleUserLeave = (socket, io, documentId) => {
    // remove from the Active users 
    if(activeUsers[documentId]) {
        delete activeUsers[documentId][socket.id]

        // if room is empty then delete the room from active users
        if(Object.keys(activeUsers[documentId]).length === 0) {
            delete activeUsers[documentId]
        }
    }

    // leave the Socket room
    socket.leave(documentId)

    // tell the other users of Room that user left
    socket.to(documentId).emit('user-left', {
        userId: socket.user?.id,
        name: socket.user?.name
    })

    // send Updated active users list 
    if(activeUsers[documentId]) {
        io.to(documentId).emit('active-users', {
            users: Object.values(activeUsers[documentId])
        })
    }
}

export default socketHandler