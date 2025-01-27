import { MoreHorizontal, Heart, MessageCircle, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Post as PostType } from "../../lib/types";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";

interface PostProps {
  post: PostType;
  onUpdate: () => void;
}

export function Post({ post, onUpdate }: PostProps) {
  const { user } = useAuth();
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [showComments, setShowComments] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);
  const commentInputRef = useRef<HTMLInputElement>(null);

  // Close options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        optionsRef.current &&
        !optionsRef.current.contains(event.target as Node)
      ) {
        setIsOptionsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select(
          `
          *,
          profile:profiles(id, username, avatar_url)
        `
        )
        .eq("post_id", post.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleLike = async () => {
    if (!user) return;

    try {
      if (post.user_has_liked) {
        await supabase
          .from("likes")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", user.id);
      } else {
        await supabase.from("likes").insert({
          post_id: post.id,
          user_id: user.id,
        });
      }
      onUpdate();
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleDeletePost = async () => {
    if (!user || user.id !== post.user_id) return;

    const isConfirmed = window.confirm(
      "Are you sure you want to delete this post?"
    );
    if (!isConfirmed) return;

    setLoading(true);
    try {
      await supabase.from("likes").delete().eq("post_id", post.id);
      await supabase.from("comments").delete().eq("post_id", post.id);

      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", post.id)
        .eq("user_id", user.id);

      if (error) throw error;

      onUpdate();
    } catch (error) {
      console.error("Error deleting post:", error);
    } finally {
      setLoading(false);
      setIsOptionsOpen(false);
    }
  };

  const handleAddComment = async () => {
    if (!user || !commentContent.trim()) return;

    try {
      const { error } = await supabase.from("comments").insert({
        post_id: post.id,
        user_id: user.id,
        content: commentContent.trim(),
      });

      if (error) throw error;

      setCommentContent("");
      onUpdate();

      // Refresh comments if already showing
      if (showComments) {
        fetchComments();
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const toggleComments = () => {
    setShowComments(!showComments);
    if (!showComments) {
      fetchComments();
    }
  };

  const totalLikes =
    Array.isArray(post.likes_count) && post.likes_count.length > 0
      ? post.likes_count[0].count
      : 0;
  const totalComments =
    Array.isArray(post.comments_count) && post.comments_count.length > 0
      ? post.comments_count[0].count
      : 0;

  return (
    <div className="bg-dark-100 rounded-lg p-4 border border-primary-800/20 relative">
      {user && user.id === post.user_id && (
        <div className="absolute top-4 right-4">
          <div className="relative">
            <button
              onClick={() => setIsOptionsOpen(!isOptionsOpen)}
              className="text-gray-400 hover:text-gray-200"
            >
              <MoreHorizontal size={20} />
            </button>
            {isOptionsOpen && (
              <div className="absolute right-0 top-full z-10 bg-dark-200 rounded-lg shadow-lg mt-2 w-40">
                <button
                  onClick={handleDeletePost}
                  disabled={loading}
                  className="flex items-center w-full p-2 text-red-500 hover:bg-dark-100 disabled:opacity-50"
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete Post
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-start space-x-4">
        {/* Wrap the avatar and username in a Link to the user's profile */}
        <Link
          to={`/profile/${post.profile?.username}`}
          className="flex items-center space-x-4 hover:text-primary-500"
        >
          <img
            src={post.profile?.avatar_url || "./logo.png"}
            alt={`${post.profile?.username || "User"}'s avatar`}
            className="w-10 h-10 rounded-full border-2 border-primary-500"
          />
          <div>
            <p className="font-medium text-gray-200">
              {post.profile?.username || "Unknown User"}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(post.created_at).toLocaleString()} {/* Add this line */}
            </p>
          </div>
        </Link>
      </div>

      <div className="mt-4">
        <p className="text-gray-400">{post.content}</p>
        {post.image_url && (
          <img
            src={post.image_url}
            alt="Post"
            className="mt-4 rounded-lg max-h-64 w-full object-cover"
          />
        )}
      </div>

      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 ${
              post.user_has_liked ? "text-red-500" : "text-gray-400"
            }`}
          >
            <Heart
              size={20}
              fill={post.user_has_liked ? "currentColor" : "none"}
            />
            <span>{totalLikes}</span>
          </button>
          <button
            onClick={toggleComments}
            className="flex items-center space-x-2 text-gray-400 hover:text-primary-500"
          >
            <MessageCircle size={20} />
            <span>{totalComments}</span>
          </button>
        </div>
      </div>

      {showComments && (
        <div className="mt-4 space-y-4">
          {comments.map((comment) => (
  <div key={comment.id} className="flex items-start space-x-3">
    {/* Link to the commenter's profile */}
    <Link
      to={`/profile/${comment.profile?.username}`}
      className="flex items-center space-x-3 hover:text-primary-500"
    >
      <img
        src={comment.profile?.avatar_url || "./logo.png"}
        alt={`${comment.profile?.username || "User"}'s avatar`}
        className="w-8 h-8 rounded-full"
      />
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-200">
          {comment.profile?.username || "Unknown User"}
        </p>
        <p className="text-gray-400 text-sm">{comment.content}</p>
      </div>
    </Link>
    {user && user.id === comment.user_id && (
      <button
        onClick={async () => {
          const isConfirmed = window.confirm(
            "Are you sure you want to delete this comment?"
          );
          if (!isConfirmed) return;

          try {
            const { error } = await supabase
              .from("comments")
              .delete()
              .eq("id", comment.id);

            if (error) throw error;
            onUpdate();
            fetchComments(); // Refresh comments
          } catch (error) {
            console.error("Error deleting comment:", error);
          }
        }}
        className="text-red-500 hover:text-red-600"
      >
        <Trash2 size={16} />
      </button>
    )}
  </div>
))}

          <div className="flex items-center space-x-3 mt-4">
            <input
              ref={commentInputRef}
              type="text"
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-dark-200 text-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              onClick={handleAddComment}
              disabled={!commentContent.trim()}
              className="bg-primary-600 text-white px-3 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
