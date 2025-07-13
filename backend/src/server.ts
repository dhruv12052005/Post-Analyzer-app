import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { initializeDatabase, closeDatabase, getDatabase } from './utils/database';
import { PostModel } from './models/Post';
import { PostController } from './controllers/postController';
import { createPostRoutes } from './routes/posts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Initialize database and create models/controllers
async function initializeApp() {
  try {
    await initializeDatabase();
    
    // Ensure production API key exists in database
    const database = await getDatabase();
    await database.exec(`
      INSERT OR IGNORE INTO api_keys (key_hash, description) VALUES 
      ('production-api-key-2e7cugpu3evggdd1r9alz', 'Production API key')
    `);
    
    const postModel = new PostModel();
    const postController = new PostController(postModel);
    
    // API routes
    app.use('/api/posts', createPostRoutes(postController));
    
    // 404 handler
    app.use('*', (req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    });
    
    // Error handler
    app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      console.error('Error:', err);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    });
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`API base: http://localhost:${PORT}/api`);
    });
    
  } catch (error) {
    console.error('Failed to initialize app:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await closeDatabase();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await closeDatabase();
  process.exit(0);
});

// Start the application
initializeApp(); 