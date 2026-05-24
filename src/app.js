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
    origin: env.FRONTEND_URL || 'https://colab-editor-farrukh.vercel.app',
    credentials: true,
}));
app.use(express.json())
app.use(cookieParser())


app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes)


export default app;