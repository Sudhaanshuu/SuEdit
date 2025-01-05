import { Image, Send } from 'lucide-react';
import { useState } from 'react';

export function CreatePost() {
  const [content, setContent] = useState('');

  return (
    <div className="bg-dark-100 rounded-lg p-4 mb-6 border border-primary-800/20">
      <div className="flex items-start space-x-4">
        <img
          src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"
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
          <div className="flex justify-between items-center mt-3">
            <button className="text-gray-400 hover:text-primary-500 flex items-center space-x-2">
              <Image size={20} />
              <span>Add Image</span>
            </button>
            <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center space-x-2">
              <Send size={16} />
              <span>Post</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}