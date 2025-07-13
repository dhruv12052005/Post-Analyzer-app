'use client';

import { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import PostCard from '@/components/PostCard';
import CreatePostModal from '@/components/CreatePostModal';
import Pagination from '@/components/Pagination';
import { backendApi } from '@/lib/api';
import { Post, CreatePostRequest } from '@/types';

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);

  const fetchPosts = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await backendApi.getPosts(page, 10);
      setPosts(response.data);
      setTotalPages(response.totalPages);
      setCurrentPage(page);
    } catch (err) {
      setError('Failed to fetch posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (!Array.isArray(posts)) return;
    const filtered = posts.filter(post =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.body.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPosts(filtered);
  }, [posts, searchTerm]);

  const handleCreatePost = async (postData: CreatePostRequest) => {
    try {
      const newPost = await backendApi.createPost(postData);
      // Optimistically add the new post to the list
      setPosts(prev => [newPost, ...(prev || [])]);
      // Show success message or redirect to the new post
      console.log('Post created successfully:', newPost);
    } catch (err) {
      console.error('Error creating post:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create post';
      // You could add a toast notification here
      alert(`Error: ${errorMessage}`);
      throw err;
    }
  };

  const handlePageChange = (page: number) => {
    fetchPosts(page);
  };

  const handleEditPost = (post: Post) => {
    // For now, we'll just log the edit action
    // In a real app, this would open an edit modal
    console.log('Edit post:', post);
  };

  const handleDeletePost = async (id: number) => {
    try {
      // Call the backend API to delete the post
      await backendApi.deletePost(id);
      // Remove from local state after successful deletion
      setPosts(prev => (prev || []).filter(post => post.id !== id));
      console.log('Post deleted successfully');
    } catch (err) {
      console.error('Error deleting post:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete post';
      alert(`Error: ${errorMessage}`);
    }
  };

  if (loading && posts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => fetchPosts()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Post Analyzer</h1>
              <p className="mt-2 text-gray-600">
                Explore and analyze posts with advanced C++ processing
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} className="mr-2" />
              Create Post
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onEdit={handleEditPost}
              onDelete={handleDeletePost}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredPosts.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search terms.' : 'No posts available.'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePost}
      />
    </div>
  );
}
