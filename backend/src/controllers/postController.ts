import { Request, Response } from 'express';
import { PostModel, CreatePostRequest, UpdatePostRequest } from '../models/Post';
import { AuthenticatedRequest } from '../middleware/auth';
import { AnalysisService } from '../services/analysisService';
import { EnhancedAnalysisService } from '../services/enhancedAnalysisService';

export class PostController {
  private postModel: PostModel;
  private analysisService: AnalysisService;
  private enhancedAnalysisService: EnhancedAnalysisService;

  constructor(postModel: PostModel) {
    this.postModel = postModel;
    this.analysisService = new AnalysisService();
    this.enhancedAnalysisService = new EnhancedAnalysisService();
  }

  // Get all posts with pagination
  async getPosts(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const { posts, total } = this.postModel.findAll(page, limit);
      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: {
          data: posts,
          total,
          page,
          limit,
          totalPages
        }
      });
    } catch (error) {
      console.error('Error fetching posts:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch posts'
      });
    }
  }

  // Get a single post by ID
  async getPost(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const post = this.postModel.findById(id);

      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }

      res.json({
        success: true,
        data: post
      });
    } catch (error) {
      console.error('Error fetching post:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch post'
      });
    }
  }

  // Create a new post
  async createPost(req: AuthenticatedRequest, res: Response) {
    try {
      const { title, body, userId }: CreatePostRequest = req.body;

      if (!title || !body || !userId) {
        return res.status(400).json({
          success: false,
          message: 'Title, body, and userId are required'
        });
      }

      const post = this.postModel.create({ title, body, userId });

      res.status(201).json({
        success: true,
        data: post
      });
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create post'
      });
    }
  }

  // Update a post
  async updatePost(req: AuthenticatedRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const updates: UpdatePostRequest = req.body;

      const post = this.postModel.update(id, updates);

      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }

      res.json({
        success: true,
        data: post
      });
    } catch (error) {
      console.error('Error updating post:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update post'
      });
    }
  }

  // Delete a post
  async deletePost(req: AuthenticatedRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const deleted = this.postModel.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }

      res.json({
        success: true,
        message: 'Post deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete post'
      });
    }
  }

  // Enhanced analysis using both C++ and ML services
  async analyzePost(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const post = this.postModel.findById(id);

      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }

      const analysis = await this.enhancedAnalysisService.analyzeText(post.body, post.id);

      res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      console.error('Error analyzing post:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to analyze post'
      });
    }
  }

  // Analyze text directly using enhanced analysis
  async analyzeText(req: Request, res: Response) {
    try {
      const { text } = req.body;

      if (!text) {
        return res.status(400).json({
          success: false,
          message: 'Text is required'
        });
      }

      const analysis = await this.enhancedAnalysisService.analyzeText(text);

      res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      console.error('Error analyzing text:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to analyze text'
      });
    }
  }

  // Get analysis history for a post
  async getAnalysisHistory(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const post = this.postModel.findById(id);

      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }

      const history = await this.enhancedAnalysisService.getAnalysisHistory(id);

      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      console.error('Error fetching analysis history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch analysis history'
      });
    }
  }

  // Get analysis statistics
  async getAnalysisStats(req: Request, res: Response) {
    try {
      const stats = await this.analysisService.getAnalysisStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching analysis stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch analysis stats'
      });
    }
  }

  // Sync posts from external API
  async syncPosts(req: AuthenticatedRequest, res: Response) {
    try {
      await this.postModel.syncFromMockApi();
      
      res.json({
        success: true,
        message: 'Posts synced successfully'
      });
    } catch (error) {
      console.error('Error syncing posts:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to sync posts'
      });
    }
  }
} 