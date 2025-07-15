'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Save, X, Brain, Zap, Target, Activity } from 'lucide-react';
import { backendApi } from '@/lib/api';
import { Post, EnhancedAnalysisResult } from '@/types';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = parseInt(params.id as string);

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [analysis, setAnalysis] = useState<EnhancedAnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const fetchPost = useCallback(async () => {
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
  }, [postId]);

  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId, fetchPost]);

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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Enhanced Analysis Section */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Enhanced Post Analysis</h2>
            <button
              onClick={analyzePost}
              disabled={analyzing}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              <Brain size={16} className="mr-2" />
              {analyzing ? 'Analyzing...' : 'Analyze Post'}
            </button>
          </div>

          {analysis && (
            <>
              {/* Combined Sentiment */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Combined Sentiment Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
                    <div className="flex items-center mb-2">
                      <Brain className="text-blue-600 mr-2" size={20} />
                      <span className="text-sm font-medium text-blue-600">Sentiment</span>
                    </div>
                    <p className="text-3xl font-bold text-blue-900 capitalize">{analysis.combinedSentiment.label}</p>
                    <p className="text-sm text-blue-700">
                      Score: {analysis.combinedSentiment.score !== null && analysis.combinedSentiment.score !== undefined 
                        ? `${analysis.combinedSentiment.score > 0 ? '+' : ''}${analysis.combinedSentiment.score.toFixed(3)}`
                        : 'N/A'
                      }
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                    <div className="flex items-center mb-2">
                      <Target className="text-green-600 mr-2" size={20} />
                      <span className="text-sm font-medium text-green-600">Category</span>
                    </div>
                    <p className="text-3xl font-bold text-green-900 capitalize">{analysis.textInsights.category}</p>
                    <p className="text-sm text-green-700">
                      Readability: {analysis.textInsights.readability}
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
                    <div className="flex items-center mb-2">
                      <Activity className="text-purple-600 mr-2" size={20} />
                      <span className="text-sm font-medium text-purple-600">Processing</span>
                    </div>
                    <p className="text-3xl font-bold text-purple-900">{analysis.processingTime.total}ms</p>
                    <p className="text-sm text-purple-700">
                      C++: {analysis.processingTime.cpp}ms | ML: {analysis.processingTime.ml}ms
                    </p>
                    <p className="text-xs text-purple-600 mt-1">
                      {analysis.analysisQuality.fallbackUsed ? 'Fallback used' : 'All services available'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Service Comparison */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Analysis Services Comparison</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* C++ Analysis */}
                  <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                    <div className="flex items-center mb-4">
                      <Zap className="text-blue-600 mr-2" size={20} />
                      <h4 className="text-lg font-semibold text-blue-900">C++ Analysis</h4>
                      <div className={`ml-auto px-2 py-1 rounded-full text-xs ${
                        analysis.analysisQuality.cppAvailable 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {analysis.analysisQuality.cppAvailable ? 'Available' : 'Fallback'}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-blue-700">Word Count:</span>
                        <span className="font-medium">{analysis.cppAnalysis.wordCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-blue-700">Keywords:</span>
                        <span className="font-medium">{analysis.cppAnalysis.keywordCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-blue-700">Sentiment:</span>
                        <span className="font-medium">
                          {analysis.cppAnalysis.sentimentScore !== null && analysis.cppAnalysis.sentimentScore !== undefined
                            ? `${analysis.cppAnalysis.sentimentScore > 0 ? '+' : ''}${analysis.cppAnalysis.sentimentScore.toFixed(3)}`
                            : 'N/A'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-blue-700">Reading Time:</span>
                        <span className="font-medium">{analysis.cppAnalysis.readingTime} min</span>
                      </div>
                    </div>
                  </div>

                  {/* ML Analysis */}
                  <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                    <div className="flex items-center mb-4">
                      <Brain className="text-green-600 mr-2" size={20} />
                      <h4 className="text-lg font-semibold text-green-900">ML Analysis</h4>
                      <div className={`ml-auto px-2 py-1 rounded-full text-xs ${
                        analysis.analysisQuality.mlAvailable 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {analysis.analysisQuality.mlAvailable ? 'Available' : 'Fallback'}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-green-700">Sentiment:</span>
                        <span className="font-medium capitalize">{analysis.mlAnalysis.sentiment_label}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-green-700">Subjectivity:</span>
                        <span className="font-medium">
                          {analysis.mlAnalysis.subjectivity_score !== null && analysis.mlAnalysis.subjectivity_score !== undefined
                            ? `${(analysis.mlAnalysis.subjectivity_score * 100).toFixed(1)}%`
                            : 'N/A'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-green-700">Category:</span>
                        <span className="font-medium capitalize">{analysis.mlAnalysis.text_category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-green-700">Sentiment Score:</span>
                        <span className="font-medium">
                          {analysis.mlAnalysis.sentiment_score !== null && analysis.mlAnalysis.sentiment_score !== undefined
                            ? `${analysis.mlAnalysis.sentiment_score > 0 ? '+' : ''}${analysis.mlAnalysis.sentiment_score.toFixed(3)}`
                            : 'N/A'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Topics */}
              {analysis.textInsights.keyTopics && analysis.textInsights.keyTopics.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Key Topics & Phrases</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.textInsights.keyTopics.map((topic, index) => (
                      <span
                        key={index}
                        className="px-3 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 rounded-full text-sm font-medium border border-purple-200"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Service Status */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Service Status</h3>
                <div className="flex space-x-4 text-sm">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      analysis.analysisQuality.cppAvailable ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span>C++ Service: {analysis.analysisQuality.cppAvailable ? 'Online' : 'Offline'}</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      analysis.analysisQuality.mlAvailable ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span>ML Service: {analysis.analysisQuality.mlAvailable ? 'Online' : 'Offline'}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {!analysis && !analyzing && (
            <div className="text-center py-8">
              <Brain className="text-gray-400 mx-auto mb-4" size={48} />
              <p className="text-gray-600">Click &quot;Analyze Post&quot; to see enhanced analysis with C++ and ML insights</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 