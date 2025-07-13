"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostModel = void 0;
const database_1 = require("../utils/database");
class PostModel {
    findAll(page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        // Get total count
        const countResult = (0, database_1.query)('SELECT COUNT(*) as count FROM posts');
        const total = countResult[0]?.count || 0;
        // Get posts with pagination
        const posts = (0, database_1.query)(`
      SELECT id, title, body, user_id as userId, created_at as createdAt, updated_at as updatedAt
      FROM posts
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);
        return {
            posts: posts,
            total,
        };
    }
    findById(id) {
        const posts = (0, database_1.query)(`
      SELECT id, title, body, user_id as userId, created_at as createdAt, updated_at as updatedAt
      FROM posts
      WHERE id = ?
    `, [id]);
        return posts[0] || null;
    }
    create(post) {
        const database = (0, database_1.getDatabase)();
        const result = database.prepare(`
      INSERT INTO posts (title, body, user_id, created_at, updated_at)
      VALUES (?, ?, ?, datetime('now'), datetime('now'))
    `).run(post.title, post.body, post.userId);
        const newId = result.lastInsertRowid;
        return this.findById(newId);
    }
    update(id, updates) {
        const fields = [];
        const values = [];
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
        const database = (0, database_1.getDatabase)();
        database.prepare(`
      UPDATE posts
      SET ${fields.join(', ')}
      WHERE id = ?
    `).run(...values);
        return this.findById(id);
    }
    delete(id) {
        const database = (0, database_1.getDatabase)();
        const result = database.prepare('DELETE FROM posts WHERE id = ?').run(id);
        return result.changes > 0;
    }
    async syncFromMockApi() {
        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/posts');
            const mockPosts = await response.json();
            for (const mockPost of mockPosts) {
                const existingPost = this.findById(mockPost.id);
                if (!existingPost) {
                    this.create({
                        title: mockPost.title,
                        body: mockPost.body,
                        userId: mockPost.userId
                    });
                }
            }
        }
        catch (error) {
            console.error('Error syncing from mock API:', error);
            throw error;
        }
    }
}
exports.PostModel = PostModel;
//# sourceMappingURL=Post.js.map