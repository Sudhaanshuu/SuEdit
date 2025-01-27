import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Post as PostType } from '../../lib/types';
import { Post } from './Post';
import { useAuth } from '../../contexts/AuthContext';

export function Feed() {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const POSTS_PER_PAGE = 10;
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

    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100
      ) {
        fetchMorePosts();
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('scroll', handleScroll);
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
      const { data: likeData } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', data.id)
        .eq('user_id', user?.id)
        .maybeSingle();

      const processedPost = {
        ...data,
        profile: data.profile ?? undefined,
        likes_count: data.likes_count ?? [],
        comments_count: data.comments_count ?? [],
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
        .order('created_at', { ascending: false })
        .range(0, POSTS_PER_PAGE - 1);

      if (error) throw error;
      
      const processedPosts = await Promise.all((data || []).map(async (post: any) => {
        const { data: likeData } = await supabase
          .from('likes')
          .select('id')
          .eq('post_id', post.id)
          .eq('user_id', user?.id)
          .maybeSingle();

        return {
          ...post,
          profile: post.profile ?? undefined,
          likes_count: post.likes_count ?? [],
          comments_count: post.comments_count ?? [],
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

  const fetchMorePosts = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profile:profiles(id, username, avatar_url),
          likes_count:likes(count),
          comments_count:comments(count)
        `)
        .order('created_at', { ascending: false })
        .range(page * POSTS_PER_PAGE, (page + 1) * POSTS_PER_PAGE - 1);

      if (error) throw error;
      
      const processedPosts = await Promise.all((data || []).map(async (post: any) => {
        const { data: likeData } = await supabase
          .from('likes')
          .select('id')
          .eq('post_id', post.id)
          .eq('user_id', user?.id)
          .maybeSingle();

        return {
          ...post,
          profile: post.profile ?? undefined,
          likes_count: post.likes_count ?? [],
          comments_count: post.comments_count ?? [],
          user_has_liked: !!likeData
        };
      }));
      
      if (processedPosts.length > 0) {
        setPosts(prev => [...prev, ...processedPosts]);
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error fetching more posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && posts.length === 0) {
    return <div className="text-center py-8 text-gray-400">Loading posts...</div>;
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <Post 
          key={post.id} 
          post={post} 
          onUpdate={fetchPosts} 
        />
      ))}
      {posts.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          No posts yet. Be the first to post!
        </div>
      )}
      {loading && posts.length > 0 && (
        <div className="text-center py-4 text-gray-400">Loading more posts...</div>
      )}
    </div>
  );
}