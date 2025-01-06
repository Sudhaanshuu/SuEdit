import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Post as PostType } from '../../lib/types';
import { Post } from './Post';

export function Feed() {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
    
    // Subscribe to new posts
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
  }, []);

  const handleNewPost = (payload: any) => {
    const newPost = payload.new;
    setPosts(prev => [newPost, ...prev]);
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
      setPosts(data || []);
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