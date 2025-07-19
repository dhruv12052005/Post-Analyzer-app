import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { initializeDatabase, closeDatabase, getDatabase } from './utils/database';
import { PostModel } from './models/Post';
import { PostController } from './controllers/postController';
import { createPostRoutes } from './routes/posts';
import axios from 'axios'; // Added axios for health check

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
app.get('/health', async (req, res) => {
  const healthCheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      backend: 'ok',
      database: 'unknown',
      ml: 'unknown',
      cpp: 'unknown'
    },
    environment: {
      nodeEnv: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 3001,
      mlServiceUrl: process.env.ML_SERVICE_URL || 'http://localhost:8001',
      cppServiceUrl: process.env.CPP_SERVICE_URL || 'http://localhost:8000'
    }
  };

  try {
    // Test database connection
    const db = await getDatabase();
    const stmt = await db.prepare('SELECT 1');
    await stmt.get();
    healthCheck.services.database = 'ok';
  } catch (error) {
    healthCheck.services.database = 'error';
    console.error('Database health check failed:', error);
  }

  try {
    // Test ML service
    const mlResponse = await axios.get(`${healthCheck.environment.mlServiceUrl}/health`, {
      timeout: 5000
    });
    healthCheck.services.ml = mlResponse.status === 200 ? 'ok' : 'error';
  } catch (error) {
    healthCheck.services.ml = 'error';
    console.error('ML service health check failed:', error);
  }

  try {
    // Test C++ service
    const cppResponse = await axios.get(`${healthCheck.environment.cppServiceUrl}/health`, {
      timeout: 5000
    });
    healthCheck.services.cpp = cppResponse.status === 200 ? 'ok' : 'error';
  } catch (error) {
    healthCheck.services.cpp = 'error';
    console.error('C++ service health check failed:', error);
  }

  // Overall status
  const allServicesOk = Object.values(healthCheck.services).every(status => status === 'ok');
  healthCheck.status = allServicesOk ? 'ok' : 'degraded';

  res.json(healthCheck);
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