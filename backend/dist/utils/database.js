"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabase = getDatabase;
exports.initializeDatabase = initializeDatabase;
exports.closeDatabase = closeDatabase;
exports.query = query;
const sqlite3_1 = __importDefault(require("sqlite3"));
const sqlite_1 = require("sqlite");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let db = null;
async function getDatabase() {
    if (!db) {
        db = await (0, sqlite_1.open)({
            filename: './post_analyzer.db',
            driver: sqlite3_1.default.Database
        });
    }
    return db;
}
async function initializeDatabase() {
    const database = await getDatabase();
    // Create posts table
    await database.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    // Create analysis_logs table
    await database.exec(`
    CREATE TABLE IF NOT EXISTS analysis_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER,
      analysis_type TEXT NOT NULL,
      result TEXT,
      processing_time_ms INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    )
  `);
    // Create users table (for future authentication)
    await database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    // Create api_keys table for API authentication
    await database.exec(`
    CREATE TABLE IF NOT EXISTS api_keys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key_hash TEXT NOT NULL,
      description TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_used_at DATETIME
    )
  `);
    // Insert default API key (for development)
    await database.exec(`
    INSERT OR IGNORE INTO api_keys (key_hash, description) VALUES 
    ('your-secret-api-key-here', 'Default development API key')
  `);
    console.log('SQLite database initialized successfully');
}
async function closeDatabase() {
    if (db) {
        await db.close();
        db = null;
    }
}
// Export a simple query function for compatibility
async function query(sql, params = []) {
    const database = await getDatabase();
    return await database.all(sql, params);
}
//# sourceMappingURL=database.js.map