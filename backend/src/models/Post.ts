import { getDatabase, query } from '../utils/database';

export interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreatePostRequest {
  title: string;
  body: string;
  userId: number;
}

export interface UpdatePostRequest {
  title?: string;
  body?: string;
}

export class PostModel {
  async findAll(page: number = 1, limit: number = 10): Promise<{ posts: Post[]; total: number }> {
    const offset = (page - 1) * limit;
    
    // Get total count
    const countResult = await query('SELECT COUNT(*) as count FROM posts');
    const total = countResult[0]?.count || 0;
    
    // Get posts with pagination
    const posts = await query(`
      SELECT id, title, body, user_id as userId, created_at as createdAt, updated_at as updatedAt
      FROM posts
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);
    
    return {
      posts: posts as Post[],
      total,
    };
  }

  async findById(id: number): Promise<Post | null> {
    const posts = await query(`
      SELECT id, title, body, user_id as userId, created_at as createdAt, updated_at as updatedAt
      FROM posts
      WHERE id = ?
    `, [id]);
    
    return posts[0] || null;
  }

  async create(post: CreatePostRequest): Promise<Post> {
    const database = await getDatabase();
    const result = await database.run(`
      INSERT INTO posts (title, body, user_id, created_at, updated_at)
      VALUES (?, ?, ?, datetime('now'), datetime('now'))
    `, [post.title, post.body, post.userId]);
    
    const newId = result.lastID!;
    return (await this.findById(newId))!;
  }

  async update(id: number, updates: UpdatePostRequest): Promise<Post | null> {
    const fields: string[] = [];
    const values: any[] = [];
    
    if (updates.title !== undefined) {
      fields.push('title = ?');
      values.push(updates.title);
    }
    if (updates.body !== undefined) {
      fields.push('body = ?');
      values.push(updates.body);
    }
    
    if (fields.length === 0) {
      return this.findById(id);
    }
    
    fields.push('updated_at = datetime(\'now\')');
    values.push(id);
    
    const database = await getDatabase();
    await database.run(`
      UPDATE posts
      SET ${fields.join(', ')}
      WHERE id = ?
    `, values);
    
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const database = await getDatabase();
    const result = await database.run('DELETE FROM posts WHERE id = ?', [id]);
    return (result.changes || 0) > 0;
  }

  async syncFromMockApi(): Promise<void> {
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts');
      const mockPosts = await response.json() as Array<{
        id: number;
        title: string;
        body: string;
        userId: number;
      }>;
      
      for (const mockPost of mockPosts) {
        const existingPost = await this.findById(mockPost.id);
        if (!existingPost) {
          await this.create({
            title: mockPost.title,
            body: mockPost.body,
            userId: mockPost.userId
          });
        }
      }
    } catch (error) {
      console.error('Error syncing from mock API:', error);
      throw error;
    }
  }
} 