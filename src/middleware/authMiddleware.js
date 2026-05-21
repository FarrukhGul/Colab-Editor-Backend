import jwt from 'jsonwebtoken'
import env from '../config/env.js'
import tokenBlackListModel from '../models/blacklist.model.js'
import userModel from '../models/user.model.js'

const authMiddleware = async(req, res, next) => {
    try {
        // step 1: Get token from header
        const authHeader = req.headers.authorization

        // step 2: Check if token exists
        if(!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access token not found'
            })
        }

        // step 3: Extract token
        const token = authHeader.split(' ')[1]

        // step 4: Check if token is blacklisted
        const isBlacklisted = await tokenBlackListModel.findOne({ token })
        if(isBlacklisted) {
            return res.status(401).json({
                success: false,
                message: 'Token is blacklisted. Please login again.'
            })
        }

        // step 5: Verify token
        const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET)

        // step 6: Find user in DB
        const user = await userModel.findById(decoded.id).select('-password -refreshToken')
        if(!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            })
        }

        // step 7: Attach user to request
        req.user = user

        next()

    } catch(err) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        })
    }
}

export default authMiddleware