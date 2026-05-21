import 'dotenv/config'

const env = {
    PORT: process.env.PORT || 3000,
    MONGO_URI: process.env.MONGO_URI,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRE: process.env.ACCESS_TOKEN_EXPIRE || '15m',
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    REFRESH_TOKEN_EXPIRE: process.env.REFRESH_TOKEN_EXPIRE || '7d',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173'
}

// Validation
if(!env.MONGO_URI) throw new Error("MONGO_URI is missing in .env")
if(!env.ACCESS_TOKEN_SECRET) throw new Error("ACCESS_TOKEN_SECRET is missing in .env")
if(!env.REFRESH_TOKEN_SECRET) throw new Error("REFRESH_TOKEN_SECRET is missing in .env")
if(!env.FRONTEND_URL) throw new Error("FRONTEND_URL is missing in .env")
if(!env.PORT) throw new Error("PORT is missing in .env")
if(!env.ACCESS_TOKEN_EXPIRE) throw new Error("ACCESS_TOKEN_EXPIRE is missing in .env")
if(!env.REFRESH_TOKEN_EXPIRE) throw new Error("REFRESH_TOKEN_EXPIRE is missing in .env")

export default env