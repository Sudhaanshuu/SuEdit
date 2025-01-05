import { User, Camera } from 'lucide-react';
import { useState } from 'react';

export function ProfilePage() {
  const [username, setUsername] = useState('CyberUser');
  const [bio, setBio] = useState('');

  return (
    <div className="max-w-2xl mx-auto px-4 pt-24 pb-10">
      <div className="bg-dark-100 rounded-lg p-6 border border-primary-800/20">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-dark-200 border-2 border-primary-500 flex items-center justify-center">
              <User size={48} className="text-gray-400" />
            </div>
            <button className="absolute bottom-0 right-0 bg-primary-600 p-2 rounded-full hover:bg-primary-700">
              <Camera size={16} className="text-white" />
            </button>
          </div>
          
          <div className="mt-6 w-full max-w-md space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-dark-200 text-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-dark-200 text-gray-200 rounded-lg p-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Tell us about yourself..."
              />
            </div>
            
            <button className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}