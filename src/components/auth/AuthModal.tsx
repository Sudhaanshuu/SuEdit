import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        if (username.length < 3) {
          throw new Error('Username must be at least 3 characters long');
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
          throw new Error('Username can only contain letters, numbers, and underscores');
        }
        await signUp(email, password, username);
      }
      onClose();
    } catch (err) {
      console.error('Auth error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-dark-100 p-6 rounded-lg w-full max-w-md relative border border-primary-500/20">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-primary-500"
        >
          <X size={20} />
        </button>
        
        <h2 className="text-2xl font-cyber font-bold text-white mb-6">
          {isLogin ? 'Sign In' : 'Create Account'}
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-dark-200 text-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
              minLength={3}
              pattern="^[a-zA-Z0-9_]+$"
              title="Username can only contain letters, numbers, and underscores"
            />
          )}
          
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-dark-200 text-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
          
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-dark-200 text-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
            minLength={6}
          />
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>
        
        <p className="text-gray-400 text-center mt-4">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary-500 hover:text-primary-400"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}