import userModel from '../models/user.model.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import env from '../config/env.js'
import tokenBlackListModel from '../models/blacklist.model.js'

export const register = async(req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if user already exists
        const user = await userModel.findOne({ email });

        if(user) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            })
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        // Create user
        const newUser = await userModel.create({
            name,
            email,
            password: hashPassword
        })

        return res.status(201).json({
            success: true,
            message: 'User created',
            user: { _id: newUser._id, name, email }
        })

    } catch(err) {
        console.error("Register error:", err.message)
        return res.status(500).json({
            success: false,
            message: 'Server error'
        })
    }
}
export const login = async(req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const user = await userModel.findOne({ email });

        if(!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            })
        }

        // Check password
        const isMatchPassword = await bcrypt.compare(password, user.password);

        if(!isMatchPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            })
        }

        // Create access token
        const accessToken = jwt.sign(
            { id: user._id },
            env.ACCESS_TOKEN_SECRET,
            { expiresIn: env.ACCESS_TOKEN_EXPIRE }
        )

        // Create refresh token
        const refreshToken = jwt.sign(
            { id: user._id },
            env.REFRESH_TOKEN_SECRET,
            { expiresIn: env.REFRESH_TOKEN_EXPIRE }
        )

        // Save refresh token in DB
        user.refreshToken = refreshToken
        await user.save()

        // Send refresh token in cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            accessToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        })

    } catch(err) {
        console.error("Login error:", err.message)
        return res.status(500).json({
            success: false,
            message: 'Server error'
        })
    }
}

export const logout = async(req, res) => {
    // Get refresh token from cookie
    const refreshToken = req.cookies.refreshToken;

    try {
        // Check if refresh token exists
        if(!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token not found'
            })
        }

        // Add refresh token to blacklist
        await tokenBlackListModel.create({ token: refreshToken });

        // Delete refresh token from user document
        const user = await userModel.findOne({ refreshToken });

        // If user exists, remove refresh token
        if(user) {
            user.refreshToken = null;
            await user.save();
        }

        // Clear refresh token from cookie
        res.clearCookie('refreshToken')

        return res.status(200).json({
            success: true,
            message: 'Logout successful'
        })

    } catch(err) {
        console.error("Logout error:", err.message)
        return res.status(500).json({
            success: false,
            message: 'Server error'
        })
    }
}

export const refresh = async(req, res) => {
    // Get refresh token from cookie
    const refreshToken = req.cookies.refreshToken;

    try {
        // Check if refresh token exists
        if(!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token not found'
            })
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET)

        // Find user in DB
        const user = await userModel.findById(decoded.id)

        if(!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            })
        }

        // Create new access token
        const accessToken = jwt.sign(
            { id: user._id },
            env.ACCESS_TOKEN_SECRET,
            { expiresIn: env.ACCESS_TOKEN_EXPIRE }
        )

        return res.status(200).json({
            success: true,
            accessToken
        })

    } catch(err) {
        console.error("Refresh error:", err.message)
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired refresh token'
        })
    }
}

export const getMe = async(req, res) => {
    try {
        // User will come from auth middleware
        const user = await userModel.findById(req.user.id).select('-password -refreshToken')

        if(!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }

        return res.status(200).json({
            success: true,
            user
        })

    } catch(err) {
        console.error("GetMe error:", err.message)
        return res.status(500).json({
            success: false,
            message: 'Server error'
        })
    }
}