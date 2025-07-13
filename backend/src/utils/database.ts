import Database from 'better-sqlite3';
import dotenv from 'dotenv';

dotenv.config();

let db: Database | null = null;

export function getDatabase(): Database {
  if (!db) {
    db = new Database('./post_analyzer.db');
  }
  return db;
}

export function initializeDatabase() {
  const database = getDatabase();
  
  // Create posts table
  database.exec(`
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
  database.exec(`
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
  database.exec(`
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
  database.exec(`
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
  database.exec(`
    INSERT OR IGNORE INTO api_keys (key_hash, description) VALUES 
    ('your-secret-api-key-here', 'Default development API key')
  `);

  console.log('SQLite database initialized successfully');
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

// Export a simple query function for compatibility
export function query(sql: string, params: any[] = []): any[] {
  const database = getDatabase();
  return database.prepare(sql).all(params);
} 