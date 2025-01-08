import { Heart, MessageCircle, Share2, MoreVertical, X } from 'lucide-react';
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
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

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

        // Create notification for post owner
        if (post.user_id !== user.id) {
          await supabase.from('notifications').insert([
            {
              user_id: post.user_id,
              type: 'like',
              post_id: post.id,
              actor_id: user.id,
              message: `${user.email} liked your post`,
            }
          ]);
        }
      }
      onUpdate();
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const toggleComments = async () => {
    setShowComments(!showComments);
    if (!showComments) {
      await fetchComments();
    }
  };

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profile:profiles(id, username, avatar_url)
        `)
        .eq('post_id', post.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleComment = async () => {
    if (!user || !comment.trim()) return;

    try {
      const { error } = await supabase
        .from('comments')
        .insert([
          {
            post_id: post.id,
            user_id: user.id,
            content: comment.trim(),
          }
        ]);

      if (error) throw error;

      // Create notification for post owner
      if (post.user_id !== user.id) {
        await supabase.from('notifications').insert([
          {
            user_id: post.user_id,
            type: 'comment',
            post_id: post.id,
            actor_id: user.id,
            message: `${user.email} commented on your post`,
          }
        ]);
      }

      setComment('');
      await fetchComments();
      onUpdate();
    } catch (error) {
      console.error('Error adding comment:', error);
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
            src={post.profile?.avatar_url || "./logo.png"}
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
        <button 
          onClick={toggleComments}
          className={`flex items-center space-x-2 hover:text-primary-500 ${
            showComments ? 'text-primary-500' : ''
          }`}
        >
          <MessageCircle size={20} />
          <span>{commentsCount}</span>
        </button>
        <button className="flex items-center space-x-2 hover:text-primary-500">
          <Share2 size={20} />
        </button>
      </div>

      {showComments && (
        <div className="mt-4 space-y-4">
          {user && (
            <div className="flex space-x-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 bg-dark-200 text-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={handleComment}
                disabled={!comment.trim()}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                Comment
              </button>
            </div>
          )}

          {loadingComments ? (
            <div className="text-center text-gray-400">Loading comments...</div>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-dark-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <img
                      src={comment.profile.avatar_url || "./logo.png"}
                      alt={comment.profile.username}
                      className="w-6 h-6 rounded-full border border-primary-500"
                    />
                    <span className="font-cyber text-sm text-white">
                      {comment.profile.username}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-gray-200 text-sm">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}