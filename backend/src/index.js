import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { generalLimiter, chatLimiter, dosageLimiter, transcriptionLimiter } from './middleware/rateLimiter.js';
import databaseRoutes from './routes/databaseRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import dosageRoutes from './routes/dosageRoutes.js';
import drugRoutes from './routes/drugRoutes.js';
import setupVoiceSocket from './sockets/voiceSocket.js';

// Load environment variables
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Log the API key to verify it's loaded
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Loaded' : 'Not Loaded');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: true, // Allow all origins for development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  }
});

// Setup Voice Socket
setupVoiceSocket(io);

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rate limiting
app.use('/api', generalLimiter);

// API routes with specific rate limiting
app.use('/api/database', databaseRoutes);
app.use('/api/chat', chatLimiter, chatRoutes);
app.use('/api/dosage', dosageLimiter, dosageRoutes);
app.use('/api/drugs', drugRoutes);

// Transcribe endpoint at root level for compatibility
app.post('/api/transcribe', (req, res) => {
  res.json({
    status: 'success',
    data: {
      text: "This is a simulated transcription. In a real implementation, this would process actual voice input.",
      timestamp: new Date()
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
// @ts-ignore
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Handle file upload errors
  if (err.hasOwnProperty('storageErrors')) {
    return res.status(400).json({
      status: 'error',
      message: 'File upload failed',
      errors: err.storageErrors
    });
  }
  
  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: 'Validation error',
      errors: err.errors
    });
  }
  
  // Handle authentication errors
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      status: 'error',
      message: 'Unauthorized access'
    });
  }
  
  // Handle rate limit errors
  if (err.statusCode === 429) {
    return res.status(429).json({
      status: 'error',
      message: err.message || 'Rate limit exceeded'
    });
  }
  
  // Handle any other errors
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('Socket.io server initialized');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

export default app;