"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPostRoutes = createPostRoutes;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
// Wrapper functions to handle async middleware
const asyncRequireApiKey = (req, res, next) => {
    (0, auth_1.requireApiKey)(req, res, next).catch(next);
};
const asyncOptionalApiKey = (req, res, next) => {
    (0, auth_1.optionalApiKey)(req, res, next).catch(next);
};
function createPostRoutes(postController) {
    const router = (0, express_1.Router)();
    // Public routes (read-only)
    router.get('/', asyncOptionalApiKey, postController.getPosts.bind(postController));
    router.get('/:id', asyncOptionalApiKey, postController.getPost.bind(postController));
    router.get('/:id/analyze', asyncOptionalApiKey, postController.analyzePost.bind(postController));
    router.get('/:id/analysis-history', asyncOptionalApiKey, postController.getAnalysisHistory.bind(postController));
    router.post('/analyze', asyncOptionalApiKey, postController.analyzeText.bind(postController));
    router.get('/analysis/stats', asyncOptionalApiKey, postController.getAnalysisStats.bind(postController));
    // Protected routes (require API key)
    router.post('/', asyncOptionalApiKey, postController.createPost.bind(postController));
    router.put('/:id', asyncOptionalApiKey, postController.updatePost.bind(postController));
    router.delete('/:id', asyncRequireApiKey, postController.deletePost.bind(postController));
    router.post('/sync', asyncRequireApiKey, postController.syncPosts.bind(postController));
    return router;
}
//# sourceMappingURL=posts.js.map