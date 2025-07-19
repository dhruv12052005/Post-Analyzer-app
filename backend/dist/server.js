"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./utils/database");
const Post_1 = require("./models/Post");
const postController_1 = require("./controllers/postController");
const posts_1 = require("./routes/posts");
const axios_1 = __importDefault(require("axios")); // Added axios for health check
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
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
        const db = await (0, database_1.getDatabase)();
        const stmt = await db.prepare('SELECT 1');
        await stmt.get();
        healthCheck.services.database = 'ok';
    }
    catch (error) {
        healthCheck.services.database = 'error';
        console.error('Database health check failed:', error);
    }
    try {
        // Test ML service
        const mlResponse = await axios_1.default.get(`${healthCheck.environment.mlServiceUrl}/health`, {
            timeout: 5000
        });
        healthCheck.services.ml = mlResponse.status === 200 ? 'ok' : 'error';
    }
    catch (error) {
        healthCheck.services.ml = 'error';
        console.error('ML service health check failed:', error);
    }
    try {
        // Test C++ service
        const cppResponse = await axios_1.default.get(`${healthCheck.environment.cppServiceUrl}/health`, {
            timeout: 5000
        });
        healthCheck.services.cpp = cppResponse.status === 200 ? 'ok' : 'error';
    }
    catch (error) {
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
        await (0, database_1.initializeDatabase)();
        // Ensure production API key exists in database
        const database = await (0, database_1.getDatabase)();
        await database.exec(`
      INSERT OR IGNORE INTO api_keys (key_hash, description) VALUES 
      ('production-api-key-2e7cugpu3evggdd1r9alz', 'Production API key')
    `);
        const postModel = new Post_1.PostModel();
        const postController = new postController_1.PostController(postModel);
        // API routes
        app.use('/api/posts', (0, posts_1.createPostRoutes)(postController));
        // 404 handler
        app.use('*', (req, res) => {
            res.status(404).json({
                success: false,
                message: 'Route not found'
            });
        });
        // Error handler
        app.use((err, req, res, next) => {
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
    }
    catch (error) {
        console.error('Failed to initialize app:', error);
        process.exit(1);
    }
}
// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await (0, database_1.closeDatabase)();
    process.exit(0);
});
process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    await (0, database_1.closeDatabase)();
    process.exit(0);
});
// Start the application
initializeApp();
//# sourceMappingURL=server.js.map