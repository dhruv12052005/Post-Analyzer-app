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
export declare class PostModel {
    findAll(page?: number, limit?: number): Promise<{
        posts: Post[];
        total: number;
    }>;
    findById(id: number): Promise<Post | null>;
    create(post: CreatePostRequest): Promise<Post>;
    update(id: number, updates: UpdatePostRequest): Promise<Post | null>;
    delete(id: number): Promise<boolean>;
    syncFromMockApi(): Promise<void>;
}
//# sourceMappingURL=Post.d.ts.map