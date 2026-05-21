import express from 'express'
import { register, login, logout, refresh, getMe } from '../controllers/authController.js'

const authRouter = express.Router()


authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/logout', logout)
authRouter.get('/refresh', refresh)
authRouter.get('/me', getMe)

export default authRouter