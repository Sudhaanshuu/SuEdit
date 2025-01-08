import { User, Camera } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export function ProfilePage() {
  const { user } = useAuth();
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, bio, avatar_url')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      if (data) {
        setUsername(data.username);
        setBio(data.bio || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setLoading(true);
      const fileExt = file.name.split('.').pop();
      const filePath = `avatars/${user.id}.${fileExt}`;

      // Upload image
      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setMessage({ text: 'Profile picture updated successfully', type: 'success' });
    } catch (error) {
      console.error('Error updating avatar:', error);
      setMessage({ text: 'Error updating profile picture', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !username.trim()) return;
    setLoading(true);
    setMessage(null);

    try {
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .neq('id', user.id)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingUser) {
        setMessage({ text: 'Username already taken', type: 'error' });
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          username: username.trim(),
          bio: bio.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      setMessage({ text: 'Profile updated successfully', type: 'success' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ text: 'Error updating profile', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 pt-24 pb-10">
      <div className="bg-dark-100 rounded-lg p-6 border border-primary-800/20">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-dark-200 border-2 border-primary-500 flex items-center justify-center overflow-hidden">
              <User size={48} className="text-gray-400" />
            </div>
            <button 
              onClick={handleAvatarClick}
              className="absolute bottom-0 right-0 bg-primary-600 p-2 rounded-full hover:bg-primary-700"
            >
              <Camera size={16} className="text-white" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
          
          <div className="mt-6 w-full max-w-md space-y-4">
            {message && (
              <div className={`p-3 rounded ${
                message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
              }`}>
                {message.text}
              </div>
            )}
            
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-dark-200 text-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-400 mb-1">
                Bio
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-dark-200 text-gray-200 rounded-lg p-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Tell us about yourself..."
              />
            </div>
            
            <button 
              onClick={handleSave}
              disabled={loading || !username.trim()}
              className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}