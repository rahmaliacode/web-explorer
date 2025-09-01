import mysql from 'mysql2/promise';

export interface Folder {
  id: number;
  name: string;
  parent_id: number | null;
  path: string;
  created_at: string;
}

export interface CreateFolderData {
  name: string;
  parent_id?: number | null;
}

export class FolderRepository {
  private pool: mysql.Pool | null = null;

  async initialize(): Promise<void> {
    // Database configuration
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '', 
      port: parseInt(process.env.DB_PORT || '3306'),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    };

    this.pool = mysql.createPool(dbConfig);

    // Create tables and insert sample data
    const connection = await this.pool.getConnection();
    
    try {
      // Create database if it doesn't exist
      await connection.execute('CREATE DATABASE IF NOT EXISTS folder_explorer');
    } finally {
      connection.release();
    }
    
    // Create a new pool with the database selected
    const dbPool = mysql.createPool({
      ...dbConfig,
      database: 'folder_explorer'
    });
    
    this.pool = dbPool;
    
    // Create table and insert sample data
    const dbConnection = await this.pool.getConnection();
    
    try {
      // Create table
      await dbConnection.execute(`
        CREATE TABLE IF NOT EXISTS folders (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          parent_id INT NULL,
          path VARCHAR(1000) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (parent_id) REFERENCES folders(id) ON DELETE CASCADE
        )
      `);
      
      // Check if table is empty and insert sample data
      const [countResult] = await dbConnection.execute('SELECT COUNT(*) as count FROM folders');
      const count = countResult as any;
      
      if (count[0].count === 0) {
        const sampleData = await Bun.file('./db/sample-data.sql').text();
        const sampleStatements = sampleData.split(';').filter(stmt => stmt.trim().length > 0);
        
        for (const statement of sampleStatements) {
          if (statement.trim()) {
            await dbConnection.execute(statement);
          }
        }
      }
    } finally {
      dbConnection.release();
    }
  }

  async getAllFolders(): Promise<Folder[]> {
    if (!this.pool) throw new Error('Database not initialized');
    
    const [rows] = await this.pool.execute('SELECT * FROM folders ORDER BY name');
    return rows as Folder[];
  }

  async getFolderById(id: number): Promise<Folder | null> {
    if (!this.pool) throw new Error('Database not initialized');
    
    const [rows] = await this.pool.execute('SELECT * FROM folders WHERE id = ?', [id]);
    const results = rows as Folder[];
    return results.length > 0 ? results[0] : null;
  }

  async getSubfolders(parentId: number): Promise<Folder[]> {
    if (!this.pool) throw new Error('Database not initialized');
    
    const [rows] = await this.pool.execute('SELECT * FROM folders WHERE parent_id = ? ORDER BY name', [parentId]);
    return rows as Folder[];
  }

  async createFolder(data: CreateFolderData): Promise<Folder> {
    if (!this.pool) throw new Error('Database not initialized');
    
    let path = `/${data.name}`;
    
    if (data.parent_id) {
      const parent = await this.getFolderById(data.parent_id);
      if (!parent) throw new Error('Parent folder not found');
      path = `${parent.path}/${data.name}`;
    }

    const [result] = await this.pool.execute(
      'INSERT INTO folders (name, parent_id, path) VALUES (?, ?, ?)',
      [data.name, data.parent_id, path]
    ) as any;

    const newFolder = await this.getFolderById(result.insertId);
    if (!newFolder) throw new Error('Failed to create folder');
    
    return newFolder;
  }

  async deleteFolder(id: number): Promise<boolean> {
    if (!this.pool) throw new Error('Database not initialized');
    
    const [result] = await this.pool.execute('DELETE FROM folders WHERE id = ?', [id]) as any;
    return result.affectedRows > 0;
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
    }
  }
}
