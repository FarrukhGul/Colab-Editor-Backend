import mongoose from 'mongoose'

const blacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    }
}, { timestamps: true })

const blacklistModel = mongoose.model('Blacklist', blacklistSchema)

export default blacklistModel