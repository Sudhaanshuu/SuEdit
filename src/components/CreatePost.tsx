import { Image, Send } from 'lucide-react';
import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function CreatePost() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!user || !content.trim()) return;

    setLoading(true);
    try {
      let imageUrl = null;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const filePath = `posts/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('public')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('public')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const { error } = await supabase
        .from('posts')
        .insert([
          {
            user_id: user.id,
            content: content.trim(),
            image_url: imageUrl,
          }
        ]);

      if (error) throw error;
      
      setContent('');
      setImageFile(null);
      
      // Create notification for followers
      await supabase.from('notifications').insert([{
        user_id: user.id,
        type: 'new_post',
        post_id: (error as any)?.details?.id, 
        message: `${user.email} created a new post`,
      }])
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-dark-100 rounded-lg p-4 mb-6 border border-primary-800/20">
      <div className="flex items-start space-x-4">
        <img
          src="./logo.png"
          alt="User avatar"
          className="w-10 h-10 rounded-full border-2 border-primary-500"
        />
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full bg-dark-200 text-gray-200 rounded-lg p-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-500"
          />
          {imageFile && (
            <div className="mt-2 relative">
              <img
                src={URL.createObjectURL(imageFile)}
                alt="Preview"
                className="rounded-lg max-h-48 object-cover"
              />
              <button
                onClick={() => setImageFile(null)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
              >
                x
              </button>
            </div>
          )}
          <div className="flex justify-between items-center mt-3">
            <button 
              onClick={handleImageClick}
              className="text-gray-400 hover:text-primary-500 flex items-center space-x-2"
            >
              <Image size={20} />
              <span>Add Image</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <button 
              onClick={handleSubmit}
              disabled={loading || !content.trim()}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
              <span>{loading ? 'Posting...' : 'Post'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}