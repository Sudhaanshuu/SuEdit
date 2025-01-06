import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Post as PostType } from '../../lib/types';
import { Post } from './Post';
import { useAuth } from '../../contexts/AuthContext';

export function Feed() {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchPosts();
    
    const channel = supabase
      .channel('public:posts')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'posts' 
      }, handleNewPost)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleNewPost = async (payload: any) => {
    const newPost = payload.new;
    const { data } = await supabase
      .from('posts')
      .select(`
        *,
        profile:profiles(id, username, avatar_url),
        likes_count:likes(count),
        comments_count:comments(count)
      `)
      .eq('id', newPost.id)
      .single();

    if (data) {
      // Check if the current user has liked this post
      const { data: likeData } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', data.id)
        .eq('user_id', user?.id)
        .single();

      const processedPost = {
        ...data,
        user_has_liked: !!likeData
      };

      setPosts(prev => [processedPost, ...prev]);
    }
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profile:profiles(id, username, avatar_url),
          likes_count:likes(count),
          comments_count:comments(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Process posts to check user likes
      const processedPosts = await Promise.all((data || []).map(async (post) => {
        const { data: likeData } = await supabase
          .from('likes')
          .select('id')
          .eq('post_id', post.id)
          .eq('user_id', user?.id)
          .single();

        return {
          ...post,
          user_has_liked: !!likeData
        };
      }));
      
      setPosts(processedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-400">Loading posts...</div>;
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <Post key={post.id} post={post} onUpdate={fetchPosts} />
      ))}
      {posts.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          No posts yet. Be the first to post!
        </div>
      )}
    </div>
  );
}