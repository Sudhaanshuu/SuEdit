import { Heart, MessageCircle, Share2, MoreVertical } from 'lucide-react';
import { useState } from 'react';

interface PostProps {
  username: string;
  avatar: string;
  content: string;
  image?: string;
  timestamp: string;
}

export function Post({ username, avatar, content, image, timestamp }: PostProps) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);

  const handleLike = () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
  };

  return (
    <div className="bg-dark-100 rounded-lg p-4 mb-4 border border-primary-800/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={avatar}
            alt={username}
            className="w-10 h-10 rounded-full border-2 border-primary-500"
          />
          <div>
            <h3 className="font-cyber text-white">{username}</h3>
            <p className="text-xs text-gray-400">{timestamp}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-primary-500">
          <MoreVertical size={20} />
        </button>
      </div>
      
      <p className="text-gray-200 mb-4">{content}</p>
      
      {image && (
        <img
          src={image}
          alt="Post content"
          className="rounded-lg w-full mb-4 object-cover max-h-96"
        />
      )}
      
      <div className="flex items-center space-x-4 text-gray-400">
        <button
          onClick={handleLike}
          className={`flex items-center space-x-2 ${
            liked ? 'text-primary-500' : 'hover:text-primary-500'
          }`}
        >
          <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
          <span>{likes}</span>
        </button>
        <button className="flex items-center space-x-2 hover:text-primary-500">
          <MessageCircle size={20} />
          <span>0</span>
        </button>
        <button className="flex items-center space-x-2 hover:text-primary-500">
          <Share2 size={20} />
        </button>
      </div>
    </div>
  );
}