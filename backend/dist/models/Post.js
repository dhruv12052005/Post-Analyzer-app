"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostModel = void 0;
const database_1 = require("../utils/database");
class PostModel {
    async findAll(page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        // Get total count
        const countResult = await (0, database_1.query)('SELECT COUNT(*) as count FROM posts');
        const total = countResult[0]?.count || 0;
        // Get posts with pagination
        const posts = await (0, database_1.query)(`
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
    async findById(id) {
        const posts = await (0, database_1.query)(`
      SELECT id, title, body, user_id as userId, created_at as createdAt, updated_at as updatedAt
      FROM posts
      WHERE id = ?
    `, [id]);
        return posts[0] || null;
    }
    async create(post) {
        const database = await (0, database_1.getDatabase)();
        const result = await database.run(`
      INSERT INTO posts (title, body, user_id, created_at, updated_at)
      VALUES (?, ?, ?, datetime('now'), datetime('now'))
    `, [post.title, post.body, post.userId]);
        const newId = result.lastID;
        return (await this.findById(newId));
    }
    async update(id, updates) {
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
        const database = await (0, database_1.getDatabase)();
        await database.run(`
      UPDATE posts
      SET ${fields.join(', ')}
      WHERE id = ?
    `, values);
        return this.findById(id);
    }
    async delete(id) {
        const database = await (0, database_1.getDatabase)();
        const result = await database.run('DELETE FROM posts WHERE id = ?', [id]);
        return (result.changes || 0) > 0;
    }
    async syncFromMockApi() {
        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/posts');
            const mockPosts = await response.json();
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
        }
        catch (error) {
            console.error('Error syncing from mock API:', error);
            throw error;
        }
    }
}
exports.PostModel = PostModel;
//# sourceMappingURL=Post.js.map