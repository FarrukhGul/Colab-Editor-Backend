import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import env from './config/env.js';


import authRoutes from './routes/authRoutes.js';
import documentRoutes from './routes/documentRoutes.js';


const app = express();


// Middleware
app.use(helmet());
app.use(cors({
    origin: [
        'https://colab-editor-farrukh.vercel.app',
        'http://localhost:5173'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())
app.use(cookieParser())


app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes)


export default app;