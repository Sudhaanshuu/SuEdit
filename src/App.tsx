import { useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { CreatePost } from './components/CreatePost';
import { Post } from './components/Post';
import { ProfilePage } from './components/profile/ProfilePage';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-300 flex items-center justify-center">
        <div className="text-primary-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-dark-300">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 pt-24 text-center text-gray-400">
          <h2 className="text-2xl font-cyber mb-4">Welcome to Suedit</h2>
          <p>Please sign in to continue</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-300 text-white">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 pt-20 pb-10">
        <CreatePost />
        <div className="space-y-6">
          {/* Posts will be fetched from Supabase */}
        </div>
      </main>
    </div>
  );
}

export default App;