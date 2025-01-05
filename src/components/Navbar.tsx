import { Search, Bell, Menu, User } from 'lucide-react';
import { useState } from 'react';
import { AuthModal } from './auth/AuthModal';

export function Navbar() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-dark-200/80 backdrop-blur-md border-b border-primary-800/20 z-40">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-cyber font-bold bg-gradient-to-r from-primary-400 to-primary-600 text-transparent bg-clip-text">
                Suedit
              </h1>
            </div>

            <div className="hidden md:block flex-1 max-w-xl mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search Suedit..."
                  className="w-full bg-dark-100 text-gray-200 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-500"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="text-gray-400 hover:text-primary-500">
                <Bell size={20} />
              </button>
              <button className="text-gray-400 hover:text-primary-500">
                <User size={20} />
              </button>
              <button className="md:hidden text-gray-400 hover:text-primary-500">
                <Menu size={20} />
              </button>
              <button 
                onClick={() => setIsAuthOpen(true)}
                className="hidden md:block bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <AuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </>
  );
}