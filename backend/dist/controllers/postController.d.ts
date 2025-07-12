import { Request, Response } from 'express';
import { PostModel } from '../models/Post';
import { AuthenticatedRequest } from '../middleware/auth';
export declare class PostController {
    private postModel;
    private analysisService;
    constructor(postModel: PostModel);
    getPosts(req: Request, res: Response): Promise<void>;
    getPost(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    createPost(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updatePost(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deletePost(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    analyzePost(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    analyzeText(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAnalysisHistory(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAnalysisStats(req: Request, res: Response): Promise<void>;
    syncPosts(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=postController.d.ts.map