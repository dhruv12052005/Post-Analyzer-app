'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Save, X, BarChart3, Clock, Hash, TrendingUp } from 'lucide-react';
import { backendApi } from '@/lib/api';
import { Post, PostAnalysis } from '@/types';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = parseInt(params.id as string);

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [analysis, setAnalysis] = useState<PostAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedPost = await backendApi.getPost(postId);
      setPost(fetchedPost);
      setEditTitle(fetchedPost.title);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch post';
      setError(errorMessage);
      console.error('Error fetching post:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!post) return;

    try {
      const updatedPost = await backendApi.updatePost(post.id, { title: editTitle });
      setPost(updatedPost);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating post:', err);
    }
  };

  const handleCancel = () => {
    setEditTitle(post?.title || '');
    setIsEditing(false);
  };

  const analyzePost = async () => {
    if (!post) return;

    try {
      setAnalyzing(true);
      const analysis = await backendApi.analyzePost(post.id);
      setAnalysis(analysis);
    } catch (err) {
      console.error('Error analyzing post:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Post not found'}</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Posts
          </button>
          
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full text-3xl font-bold text-gray-900 bg-white border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      <Save size={16} className="mr-2" />
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                      <X size={16} className="mr-2" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-start">
                  <h1 className="text-3xl font-bold text-gray-900">{post.title}</h1>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Edit size={16} className="mr-2" />
                    Edit
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed text-lg">{post.body}</p>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <span>User ID: {post.userId}</span>
              <span>Post ID: {post.id}</span>
            </div>
          </div>
        </div>

        {/* Analysis Section */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Post Analysis</h2>
            <button
              onClick={analyzePost}
              disabled={analyzing}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              <BarChart3 size={16} className="mr-2" />
              {analyzing ? 'Analyzing...' : 'Analyze Post'}
            </button>
          </div>

          {analysis && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Hash className="text-blue-600 mr-2" size={20} />
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Word Count</p>
                      <p className="text-2xl font-bold text-blue-900">{analysis.wordCount}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <TrendingUp className="text-green-600 mr-2" size={20} />
                    <div>
                      <p className="text-sm text-green-600 font-medium">Keywords</p>
                      <p className="text-2xl font-bold text-green-900">{analysis.keywordCount}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <BarChart3 className="text-yellow-600 mr-2" size={20} />
                    <div>
                      <p className="text-sm text-yellow-600 font-medium">Sentiment</p>
                      <p className="text-2xl font-bold text-yellow-900">
                        {analysis.sentimentScore > 0 ? '+' : ''}{analysis.sentimentScore.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Clock className="text-purple-600 mr-2" size={20} />
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Reading Time</p>
                      <p className="text-2xl font-bold text-purple-900">{analysis.readingTime} min</p>
                    </div>
                  </div>
                </div>
              </div>

              {analysis.keywords && analysis.keywords.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Top Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {!analysis && !analyzing && (
            <div className="text-center py-8">
              <BarChart3 className="text-gray-400 mx-auto mb-4" size={48} />
              <p className="text-gray-600">Click "Analyze Post" to see detailed analysis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 