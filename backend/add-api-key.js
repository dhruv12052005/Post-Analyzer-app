const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'post_analyzer.db');
const db = new sqlite3.Database(dbPath);

const apiKey = 'production-api-key-2e7cugpu3evggdd1r9alz';

db.serialize(() => {
  // Create api_keys table if it doesn't exist
  db.run(`
    CREATE TABLE IF NOT EXISTS api_keys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key_hash TEXT NOT NULL,
      description TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_used_at DATETIME
    )
  `);

  // Insert the production API key
  db.run(
    'INSERT OR REPLACE INTO api_keys (key_hash, description) VALUES (?, ?)',
    [apiKey, 'Production API key'],
    function(err) {
      if (err) {
        console.error('Error adding API key:', err);
      } else {
        console.log('✅ Production API key added successfully!');
        console.log('API Key:', apiKey);
      }
      db.close();
    }
  );
}); 