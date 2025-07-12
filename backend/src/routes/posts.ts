import { Router } from 'express';
import { PostController } from '../controllers/postController';
import { requireApiKey, optionalApiKey } from '../middleware/auth';

// Wrapper functions to handle async middleware
const asyncRequireApiKey = (req: any, res: any, next: any) => {
  requireApiKey(req, res, next).catch(next);
};

const asyncOptionalApiKey = (req: any, res: any, next: any) => {
  optionalApiKey(req, res, next).catch(next);
};

export function createPostRoutes(postController: PostController): Router {
  const router = Router();

  // Public routes (read-only)
  router.get('/', asyncOptionalApiKey, postController.getPosts.bind(postController));
  router.get('/:id', asyncOptionalApiKey, postController.getPost.bind(postController));
  router.get('/:id/analyze', asyncOptionalApiKey, postController.analyzePost.bind(postController));
  router.get('/:id/analysis-history', asyncOptionalApiKey, postController.getAnalysisHistory.bind(postController));
  router.post('/analyze', asyncOptionalApiKey, postController.analyzeText.bind(postController));
  router.get('/analysis/stats', asyncOptionalApiKey, postController.getAnalysisStats.bind(postController));

  // Protected routes (require API key)
  router.post('/', asyncRequireApiKey, postController.createPost.bind(postController));
  router.put('/:id', asyncRequireApiKey, postController.updatePost.bind(postController));
  router.delete('/:id', asyncRequireApiKey, postController.deletePost.bind(postController));
  router.post('/sync', asyncRequireApiKey, postController.syncPosts.bind(postController));

  return router;
} 