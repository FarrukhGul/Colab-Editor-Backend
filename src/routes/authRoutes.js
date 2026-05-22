import express from 'express'
import { register, login, logout, refresh, getMe } from '../controllers/authController.js'
import authMiddleware from '../middleware/authMiddleware.js'
import validate from '../middleware/validateMiddleware.js'
import { registerValidator, loginValidator } from '../validators/authValidator.js'

const authRouter = express.Router()

// Public routes
authRouter.post('/register', validate(registerValidator), register)
authRouter.post('/login', validate(loginValidator), login)
authRouter.post('/refresh', refresh)

// Protected routes
authRouter.post('/logout', authMiddleware, logout)
authRouter.get('/me', authMiddleware, getMe)

export default authRouter