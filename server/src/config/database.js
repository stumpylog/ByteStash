const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { up_v1_4_0 } = require('./migrations/20241111-migration');
const { up_v1_5_0 } = require('./migrations/20241117-migration');

let db = null;
let checkpointInterval = null;

function getDatabasePath() {
  if (process.env.NODE_ENV === 'production') {
    const userDataPath = './data/snippets';
    
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }
    
    return path.join(userDataPath, 'snippets.db');
  } else {
    const devPath = path.join(__dirname, '../../../data/snippets');
    if (!fs.existsSync(devPath)) {
      fs.mkdirSync(devPath, { recursive: true });
    }
    return path.join(devPath, 'snippets.db');
  }
}

function checkpointDatabase() {
  if (!db) return;
  
  try {
    console.log('Starting database checkpoint...');
    const start = Date.now();
    
    db.pragma('wal_checkpoint(PASSIVE)');
    
    const duration = Date.now() - start;
    console.log(`Database checkpoint completed in ${duration}ms`);
  } catch (error) {
    console.error('Error during database checkpoint:', error);
  }
}

function startCheckpointInterval() {
  const CHECKPOINT_INTERVAL = 5 * 60 * 1000;
  
  if (checkpointInterval) {
    clearInterval(checkpointInterval);
  }

  checkpointInterval = setInterval(checkpointDatabase, CHECKPOINT_INTERVAL);
}

function stopCheckpointInterval() {
  if (checkpointInterval) {
    clearInterval(checkpointInterval);
    checkpointInterval = null;
  }
}

function backupDatabase(dbPath) {
  const baseBackupPath = `${dbPath}.backup`;
  checkpointDatabase();

  try {
    if (fs.existsSync(dbPath)) {
      const dbBackupPath = `${baseBackupPath}.db`;
      fs.copyFileSync(dbPath, dbBackupPath);
      console.log(`Database backed up to: ${dbBackupPath}`);
    } else {
      console.error(`Database file not found: ${dbPath}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Failed to create database backup:', error);
    throw error;
  }
}

function createInitialSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS snippets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      user_id INTEGER REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      snippet_id INTEGER,
      name TEXT NOT NULL,
      FOREIGN KEY (snippet_id) REFERENCES snippets(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS fragments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      snippet_id INTEGER NOT NULL,
      file_name TEXT NOT NULL,
      code TEXT NOT NULL,
      language TEXT NOT NULL,
      position INTEGER NOT NULL,
      FOREIGN KEY (snippet_id) REFERENCES snippets(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS shared_snippets (
      id TEXT PRIMARY KEY,
      snippet_id INTEGER NOT NULL,
      requires_auth BOOLEAN NOT NULL DEFAULT false,
      expires_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (snippet_id) REFERENCES snippets(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_snippets_user_id ON snippets(user_id);
    CREATE INDEX IF NOT EXISTS idx_categories_snippet_id ON categories(snippet_id);
    CREATE INDEX IF NOT EXISTS idx_fragments_snippet_id ON fragments(snippet_id);
    CREATE INDEX IF NOT EXISTS idx_shared_snippets_snippet_id ON shared_snippets(snippet_id);
  `);
}

function initializeDatabase() {
  try {
    const dbPath = getDatabasePath();
    console.log(`Initializing SQLite database at: ${dbPath}`);

    const dbExists = fs.existsSync(dbPath);

    db = new Database(dbPath, { 
      verbose: console.log,
      fileMustExist: false
    });

    db.pragma('foreign_keys = ON');
    db.pragma('journal_mode = WAL');

    backupDatabase(dbPath);

    if (!dbExists) {
      console.log('Creating new database with initial schema...');
      createInitialSchema(db);
    } else {
      console.log('Database file exists, checking for needed migrations...');
      
      up_v1_4_0(db);
      up_v1_5_0(db);
    }

    startCheckpointInterval();

    console.log('Database initialization completed successfully');
    return db;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

function shutdownDatabase() {
  if (db) {
    try {
      console.log('Performing final database checkpoint...');
      db.pragma('wal_checkpoint(TRUNCATE)');
      
      stopCheckpointInterval();
      db.close();
      db = null;
      
      console.log('Database shutdown completed successfully');
    } catch (error) {
      console.error('Error during database shutdown:', error);
      throw error;
    }
  }
}

module.exports = {
  initializeDatabase,
  getDb,
  shutdownDatabase,
  checkpointDatabase
};