import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Profile, Post as PostType } from '../../lib/types';
import { Post } from '../feed/Post';

export function UserProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch user's posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          profile:profiles(id, username, avatar_url),
          likes_count:likes(count),
          comments_count:comments(count)
        `)
        .eq('user_id', profileData.id)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;
      setPosts(postsData || []);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-400">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="text-center py-8 text-gray-400">User not found</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-24 pb-10">
      <div className="bg-dark-100 rounded-lg p-6 border border-primary-800/20 mb-6">
        <div className="flex items-center space-x-4">
          <img
            src={profile.avatar_url || "./logo.png"}
            alt={profile.username}
            className="w-24 h-24 rounded-full border-2 border-primary-500"
          />
          <div>
            <h2 className="text-2xl font-cyber text-white">{profile.username}</h2>
            {profile.bio && <p className="text-gray-400 mt-2">{profile.bio}</p>}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {posts.map((post) => (
          <Post key={post.id} post={post} onUpdate={fetchProfile} />
        ))}
        {posts.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No posts yet
          </div>
        )}
      </div>
    </div>
  );
}