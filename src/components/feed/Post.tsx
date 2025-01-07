import { Heart, MessageCircle, Share2, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Post as PostType } from '../../lib/types';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface PostProps {
  post: PostType;
  onUpdate: () => void;
}

export function Post({ post, onUpdate }: PostProps) {
  const { user } = useAuth();
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (!user) return;
    setIsLiking(true);

    try {
      if (post.user_has_liked) {
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('likes')
          .insert([{ post_id: post.id, user_id: user.id }]);
      }
      onUpdate();
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  // Extract count values
  const likesCount = typeof post.likes_count === 'object' ? (post.likes_count as any)?.count ?? 0 : post.likes_count ?? 0;
  const commentsCount = typeof post.comments_count === 'object' ? (post.comments_count as any)?.count ?? 0 : post.comments_count ?? 0;

  return (
    <div className="bg-dark-100 rounded-lg p-4 border border-primary-800/20">
      <div className="flex items-center justify-between mb-4">
        <Link 
          to={`/profile/${post.profile?.username}`}
          className="flex items-center space-x-3 hover:text-primary-500"
        >
          <img
            src={post.profile?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"}
            alt={post.profile?.username}
            className="w-10 h-10 rounded-full border-2 border-primary-500"
          />
          <div>
            <h3 className="font-cyber text-white">{post.profile?.username}</h3>
            <p className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
          </div>
        </Link>
        <button className="text-gray-400 hover:text-primary-500">
          <MoreVertical size={20} />
        </button>
      </div>
      
      <p className="text-gray-200 mb-4">{post.content}</p>
      
      {post.image_url && (
        <img
          src={post.image_url}
          alt="Post content"
          className="rounded-lg w-full mb-4 object-cover max-h-96"
        />
      )}
      
      <div className="flex items-center space-x-4 text-gray-400">
        <button
          onClick={handleLike}
          disabled={isLiking || !user}
          className={`flex items-center space-x-2 ${
            post.user_has_liked ? 'text-primary-500' : 'hover:text-primary-500'
          }`}
        >
          <Heart size={20} fill={post.user_has_liked ? 'currentColor' : 'none'} />
          <span>{likesCount}</span>
        </button>
        <button className="flex items-center space-x-2 hover:text-primary-500">
          <MessageCircle size={20} />
          <span>{commentsCount}</span>
        </button>
        <button className="flex items-center space-x-2 hover:text-primary-500">
          <Share2 size={20} />
        </button>
      </div>
    </div>
  );
}