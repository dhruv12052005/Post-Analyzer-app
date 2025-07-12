import axios from 'axios';
import { Post, CreatePostRequest, UpdatePostRequest, PostAnalysis, EnhancedAnalysisResult, PaginatedResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const MOCK_API_URL = 'https://jsonplaceholder.typicode.com';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add API key to requests
apiClient.interceptors.request.use((config) => {
  const apiKey = process.env.NEXT_PUBLIC_API_KEY;
  if (apiKey) {
    config.headers['X-API-Key'] = apiKey;
  }
  return config;
});

// Mock API functions
export const mockApi = {
  async getPosts(page = 1, limit = 10): Promise<PaginatedResponse<Post>> {
    try {
      const response = await axios.get(`${MOCK_API_URL}/posts`);
      const posts = response.data;
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedPosts = posts.slice(startIndex, endIndex);
      
      return {
        data: paginatedPosts,
        total: posts.length,
        page,
        limit,
        totalPages: Math.ceil(posts.length / limit),
      };
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw new Error('Failed to fetch posts');
    }
  },

  async getPost(id: number): Promise<Post> {
    try {
      const response = await axios.get(`${MOCK_API_URL}/posts/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching post ${id}:`, error);
      throw new Error(`Post with ID ${id} not found`);
    }
  },

  async createPost(post: CreatePostRequest): Promise<Post> {
    try {
      const response = await axios.post(`${MOCK_API_URL}/posts`, post);
      return response.data;
    } catch (error) {
      console.error('Error creating post:', error);
      throw new Error('Failed to create post');
    }
  },

  async updatePost(id: number, updates: UpdatePostRequest): Promise<Post> {
    try {
      const response = await axios.put(`${MOCK_API_URL}/posts/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error(`Error updating post ${id}:`, error);
      throw new Error(`Failed to update post ${id}`);
    }
  },
};

// Backend API functions
export const backendApi = {
  async getPosts(page = 1, limit = 10): Promise<PaginatedResponse<Post>> {
    const response = await apiClient.get(`/posts?page=${page}&limit=${limit}`);
    return response.data.data;
  },

  async getPost(id: number): Promise<Post> {
    const response = await apiClient.get(`/posts/${id}`);
    return response.data.data;
  },

  async createPost(post: CreatePostRequest): Promise<Post> {
    const response = await apiClient.post('/posts', post);
    return response.data.data;
  },

  async updatePost(id: number, updates: UpdatePostRequest): Promise<Post> {
    const response = await apiClient.put(`/posts/${id}`, updates);
    return response.data.data;
  },

  async analyzePost(id: number): Promise<EnhancedAnalysisResult> {
    const response = await apiClient.get(`/posts/${id}/analyze`);
    return response.data.data;
  },

  async analyzeText(text: string): Promise<EnhancedAnalysisResult> {
    const response = await apiClient.post('/analyze', { text });
    return response.data.data;
  },
};

// Default export for convenience
const api = {
  mock: mockApi,
  backend: backendApi,
};

export default api; 