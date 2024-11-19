const { getDb } = require('../config/database');
const bcrypt = require('bcrypt');

class UserRepository {
  constructor() {
    this.createUserStmt = null;
    this.findByUsernameStmt = null;
    this.findByIdStmt = null;
  }

  #initializeStatements() {
    if (!this.createUserStmt) {
      const db = getDb();

      this.createUserStmt = db.prepare(`
        INSERT INTO users (username, password_hash)
        VALUES (?, ?)
      `);

      this.findByUsernameStmt = db.prepare(`
        SELECT id, username, password_hash, created_at
        FROM users
        WHERE username = ?
      `);

      this.findByIdStmt = db.prepare(`
        SELECT id, username, created_at
        FROM users
        WHERE id = ?
      `);
    }
  }

  async create(username, password) {
    this.#initializeStatements();
    
    try {
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      const result = this.createUserStmt.run(username, passwordHash);
      
      return this.findById(result.lastInsertRowid);
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT') {
        throw new Error('Username already exists');
      }
      throw error;
    }
  }

  async findByUsername(username) {
    this.#initializeStatements();
    return this.findByUsernameStmt.get(username);
  }

  async findById(id) {
    this.#initializeStatements();
    return this.findByIdStmt.get(id);
  }

  async verifyPassword(user, password) {
    if (!user?.password_hash) {
      return false;
    }
    return bcrypt.compare(password, user.password_hash);
  }
}

module.exports = new UserRepository();