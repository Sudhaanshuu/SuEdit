import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { CreatePost } from './components/CreatePost';
import { Feed } from './components/feed/Feed';
import { Footer } from './components/Footer';
import { ProfilePage } from './components/profile/ProfilePage';
import { UserProfile } from './components/profile/UserProfile';
import { NotificationsPage } from './components/notifications/NotificationsPage';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-300 flex items-center justify-center">
        <div className="text-primary-500">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-dark-300 text-white">
        <Navbar />
        <Routes>
          <Route path="/" element={
            user ? (
              <main className="max-w-2xl mx-auto px-4 pt-20 pb-10">
                <CreatePost />
                <Feed />
              </main>
            ) : (
              <div className="max-w-2xl mx-auto px-4 pt-24 text-center text-gray-400">
                <h2 className="text-2xl font-cyber mb-4">Welcome to Suedit</h2>
                <p>Please sign in to continue</p>
              </div>
            )
          } />
          <Route 
            path="/profile" 
            element={user ? <ProfilePage /> : <Navigate to="/" />} 
          />
          <Route 
            path="/profile/:username" 
            element={<UserProfile />} 
          />
          <Route 
            path="/notifications" 
            element={user ? <NotificationsPage /> : <Navigate to="/" />} 
          />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}
//workinf fine
export default App;
