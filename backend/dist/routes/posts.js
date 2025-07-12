"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPostRoutes = createPostRoutes;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
function createPostRoutes(postController) {
    const router = (0, express_1.Router)();
    // Public routes (read-only)
    router.get('/', auth_1.optionalApiKey, postController.getPosts.bind(postController));
    router.get('/:id', auth_1.optionalApiKey, postController.getPost.bind(postController));
    router.get('/:id/analyze', auth_1.optionalApiKey, postController.analyzePost.bind(postController));
    router.get('/:id/analysis-history', auth_1.optionalApiKey, postController.getAnalysisHistory.bind(postController));
    router.post('/analyze', auth_1.optionalApiKey, postController.analyzeText.bind(postController));
    router.get('/analysis/stats', auth_1.optionalApiKey, postController.getAnalysisStats.bind(postController));
    // Protected routes (require API key)
    router.post('/', auth_1.requireApiKey, postController.createPost.bind(postController));
    router.put('/:id', auth_1.requireApiKey, postController.updatePost.bind(postController));
    router.delete('/:id', auth_1.requireApiKey, postController.deletePost.bind(postController));
    router.post('/sync', auth_1.requireApiKey, postController.syncPosts.bind(postController));
    return router;
}
//# sourceMappingURL=posts.js.map