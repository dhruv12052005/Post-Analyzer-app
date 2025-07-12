'use client';

import { Post } from '@/types';
import Link from 'next/link';
import { Eye, Edit, Trash2 } from 'lucide-react';

interface PostCardProps {
  post: Post;
  onEdit?: (post: Post) => void;
  onDelete?: (id: number) => void;
}

export default function PostCard({ post, onEdit, onDelete }: PostCardProps) {
  const truncatedBody = post.body.length > 100 
    ? `${post.body.substring(0, 100)}...` 
    : post.body;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {post.title}
          </h3>
          <div className="flex space-x-2 ml-4">
            <Link
              href={`/posts/${post.id}`}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="View details"
            >
              <Eye size={16} />
            </Link>
            {onEdit && (
              <button
                onClick={() => onEdit(post)}
                className="p-2 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-md transition-colors"
                title="Edit post"
              >
                <Edit size={16} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(post.id)}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title="Delete post"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {truncatedBody}
        </p>
        
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>User ID: {post.userId}</span>
          <span>Post ID: {post.id}</span>
        </div>
      </div>
    </div>
  );
} 