import { ENV } from './config/env.js';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';

import authRoutes from './routes/auth.js';
import conversationRoutes from './routes/conversations.js';
import chatRoutes from './routes/chat.js';
import uploadRoutes from './routes/upload.js';
import imageRoutes from './routes/image.js';
import executeRoutes from './routes/execute.js';
import memoryRoutes from './routes/memory.js';

const app = express();
const PORT = ENV.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'https://novuai.vercel.app'],
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/image', imageRoutes);
app.use('/api/execute', executeRoutes);
app.use('/api/memory', memoryRoutes);

// Health check (for Uptime Robot)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Connect to MongoDB and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 NovuAI backend running on http://localhost:${PORT}`);
  });
});
